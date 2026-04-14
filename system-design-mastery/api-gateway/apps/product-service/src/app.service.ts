import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

/**
 * Service xử lý logic nghiệp vụ cho Product
 * (EN: Service handling business logic for Product)
 */
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Lấy danh sách tất cả sản phẩm
   * (EN: Get list of all products)
   *
   * @returns Promise<Product[]> - Danh sách sản phẩm (EN: list of products)
   */
  async findAll(): Promise<Product[]> {
    this.logger.log({ message: 'Lấy danh sách sản phẩm (EN: fetching all products)' });
    return this.productRepository.find();
  }

  /**
   * Lấy sản phẩm theo ID
   * (EN: Get product by ID)
   *
   * @param id - ID sản phẩm (EN: product ID)
   * @returns Promise<Product | null> - Sản phẩm hoặc null (EN: product or null)
   */
  async findOne(id: number): Promise<Product | null> {
    this.logger.log({ message: 'Tìm sản phẩm theo ID (EN: finding product by ID)', id });
    return this.productRepository.findOne({ where: { id } });
  }

  /**
   * Tạo sản phẩm mới
   * (EN: Create new product)
   *
   * @param name - Tên sản phẩm (EN: product name)
   * @param price - Giá sản phẩm (EN: product price)
   * @param stock - Số lượng tồn kho (EN: stock quantity)
   * @returns Promise<Product> - Sản phẩm vừa tạo (EN: newly created product)
   */
  async create(name: string, price: number, stock: number): Promise<Product> {
    // Tạo entity từ dữ liệu đầu vào (EN: create entity from input data)
    const product = this.productRepository.create({ name, price, stock });

    // Lưu vào database (EN: save to database)
    const saved = await this.productRepository.save(product);
    this.logger.log({ message: 'Tạo sản phẩm thành công (EN: product created)', productId: saved.id });
    return saved;
  }
}
