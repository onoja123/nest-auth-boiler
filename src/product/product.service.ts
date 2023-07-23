import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schema/product.schema';
import { Model } from 'mongoose';
import { User } from 'src/auth/schema/user.schema';
import { Query } from 'express-serve-static-core';
import { CreateProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update.dto';
import AppError from 'src/utils/error';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<Product>,
  ) {}

  async createProduct(product: CreateProductDto, user: User): Promise<Product> {
    const data = Object.assign(product, { user: user._id });

    const response = await this.productModel.create(data);

    return response;
  }

  async getAll(query: Query): Promise<Product[]> {
    const keyword = query.keyword
      ? {
          title: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};
    const data = await this.productModel.find({ ...keyword });

    return data;
  }

  async getproduct(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  async updateProduct(id: string, product: UpdateProductDto): Promise<Product> {
    const response = await this.productModel.findByIdAndUpdate(id, product);
    return response;
  }

  async deleteProduct(id: string): Promise<Product> {
    const response = await this.productModel.findByIdAndDelete(id);
    return response;
  }
}
