import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      qb.andWhere('LOWER(p.category) = LOWER(:category)', {
        category: filters.category.trim(),
      });
    }

    // price está en DB como numeric; se compara bien en SQL
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
}
