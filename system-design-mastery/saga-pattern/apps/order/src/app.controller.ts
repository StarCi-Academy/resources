import { Controller, Post, Body } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller('order')
export class AppController {
  constructor(
    // Inject service xử lý logic Order (EN: Inject Order logic service)
    private readonly orderService: AppService
  ) { }

  /**
   * API tạo đơn hàng mới
   * (EN: API to create a new order)
   *
   * @param dto - Thông tin sản phẩm và số lượng (EN: product and quantity info)
   * @returns Promise<Order> - Đơn hàng đã tạo (EN: created order)
   */
  @Post()
  async createOrder(@Body() dto: { productId: number, quantity: number }) {
    // Chuyển tiếp xử lý sang service (EN: delegate processing to service)
    return this.orderService.createOrder(dto.productId, dto.quantity);
  }

  /**
   * Lắng nghe sự kiện từ Inventory Service qua Kafka
   * (EN: Listen to events from Inventory Service via Kafka)
   *
   * @param message - Payload sự kiện (EN: event payload)
   */
  @EventPattern('inventory-events')
  async handleInventoryStatus(@Payload() message: any) {
    // Kiểm tra loại sự kiện: Hết hàng (EN: check event type: Out of stock)
    if (message.eventType === 'INVENTORY_OUT_OF_STOCK') {
      // Thực hiện logic bù đắp/hủy đơn (EN: perform compensation/cancel order)
      await this.orderService.handleOutofStockCompensation(message.orderId);
    } 
    // Kiểm tra loại sự kiện: Đã trừ kho (EN: check event type: Inventory deducted)
    else if (message.eventType === 'INVENTORY_DEDUCTED') {
      // Hoàn tất đơn hàng (EN: complete the order)
      await this.orderService.handleInventoryDeducted(message.orderId);
    }
  }
}
