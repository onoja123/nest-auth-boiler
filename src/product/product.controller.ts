import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Query,
  Param,
  Put,
  Delete,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/product.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { UpdateProductDto } from './dto/update.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ProductResponse,
  GetAllProductsResponse,
} from 'src/types/interface/custom';

@UseGuards(AuthGuard())
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post('/create')
  async createBook(
    @Body() product: CreateProductDto,
    @Req() req,
  ): Promise<ProductResponse> {
    try {
      const user = await req.user;
      const data = await this.productService.createProduct(product, user);
      return {
        status: 201,
        success: true,
        data,
      };
    } catch (error) {
      // Handle different types of errors appropriately
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('Error during product creation:', error);
        throw new HttpException(
          'Something went wrong',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('/all')
  async getAll(
    @Query()
    query: ExpressQuery,
  ): Promise<GetAllProductsResponse> {
    const response = await this.productService.getAll(query);
    return {
      status: 201,
      success: true,
      response,
    };
  }

  @Get('/:id')
  async getProduct(@Param('id') id: string): Promise<ProductResponse> {
    try {
      const data = await this.productService.getproduct(id);
      return {
        status: 200, // Change the status code as appropriate (e.g., 200 for successful request)
        success: true,
        data,
      };
    } catch (error) {
      return {
        status: 404,
        success: false,
        data: null,
      };
    }
  }

  @Put(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() product: UpdateProductDto,
  ): Promise<ProductResponse> {
    try {
      const data = await this.productService.updateProduct(id, product);
      return {
        status: 200,
        success: true,
        data,
      };
    } catch (error) {
      return {
        status: 500 || HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        data: null,
      };
    }
  }

  @Delete('/:id')
  async deleteProduct(@Param('id') id: string): Promise<ProductResponse> {
    try {
      const data = await this.productService.deleteProduct(id);
      return {
        status: 200,
        success: true,
        data,
      };
    } catch (error) {
      return {
        status: 500 || HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        data: null,
      };
    }
  }
}
