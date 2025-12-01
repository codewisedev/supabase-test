import { Module } from '@nestjs/common';
import { AttributesController } from './attributes.controller';
import { AttributesService } from './attributes.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  providers: [ProductsService, AttributesService],
  controllers: [ProductsController, AttributesController],
  exports: [ProductsService, AttributesService],
})
export class ProductsModule {}
