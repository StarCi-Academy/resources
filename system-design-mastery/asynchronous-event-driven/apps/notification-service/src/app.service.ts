import { Injectable, Logger } from '@nestjs/common';

/**
 * Service xử lý gửi thông báo khi nhận event từ Kafka
 * (EN: Service handling notification sending when receiving events from Kafka)
 */
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  /**
   * Xử lý event ORDER_CREATED — gửi thông báo
   * (EN: Handle ORDER_CREATED event — send notification)
   *
   * Trong thực tế sẽ gửi email/SMS, ở đây demo bằng log
   * (EN: In production would send email/SMS, here demo with log)
   *
   * @param orderId - ID đơn hàng (EN: order ID)
   * @param productName - Tên sản phẩm (EN: product name)
   * @param quantity - Số lượng (EN: quantity)
   */
  sendOrderNotification(orderId: number, productName: string, quantity: number) {
    // Mô phỏng gửi thông báo (EN: simulate sending notification)
    this.logger.log({
      message: `[Notification] Gửi thông báo đơn hàng mới (EN: sending new order notification)`,
      orderId,
      productName,
      quantity,
      notification: `Đơn hàng #${orderId}: ${quantity}x ${productName} đã được tạo thành công!`,
    });
  }
}
