import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CatalogController } from './catalog.controller';
import { Product } from './entities/product.entity';
import { ProductsRpcController } from './products.rpc.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController, CatalogController,ProductsRpcController],
  providers: [ProductsService],
})
export class ProductsModule {}
