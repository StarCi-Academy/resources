import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';

/**
 * gRPC Controller cho Product Service
 * (EN: gRPC Controller for Product Service)
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('ProductService', 'FindAll')
  findAll() {
    return this.appService.findAll();
  }

  @GrpcMethod('ProductService', 'FindOne')
  findOne(data: { id: number }) {
    return this.appService.findOne(data.id);
  }

  @GrpcMethod('ProductService', 'Create')
  create(data: { name: string; price: number; stock: number }) {
    return this.appService.create(data.name, data.price, data.stock);
  }
}
