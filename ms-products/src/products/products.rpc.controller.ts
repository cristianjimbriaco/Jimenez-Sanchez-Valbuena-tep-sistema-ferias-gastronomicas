import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

type FindCatalogPayload = {
  standId?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
};

@Controller()
export class ProductsRpcController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern({ cmd: 'products.findCatalog' })
  findCatalog(@Payload() data: FindCatalogPayload) {
    // si quieres forzar catálogo público: onlyAvailable true
    return this.productsService.findAll({
      standId: data?.standId,
      onlyAvailable: true,
      // si luego soportas category/minPrice/maxPrice en el service, pásalos aquí
      category: data?.category,
      minPrice: data?.minPrice,
      maxPrice: data?.maxPrice,
    } as any);
  }

  @MessagePattern({ cmd: 'products.create' })
  create(@Payload() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}
