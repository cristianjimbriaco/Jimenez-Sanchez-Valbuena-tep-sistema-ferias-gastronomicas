import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('catalog')
export class CatalogController {
  constructor(
    @Inject('PRODUCTS_SERVICE') private readonly productsClient: ClientProxy,
  ) {}

  @Get('products')
  async listProducts(
    @Query('standId') standId?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return firstValueFrom(
      this.productsClient.send(
        { cmd: 'products.findCatalog' },
        {
          standId,
          category,
          minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
          maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
        },
      ),
    );
  }
}
