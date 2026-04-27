import { Injectable, Logger } from '@nestjs/common';
import { InventoryEntity } from './entity/inventory.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryStatus } from './inventory.enum';
import { ProductEntity } from './entity/product.entity';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  /**
   * Tao san pham va khoi tao ton kho mac dinh (EN: Create product and initialize default inventory)
   *
   * @param payload - Du lieu tao product moi (EN: Payload for creating a new product)
   * @returns Ket qua tao product va inventory (EN: Creation result including product and inventory)
   */
  async addProduct(payload: any) {
    const product = this.productRepository.create({
      name: payload.name,
      description: payload.description,
    });

    const savedProduct = await this.productRepository.save(product);

    const inventory = this.inventoryRepository.create({
      productId: savedProduct.id,
      quantity: 10,
    });

    
    const savedInventory = await this.inventoryRepository.save(inventory);

    return {
      product: savedProduct,
      inventory: savedInventory ,
      status: 'SUCCESS',
    };
  }

  /**
   * Tru so luong ton kho theo yeu cau saga (EN: Deduct inventory quantity by saga request)
   *
   * @param payload - Message tru kho, gom orderId/productId/quantity/idempotencyKey (EN: Deduct message including orderId/productId/quantity/idempotencyKey)
   * @returns Ket qua tru kho thanh cong hoac that bai (EN: Inventory deduction success/failure result)
   */
  async deduct(payload: any) {
    // Log message den de theo doi inventory step tren terminal (EN: Log incoming message to track inventory step in terminal)
    this.logger.log(
      `[Inventory] Deduct inventory - orderId=${payload.orderId ?? 'N/A'} productId=${payload.productId} quantity=${payload.quantity} idempotencyKey=${payload.idempotencyKey ?? 'N/A'}`,
    );

    const inventory = await this.inventoryRepository.findOne({ where: {
      productId: payload.productId,
    } });

    if (!inventory) {
      // Log warning khi inventory khong ton tai de debug nhanh (EN: Log warning when inventory does not exist for faster debugging)
      this.logger.warn(
        `[Inventory] Inventory not found - productId=${payload.productId} idempotencyKey=${payload.idempotencyKey ?? 'N/A'}`,
      );
      return {
        orderId: payload.orderId,
        productId: payload.productId,
        status: InventoryStatus.DEDUCT_FAILED,
        reason: 'Inventory not found',
      };
    }

    if (inventory.quantity < payload.quantity) {
      // Log warning khi ton kho khong du cho order hien tai (EN: Log warning when stock is insufficient for current order)
      this.logger.warn(
        `[Inventory] Inventory insufficient - productId=${payload.productId} available=${inventory.quantity} requested=${payload.quantity} idempotencyKey=${payload.idempotencyKey ?? 'N/A'}`,
      );
      return {
        orderId: payload.orderId,
        productId: payload.productId,
        status: InventoryStatus.DEDUCT_FAILED,
        reason: 'Not enough inventory quantity in stock',
      };
    }

    inventory.quantity -= payload.quantity;
    await this.inventoryRepository.save(inventory);
    this.logger.log(
      `[Inventory] Deduct success - orderId=${payload.orderId ?? 'N/A'} productId=${payload.productId} remaining=${inventory.quantity} idempotencyKey=${payload.idempotencyKey ?? 'N/A'}`,
    );

    return {
      orderId: payload.orderId,
      productId: payload.productId,
      status: InventoryStatus.DEDUCTED,
    };
  }
}