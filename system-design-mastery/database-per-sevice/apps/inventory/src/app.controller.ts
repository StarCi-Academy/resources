import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Controller('inventory')
export class AppController {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  @Post()
  async addProduct(@Body() createProductDto: any) {
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  @Get()
  async getInventory() {
    return this.productModel.find().exec();
  }
}
