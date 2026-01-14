import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('catalog/products')
export class CatalogController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findCatalog(
    @Query('standId') standId?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.productsService.findAll({
      standId,
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      onlyAvailable: true,
    });
  }
}
