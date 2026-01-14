import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Catálogo público (lo llama el gateway)
  // Gateway probablemente manda query params como objeto: { category, standId, minPrice, maxPrice }
  @MessagePattern({ cmd: 'products.findCatalog' })
  async findCatalog(@Payload() query: any) {
    try {
      // Forzamos onlyAvailable=true en catálogo público
      return await this.productsService.findCatalog(query);
    } catch (e: any) {
      throw new RpcException(e?.message || 'Error obteniendo catálogo');
    }
  }

  // CRUD (para emprendedor) - si luego lo conectan por gateway
  // Aquí tu service espera solo dto, así que payload debe ser CreateProductDto
  @MessagePattern({ cmd: 'products.create' })
  async create(@Payload() dto: CreateProductDto) {
    try {
      return await this.productsService.create(dto);
    } catch (e: any) {
      throw new RpcException(e?.message || 'Error creando producto');
    }
  }

  @MessagePattern({ cmd: 'products.update' })
  async update(@Payload() payload: { id: string; dto: UpdateProductDto }) {
    try {
      return await this.productsService.update(payload.id, payload.dto);
    } catch (e: any) {
      throw new RpcException(e?.message || 'Error actualizando producto');
    }
  }

  @MessagePattern({ cmd: 'products.remove' })
  async remove(@Payload() payload: { id: string }) {
    try {
      await this.productsService.remove(payload.id);
      return { ok: true };
    } catch (e: any) {
      throw new RpcException(e?.message || 'Error eliminando producto');
    }
  }

  // RPCs requeridos por ms-orders
  @MessagePattern({ cmd: 'products_get_many_for_order' })
  async getManyForOrder(@Payload() payload: { items: { productId: string; quantity: number }[] }) {
    try {
      return await this.productsService.getManyForOrder(payload.items);
    } catch (e: any) {
      throw new RpcException(e?.message || 'Error verificando productos para pedido');
    }
  }

  @MessagePattern({ cmd: 'products_decrease_stock' })
  async decreaseStock(@Payload() payload: { items: { productId: string; quantity: number }[] }) {
    try {
      await this.productsService.decreaseStock(payload.items);
      return { ok: true };
    } catch (e: any) {
      throw new RpcException(e?.message || 'Error descontando stock');
    }
  }
}
