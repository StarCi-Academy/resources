import { Controller, Get, Post, Body, Param, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';

/**
 * Interface mô tả gRPC UserService methods
 * (EN: Interface describing gRPC UserService methods)
 */
interface UserServiceGrpc {
  findAll(data: Record<string, never>): Observable<{ users: any[] }>;
  findOne(data: { id: number }): Observable<any>;
  create(data: { name: string; email: string }): Observable<any>;
}

/**
 * Interface mô tả gRPC ProductService methods
 * (EN: Interface describing gRPC ProductService methods)
 */
interface ProductServiceGrpc {
  findAll(data: Record<string, never>): Observable<{ products: any[] }>;
  findOne(data: { id: number }): Observable<any>;
  create(data: { name: string; price: number; stock: number }): Observable<any>;
}

/**
 * Gateway Controller — REST API nhận request từ client, gọi gRPC đến backend
 * (EN: Gateway Controller — REST API receives client requests, calls gRPC to backend)
 *
 * Luồng: Client → REST (Gateway) → gRPC → Backend Service → gRPC Response → JSON Response
 * (EN: Flow: Client → REST (Gateway) → gRPC → Backend Service → gRPC Response → JSON Response)
 */
@Controller()
export class AppController implements OnModuleInit {
  private userService: UserServiceGrpc;
  private productService: ProductServiceGrpc;

  constructor(
    @Inject('USER_PACKAGE') private readonly userClient: ClientGrpc,
    @Inject('PRODUCT_PACKAGE') private readonly productClient: ClientGrpc,
  ) {}

  /**
   * Khởi tạo gRPC service stubs khi module init
   * (EN: Initialize gRPC service stubs on module init)
   */
  onModuleInit() {
    // Lấy gRPC service stub từ client (EN: get gRPC service stub from client)
    this.userService = this.userClient.getService<UserServiceGrpc>('UserService');
    this.productService = this.productClient.getService<ProductServiceGrpc>('ProductService');
  }

  // === USER ENDPOINTS ===

  /**
   * REST GET /users — gọi gRPC FindAll đến user-service
   * (EN: REST GET /users — calls gRPC FindAll to user-service)
   */
  @Get('users')
  async findAllUsers() {
    // Chuyển Observable thành Promise để trả về JSON
    // (EN: Convert Observable to Promise to return JSON)
    return firstValueFrom(this.userService.findAll({}));
  }

  @Get('users/:id')
  async findOneUser(@Param('id') id: string) {
    return firstValueFrom(this.userService.findOne({ id: Number(id) }));
  }

  @Post('users')
  async createUser(@Body() dto: { name: string; email: string }) {
    return firstValueFrom(this.userService.create(dto));
  }

  // === PRODUCT ENDPOINTS ===

  @Get('products')
  async findAllProducts() {
    return firstValueFrom(this.productService.findAll({}));
  }

  @Get('products/:id')
  async findOneProduct(@Param('id') id: string) {
    return firstValueFrom(this.productService.findOne({ id: Number(id) }));
  }

  @Post('products')
  async createProduct(@Body() dto: { name: string; price: number; stock: number }) {
    return firstValueFrom(this.productService.create(dto));
  }
}
