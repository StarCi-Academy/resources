import { Injectable, Logger } from '@nestjs/common';

/**
 * Service xử lý logic nghiệp vụ cho Product (gRPC backend)
 * (EN: Service handling business logic for Product — gRPC backend)
 */
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  // Dữ liệu mẫu trong memory (EN: sample data in memory)
  private products = [
    { id: 1, name: 'Laptop', price: 999.99, stock: 50 },
    { id: 2, name: 'Keyboard', price: 79.99, stock: 200 },
  ];

  /**
   * Lấy danh sách tất cả sản phẩm
   * (EN: Get list of all products)
   */
  findAll() {
    this.logger.log({ message: 'gRPC FindAll — lấy tất cả products (EN: fetching all products)' });
    return { products: this.products };
  }

  /**
   * Lấy sản phẩm theo ID
   * (EN: Get product by ID)
   */
  findOne(id: number) {
    this.logger.log({ message: 'gRPC FindOne — tìm product theo ID (EN: finding product by ID)', id });
    return this.products.find((p) => p.id === id) || {};
  }

  /**
   * Tạo sản phẩm mới
   * (EN: Create new product)
   */
  create(name: string, price: number, stock: number) {
    const id = Math.max(...this.products.map((p) => p.id), 0) + 1;
    const product = { id, name, price, stock };
    this.products.push(product);
    this.logger.log({ message: 'gRPC Create — tạo product thành công (EN: product created)', productId: id });
    return product;
  }
}
