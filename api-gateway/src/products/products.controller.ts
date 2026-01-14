import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject('PRODUCTS_SERVICE')
    private readonly productsClient: ClientProxy,
  ) {}

  // Crear producto (solo emprendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('emprendedor')
  @Post()
  create(@Req() req: any, @Body() dto: any) {
    // si luego quieres validar dueño del stand, eso lo hace ms-products consultando ms-stands
    return this.productsClient.send({ cmd: 'products.create' }, dto);
  }

  // Listar productos por stand (puede ser público o solo emprendedor, tú decides)
  @Get('stand/:standId')
  listByStand(@Param('standId') standId: string, @Query() query: any) {
    return this.productsClient.send(
      { cmd: 'products.findByStand' },
      { standId, ...query },
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('emprendedor')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.productsClient.send({ cmd: 'products.update' }, { id, dto });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('emprendedor')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsClient.send({ cmd: 'products.remove' }, { id });
  }
}
