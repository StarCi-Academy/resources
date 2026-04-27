import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './app.entity';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @Inject('KAFKA_CLIENT')
    private readonly kafkaClient: ClientKafka,
  ) { }

  /**
   * Khởi tạo module, gieo dữ liệu tồn kho ban đầu
   * (EN: Initialize module, seed initial inventory data)
   */
  async onModuleInit() {
    // Gieo SP 1: 0 hàng (để test thất bại) - (EN: Seed Product 1 with 0 stock to test failure)
    let item = await this.inventoryRepository.findOne({ where: { productId: 1 } });
    if (!item) {
      item = this.inventoryRepository.create({ productId: 1, stock: 0 });
      await this.inventoryRepository.save(item);
    }

    // Gieo SP 2: 100 hàng (để test thành công) - (EN: Seed Product 2 with 100 stock to test success)
    let item2 = await this.inventoryRepository.findOne({ where: { productId: 2 } });
    if (!item2) {
      item2 = this.inventoryRepository.create({ productId: 2, stock: 100 });
      await this.inventoryRepository.save(item2);
    }

    // Kết nối đến Kafka (EN: Connect to Kafka)
    await this.kafkaClient.connect();
  }

  /**
   * Kiểm tra và trừ tồn kho (Execute flow)
   * (EN: Check and deduct inventory)
   *
   * @param orderId - ID đơn hàng (EN: order ID)
   * @param productId - ID sản phẩm (EN: product ID)
   * @param quantity - Số lượng (EN: quantity)
   */
  async checkAndDeductInventory(orderId: number, productId: number, quantity: number) {
    // 1. Prepare: Tìm kiếm sản phẩm trong kho (EN: search for product in inventory)
    const item = await this.inventoryRepository.findOne({ where: { productId } });

    // 2. Sign/Validate: Kiểm tra tính khả dụng (EN: check availability)
    if (!item || item.stock < quantity) {
      this.logger.error(`Out of stock for product ${productId}. Triggering INVENTORY_OUT_OF_STOCK`);

      // Gửi event thất bại cho Saga (EN: emit failure event for Saga)
      this.kafkaClient.emit('inventory-events', {
        eventType: 'INVENTORY_OUT_OF_STOCK',
        orderId,
        productId,
        reason: 'Not enough stock',
      });
      return { success: false, message: 'Out of stock, compensation triggered' };
    }

    // 3. Execute: Trừ kho (EN: deduct inventory)
    item.stock -= quantity;
    await this.inventoryRepository.save(item);
    
    // 4. Confirm: Thông báo thành công (EN: notify success)
    this.logger.log(`Successfully deducted ${quantity} from product ${productId}.`);
    
    this.kafkaClient.emit('inventory-events', {
      eventType: 'INVENTORY_DEDUCTED',
      orderId,
      productId,
    });
    
    return { success: true, message: 'Inventory deducted successfully' };
  }
}
