import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';

import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { ObjectLiteral } from 'typeorm';


type JwtUser = { userId: string; role: string; email?: string };

// Contratos esperados de otros microservicios (tipado para evitar "unknown")
type StallDto = { id: string; status: 'pendiente' | 'aprobado' | 'activo' };

type ProductForOrderDto = {
  id: string;
  price: string | number; // numeric puede venir como string
  stock: number;
};

type DecreaseStockResponse = { ok: boolean };

type AnalyticsPayload = { user: JwtUser; filter?: AnalyticsFilterDto };

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemsRepo: Repository<OrderItem>,
    private readonly dataSource: DataSource,

    @Inject('USERS_AUTH_SERVICE') private readonly usersAuthClient: ClientProxy,
    @Inject('PRODUCTS_SERVICE') private readonly productsClient: ClientProxy,
    @Inject('STALLS_SERVICE') private readonly stallsClient: ClientProxy,
  ) {}

  /**
   * Si aún no existen ms-products / ms-stalls, puedes poner:
   * USE_MOCK_EXTERNALS=true en el entorno y el servicio simula respuestas.
   */
  private readonly useMockExternals = (process.env.USE_MOCK_EXTERNALS || '').toLowerCase() === 'true';

  private ensureRole(user: JwtUser, allowed: string[]) {
    if (!allowed.includes(user.role)) {
      throw new RpcException({ statusCode: 403, message: 'Forbidden (rol no permitido)' });
    }
  }

  private ensureStatusTransition(current: OrderStatus, next: OrderStatus) {
    const allowed: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PREPARING],
      [OrderStatus.PREPARING]: [OrderStatus.READY],
      [OrderStatus.READY]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
    };

    if (!allowed[current]?.includes(next)) {
      throw new RpcException({
        statusCode: 400,
        message: `Transición inválida: ${current} -> ${next}`,
      });
    }
  }

  private async getStallOrFail(stallId: string): Promise<StallDto> {
    if (this.useMockExternals) {
      return { id: stallId, status: 'activo' };
    }

    try {
      const stall = await this.stallsClient
        .send<StallDto>({ cmd: 'stalls_get_by_id' }, { id: stallId })
        .toPromise();

      if (!stall) {
        throw new RpcException({ statusCode: 404, message: 'Puesto no encontrado' });
      }

      return stall;
    } catch (e: any) {
      throw new RpcException({
        statusCode: 502,
        message: 'No se pudo validar el puesto (ms-stalls)',
      });
    }
  }

  private async getProductsForOrderOrFail(items: { productId: string; quantity: number }[]): Promise<ProductForOrderDto[]> {
    if (this.useMockExternals) {
      return items.map((i) => ({ id: i.productId, price: 10, stock: 999 }));
    }

    try {
      const products = await this.productsClient
        .send<ProductForOrderDto[]>(
          { cmd: 'products_get_many_for_order' },
          { items },
        )
        .toPromise();

      return products ?? [];
    } catch (e: any) {
      throw new RpcException({
        statusCode: 502,
        message: 'No se pudo verificar stock/precios (ms-products)',
      });
    }
  }

  private async decreaseStockOrFail(items: { productId: string; quantity: number }[]): Promise<void> {
    if (this.useMockExternals) return;

    try {
      const resp = await this.productsClient
        .send<DecreaseStockResponse>(
          { cmd: 'products_decrease_stock' },
          { items },
        )
        .toPromise();

      if (!resp?.ok) {
        throw new RpcException({ statusCode: 502, message: 'ms-products no confirmó descuento de stock' });
      }
    } catch (e: any) {
      throw new RpcException({
        statusCode: 502,
        message: 'No se pudo descontar stock (ms-products)',
      });
    }
  }

  // ---------------------------
  // Helpers Analytics (TAREA 7)
  // ---------------------------
  private applyDateAndStallFilters<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    filter?: AnalyticsFilterDto,
    ordersAlias: string = 'o',
  ) {
    if (!filter) return qb;

    if (filter.from) qb.andWhere(`${ordersAlias}.created_at >= :from`, { from: filter.from });
    if (filter.to) qb.andWhere(`${ordersAlias}.created_at <= :to`, { to: filter.to });
    if (filter.stallId) qb.andWhere(`${ordersAlias}.stall_id = :stallId`, { stallId: filter.stallId });

    return qb;
  }

  // ---------------------------
  // TAREA 6: Pedidos
  // ---------------------------
  async create(payload: { user: JwtUser; dto: CreateOrderDto }) {
    const { user, dto } = payload;

    this.ensureRole(user, ['cliente']);

    const stall = await this.getStallOrFail(dto.stallId);
    if (stall.status !== 'activo') {
      throw new RpcException({ statusCode: 400, message: 'El puesto no está activo' });
    }

    const requested = dto.items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
    const products = await this.getProductsForOrderOrFail(requested);

    const byId = new Map<string, ProductForOrderDto>(products.map((p) => [p.id, p]));

    for (const it of dto.items) {
      const p = byId.get(it.productId);
      if (!p) {
        throw new RpcException({ statusCode: 400, message: `Producto no existe: ${it.productId}` });
      }
      const stock = Number(p.stock);
      if (stock < it.quantity) {
        throw new RpcException({ statusCode: 400, message: `Stock insuficiente para producto ${it.productId}` });
      }
    }

    return this.dataSource.transaction(async (manager) => {
      let total = 0;

      const order = manager.create(Order, {
        customerId: user.userId,
        stallId: dto.stallId,
        status: OrderStatus.PENDING,
        total: '0.00',
      });

      const savedOrder = await manager.save(Order, order);

      const itemsEntities = dto.items.map((it) => {
        const p = byId.get(it.productId)!;
        const unitPriceNumber = Number(p.price);
        total += unitPriceNumber * it.quantity;

        return manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: unitPriceNumber.toFixed(2),
        });
      });

      await manager.save(OrderItem, itemsEntities);

      savedOrder.total = total.toFixed(2);
      await manager.save(Order, savedOrder);

      await this.decreaseStockOrFail(requested);

      return { order: savedOrder, items: itemsEntities };
    });
  }

  async listByCustomer(payload: { user: JwtUser }) {
    const { user } = payload;
    this.ensureRole(user, ['cliente']);

    return this.ordersRepo.find({
      where: { customerId: user.userId },
      order: { createdAt: 'DESC' },
    });
  }

  async listByStall(payload: { user: JwtUser; stallId: string }) {
    this.ensureRole(payload.user, ['emprendedor', 'organizador']);

    return this.ordersRepo.find({
      where: { stallId: payload.stallId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(payload: { user: JwtUser; orderId: string; dto: UpdateOrderStatusDto }) {
    this.ensureRole(payload.user, ['emprendedor', 'organizador']);

    const order = await this.ordersRepo.findOne({ where: { id: payload.orderId } });
    if (!order) throw new RpcException({ statusCode: 404, message: 'Pedido no encontrado' });

    this.ensureStatusTransition(order.status, payload.dto.status);

    order.status = payload.dto.status;
    await this.ordersRepo.save(order);

    return order;
  }

  // ---------------------------
  // TAREA 7: Estadísticas (organizador)
  // ---------------------------

  /**
   * Ventas por puesto:
   * SUM(total) y COUNT pedidos entregados agrupado por stall_id
   */
  async salesByStall(payload: AnalyticsPayload) {
    this.ensureRole(payload.user, ['organizador']);

    const qb = this.ordersRepo
      .createQueryBuilder('o')
      .select('o.stall_id', 'stallId')
      .addSelect('SUM(o.total)', 'totalSales')
      .addSelect('COUNT(*)', 'ordersCount')
      .where('o.status = :status', { status: OrderStatus.DELIVERED })
      .groupBy('o.stall_id')
      .orderBy('SUM(o.total)', 'DESC');

    this.applyDateAndStallFilters(qb, payload.filter, 'o');

    return qb.getRawMany();
  }

  /**
   * Producto más vendido (por unidades):
   * SUM(quantity) sobre order_items JOIN orders (solo entregados)
   */
  async topProduct(payload: AnalyticsPayload) {
    this.ensureRole(payload.user, ['organizador']);

    const qb = this.itemsRepo
      .createQueryBuilder('oi')
      .innerJoin('orders', 'o', 'o.id = oi.order_id')
      .select('oi.product_id', 'productId')
      .addSelect('SUM(oi.quantity)', 'unitsSold')
      .addSelect('COUNT(DISTINCT o.id)', 'ordersCount')
      .where('o.status = :status', { status: OrderStatus.DELIVERED })
      .groupBy('oi.product_id')
      .orderBy('SUM(oi.quantity)', 'DESC')
      .limit(1);

    // filtros sobre alias 'o'
    this.applyDateAndStallFilters(qb as any, payload.filter, 'o');

    const rows = await qb.getRawMany();
    return rows[0] ?? null;
  }

  /**
   * Volumen total por día:
   * DATE(created_at) + SUM(total) + COUNT(*) (solo entregados)
   */
  async dailyVolume(payload: AnalyticsPayload) {
    this.ensureRole(payload.user, ['organizador']);

    const qb = this.ordersRepo
      .createQueryBuilder('o')
      .select(`DATE(o.created_at)`, 'day')
      .addSelect('SUM(o.total)', 'totalSales')
      .addSelect('COUNT(*)', 'ordersCount')
      .where('o.status = :status', { status: OrderStatus.DELIVERED })
      .groupBy(`DATE(o.created_at)`)
      .orderBy(`DATE(o.created_at)`, 'ASC');

    this.applyDateAndStallFilters(qb, payload.filter, 'o');

    return qb.getRawMany();
  }

  /**
   * Cantidad de pedidos completados (entregados)
   */
  async completedCount(payload: AnalyticsPayload) {
    this.ensureRole(payload.user, ['organizador']);

    const qb = this.ordersRepo
      .createQueryBuilder('o')
      .select('COUNT(*)', 'completed')
      .where('o.status = :status', { status: OrderStatus.DELIVERED });

    this.applyDateAndStallFilters(qb, payload.filter, 'o');

    const row = await qb.getRawOne();
    return { completed: Number(row?.completed ?? 0) };
  }
}
