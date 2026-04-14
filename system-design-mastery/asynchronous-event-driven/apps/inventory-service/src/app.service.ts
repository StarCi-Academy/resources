import { Injectable, Logger } from '@nestjs/common';

/**
 * Service xử lý logic tồn kho khi nhận event từ Kafka
 * (EN: Service handling inventory logic when receiving events from Kafka)
 */
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  // Dữ liệu tồn kho mẫu trong memory (EN: sample inventory data in memory)
  private inventory: Record<string, number> = {
    Laptop: 50,
    Keyboard: 200,
    Mouse: 100,
  };

  /**
   * Xử lý event ORDER_CREATED — trừ tồn kho
   * (EN: Handle ORDER_CREATED event — deduct inventory)
   *
   * @param orderId - ID đơn hàng (EN: order ID)
   * @param productName - Tên sản phẩm (EN: product name)
   * @param quantity - Số lượng cần trừ (EN: quantity to deduct)
   */
  handleOrderCreated(orderId: number, productName: string, quantity: number) {
    // Kiểm tra sản phẩm có trong kho không (EN: check if product exists in inventory)
    const currentStock = this.inventory[productName] ?? 0;

    if (currentStock >= quantity) {
      // Trừ tồn kho (EN: deduct inventory)
      this.inventory[productName] = currentStock - quantity;
      this.logger.log({
        message: `Đã trừ tồn kho (EN: inventory deducted)`,
        orderId,
        productName,
        deducted: quantity,
        remaining: this.inventory[productName],
      });
    } else {
      // Không đủ hàng — log cảnh báo (EN: insufficient stock — log warning)
      this.logger.warn({
        message: `Không đủ tồn kho (EN: insufficient inventory)`,
        orderId,
        productName,
        requested: quantity,
        available: currentStock,
      });
    }
  }

  /**
   * Lấy trạng thái tồn kho hiện tại
   * (EN: Get current inventory status)
   */
  getInventory() {
    return this.inventory;
  }
}
