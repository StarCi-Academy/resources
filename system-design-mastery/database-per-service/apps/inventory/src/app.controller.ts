import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// Import từ barrel export (EN: Import from barrel export)
import { Product, ProductDocument } from './schemas';

@Controller('inventory')
export class AppController {
  constructor(
    // Inject Mongoose model (EN: Inject Mongoose model)
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  /**
   * Thêm sản phẩm mới vào kho
   * (EN: Add new product to inventory)
   *
   * @param createProductDto - Thông tin sản phẩm (EN: product info)
   * @returns Promise<Product> - Sản phẩm đã tạo (EN: created product)
   */
  @Post()
  async addProduct(@Body() createProductDto: any) {
    // Khởi tạo instance model (EN: initialize model instance)
    const createdProduct = new this.productModel(createProductDto);
    
    // Lưu vào database MongoDB (EN: save to MongoDB database)
    return createdProduct.save();
  }

  /**
   * Lấy danh sách tồn kho
   * (EN: Get inventory list)
   *
   * @returns Promise<Product[]> - Danh sách sản phẩm (EN: list of products)
   */
  @Get()
  async getInventory() {
    // Truy vấn dữ liệu từ MongoDB (EN: query data from MongoDB)
    return this.productModel.find().exec();
  }
}
