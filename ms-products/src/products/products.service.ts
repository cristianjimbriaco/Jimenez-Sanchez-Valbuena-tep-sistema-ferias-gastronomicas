import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const stock = dto.stock ?? 0;
    if (stock < 0) throw new BadRequestException('Stock cannot be negative');

    const product = this.repo.create({
      standId: dto.standId,
      name: dto.name.trim(),
      description: dto.description?.trim(),
      category: dto.category.trim(),
      price: dto.price.toFixed(2),
      isAvailable: dto.isAvailable ?? true,
      stock,
    });

    // Regla: sin stock no puede aparecer como disponible
    if (product.stock === 0) product.isAvailable = false;

    return this.repo.save(product);
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findAll(filters?: {
    standId?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    onlyAvailable?: boolean;
  }): Promise<Product[]> {
    const qb = this.repo.createQueryBuilder('p');

    if (filters?.standId) {
      qb.andWhere('p.standId = :standId', { standId: filters.standId });
    }

    if (filters?.category) {
      qb.andWhere('p.category ILIKE :category', {
        category: filters.category.trim(),
      });
    }

    if (filters?.minPrice !== undefined) {
      if (!Number.isFinite(filters.minPrice)) {
        throw new BadRequestException('minPrice must be a valid number');
      }
      qb.andWhere('p.price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters?.maxPrice !== undefined) {
      if (!Number.isFinite(filters.maxPrice)) {
        throw new BadRequestException('maxPrice must be a valid number');
      }
      qb.andWhere('p.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters?.onlyAvailable) {
      qb.andWhere('p.isAvailable = true').andWhere('p.stock > 0');
    }

    qb.orderBy('p.createdAt', 'DESC');
    return qb.getMany();
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.stock !== undefined && dto.stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    if (dto.name !== undefined) product.name = dto.name.trim();
    if (dto.description !== undefined) product.description = dto.description?.trim();
    if (dto.category !== undefined) product.category = dto.category.trim();
    if (dto.price !== undefined) product.price = dto.price.toFixed(2);
    if (dto.isAvailable !== undefined) product.isAvailable = dto.isAvailable;
    if (dto.stock !== undefined) product.stock = dto.stock;

    if (product.stock === 0) product.isAvailable = false;

    return this.repo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.repo.remove(product);
  }

  /**
   * ✅ Catálogo público:
   * - soloAvailable = true por defecto
   * - filtros: category, standId, minPrice, maxPrice
   */
  async findCatalog(query: any): Promise<Product[]> {
    const filters = {
      standId: query?.standId,
      category: query?.category,
      minPrice: query?.minPrice !== undefined ? Number(query.minPrice) : undefined,
      maxPrice: query?.maxPrice !== undefined ? Number(query.maxPrice) : undefined,
      onlyAvailable: true,
    };

    return this.findAll(filters);
  }

  /**
   * ✅ RPC para ms-orders: traer price/stock por ids
   * expected return: [{ id, price, stock }]
   */
  async getManyForOrder(items: { productId: string; quantity: number }[]) {
    const ids = items.map((i) => i.productId);
    if (ids.length === 0) return [];

    const products = await this.repo.find({
      where: { id: In(ids) },
      select: ['id', 'price', 'stock', 'isAvailable'],
    });

    // ms-orders valida stock y existencia; aquí devolvemos lo que tenemos
    return products.map((p) => ({
      id: p.id,
      price: p.price,
      stock: p.stock,
      isAvailable: p.isAvailable,
    }));
  }

  /**
   * ✅ RPC para ms-orders: descontar stock en transacción
   * Si cualquier producto queda < 0 → lanza error
   */
  async decreaseStock(items: { productId: string; quantity: number }[]) {
    if (items.length === 0) return;

    await this.repo.manager.transaction(async (trx) => {
      const ids = items.map((i) => i.productId);
      const products = await trx.find(Product, { where: { id: In(ids) } });

      const byId = new Map(products.map((p) => [p.id, p]));

      for (const it of items) {
        const p = byId.get(it.productId);
        if (!p) throw new BadRequestException(`Product not found: ${it.productId}`);

        const next = Number(p.stock) - Number(it.quantity);
        if (next < 0) throw new BadRequestException(`Insufficient stock for product ${it.productId}`);

        p.stock = next;
        if (p.stock === 0) p.isAvailable = false;

        await trx.save(Product, p);
      }
    });
  }
}
