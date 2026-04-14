import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';

/**
 * gRPC Controller cho User Service
 * (EN: gRPC Controller for User Service)
 *
 * Xử lý gRPC calls từ gateway-service, không phải HTTP requests
 * (EN: Handles gRPC calls from gateway-service, not HTTP requests)
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * gRPC method: Lấy tất cả users
   * (EN: gRPC method: Get all users)
   */
  @GrpcMethod('UserService', 'FindAll')
  findAll() {
    // Trả về danh sách users dưới dạng gRPC response
    // (EN: Return users list as gRPC response)
    return this.appService.findAll();
  }

  /**
   * gRPC method: Lấy user theo ID
   * (EN: gRPC method: Get user by ID)
   */
  @GrpcMethod('UserService', 'FindOne')
  findOne(data: { id: number }) {
    // Tìm user bằng ID từ gRPC request (EN: find user by ID from gRPC request)
    return this.appService.findOne(data.id);
  }

  /**
   * gRPC method: Tạo user mới
   * (EN: gRPC method: Create new user)
   */
  @GrpcMethod('UserService', 'Create')
  create(data: { name: string; email: string }) {
    return this.appService.create(data.name, data.email);
  }
}
