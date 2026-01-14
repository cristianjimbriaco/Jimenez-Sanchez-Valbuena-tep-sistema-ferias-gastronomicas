import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Repository, DataSource } from 'typeorm';

import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

type JwtUser = { userId: string; role: string; email?: string };

// Contratos esperados de otros microservicios (tipado para evitar "unknown")
type StallDto = { id: string; status: 'pendiente' | 'aprobado' | 'activo' };

type ProductForOrderDto = {
  id: string;
  price: string | number; // numeric puede venir como string
  stock: number;          // asumimos number
};

type DecreaseStockResponse = { ok: boolean };

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
      // Si el micro no existe aún → 502 (gateway-like)
      throw new RpcException({
        statusCode: 502,
        message: 'No se pudo validar el puesto (ms-stalls)',
      });
    }
  }

  private async getProductsForOrderOrFail(items: { productId: string; quantity: number }[]): Promise<ProductForOrderDto[]> {
    if (this.useMockExternals) {
      // Mock simple: todos con stock alto y precio fijo
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

  async create(payload: { user: JwtUser; dto: CreateOrderDto }) {
    const { user, dto } = payload;

    // Solo cliente crea pedidos
    this.ensureRole(user, ['cliente']);

    // 1) Validar que el puesto está ACTIVO
    const stall = await this.getStallOrFail(dto.stallId);

    if (stall.status !== 'activo') {
      throw new RpcException({ statusCode: 400, message: 'El puesto no está activo' });
    }

    // 2) Verificar stock y traer precios
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

    // 3) Crear pedido + items en transacción, luego descontar stock
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
        const lineTotal = unitPriceNumber * it.quantity;
        total += lineTotal;

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

      // 4) Descontar stock (si falla, se revierte la transacción)
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
}
