import { Controller, ParseIntPipe } from '@nestjs/common';
import { ProductService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto } from 'src/common/pagination.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern({ cmd: 'create_product' })
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @MessagePattern({ cmd: 'find_all_product' })
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.productService.findAll(paginationDto);
  }

  @MessagePattern({ cmd: 'find_one_product' })
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.productService.findOne(+id);
  }

  @MessagePattern({ cmd: 'update_product' })
  update(@Payload() updateProductDto: UpdateProductDto) {
    return this.productService.update(updateProductDto);
  }

  @MessagePattern({ cmd: 'remove_product' })
  remove(@Payload('id', ParseIntPipe) id: number) {
    return this.productService.remove(+id);
  }

  @MessagePattern({ cmd: 'validate_products' })
  validateProducts(@Payload() id: number[]) {
    return this.productService.validateProducts(id);
  }
}
