import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './app.entity';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @Inject('KAFKA_CLIENT')
    private readonly kafkaClient: ClientKafka,
  ) { }

  async onModuleInit() {
    // Seed initial inventory
    let item = await this.inventoryRepository.findOne({ where: { productId: 1 } });
    if (!item) {
      item = this.inventoryRepository.create({ productId: 1, stock: 0 }); // 0 stock to trigger fail case
      await this.inventoryRepository.save(item);
    }

    let item2 = await this.inventoryRepository.findOne({ where: { productId: 2 } });
    if (!item2) {
      item2 = this.inventoryRepository.create({ productId: 2, stock: 100 }); // >= quantity to trigger success case
      await this.inventoryRepository.save(item2);
    }

    // We need to subscribe to the topics we want to emit if we expect responses, 
    // but for emit only we just connect.
    await this.kafkaClient.connect();
  }

  async checkAndDeductInventory(orderId: number, productId: number, quantity: number) {
    const item = await this.inventoryRepository.findOne({ where: { productId } });

    if (!item || item.stock < quantity) {
      // Trigger lỗi do không đủ hàng tồn kho
      console.log(`[Inventory] Out of stock for product ${productId}. Triggering INVENTORY_OUT_OF_STOCK`);

      this.kafkaClient.emit('inventory-events', {
        eventType: 'INVENTORY_OUT_OF_STOCK',
        orderId,
        productId,
        reason: 'Not enough stock in database',
      });
      return { success: false, message: 'Out of stock, compensation triggered' };
    }

    // Nếu đủ hàng
    item.stock -= quantity;
    await this.inventoryRepository.save(item);
    
    console.log(`[Inventory] Successfully deducted ${quantity} from product ${productId}. Triggering INVENTORY_DEDUCTED`);
    this.kafkaClient.emit('inventory-events', {
      eventType: 'INVENTORY_DEDUCTED',
      orderId,
      productId,
    });
    
    return { success: true, message: 'Inventory deducted successfully, order completed' };
  }
}
