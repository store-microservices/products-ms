import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto } from 'src/common/pagination.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductService extends PrismaClient implements OnModuleInit {
  onModuleInit() {
    this.$connect();
  }

  create(CreateProductDto: CreateProductDto) {
    return this.product.create({
      data: CreateProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalPages = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(Number(totalPages) / limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true },
      }),
      meta: {
        total: totalPages,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id, available: true },
    });

    if (!product) {
      throw new RpcException({
        message: `Product with ID ${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return product;
  }

  async update(updateProductDto: UpdateProductDto) {
    const { id, ...data } = updateProductDto;

    await this.findOne(id);

    return this.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: { available: false },
    });
  }

  async validateProducts(ids: number[]) {
    try {
      ids = Array.from(new Set(ids));

      const products = await this.product.findMany({
        where: { id: { in: ids }, available: true },
        select: { id: true, price: true, name: true },
      });

      if (products.length !== ids.length) {
        const invalidProducts = ids.filter(
          (id) => !products.some((p) => p.id === id),
        );
        throw new RpcException({
          message: `Products with IDs ${invalidProducts.join(', ')} not found`,
          status: HttpStatus.NOT_FOUND,
        });
      }

      return products;
    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
