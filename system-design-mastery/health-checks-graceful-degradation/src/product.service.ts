import { Injectable, Logger } from '@nestjs/common';

/**
 * Product service — minh hoạ Graceful Degradation với 3 priority tier
 * (EN: Product service — demonstrates Graceful Degradation with 3 priority tiers)
 *
 * Tier 1 (Core): Checkout — không bao giờ được fallback (EN: never fallback)
 * Tier 2 (Important): Price/Inventory — fallback stale cache nếu DB chết
 * Tier 3 (Nice-to-have): Recommendation — serve static nếu recommender chết
 */
@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  // Flag giả lập recommender chết — trong thực tế là circuit breaker state
  // (EN: flag simulates recommender outage — in real life, from breaker state)
  private recommenderDead = false;

  setRecommenderDead(dead: boolean): void {
    this.recommenderDead = dead;
  }

  /**
   * Tier 3 — Recommendation: nếu recommender chết → trả list evergreen
   * (EN: Tier 3 — Recommendation: if dead, serve static evergreen list)
   *
   * Trigger fallback ngay, không retry — feature phụ không đáng.
   */
  async getRecommendations(userId: number): Promise<{ items: string[]; source: string }> {
    if (this.recommenderDead) {
      this.logger.warn(`[GRACEFUL DEGRADATION] recommender dead → serving static evergreen list`);
      return {
        items: ['Evergreen Top 1', 'Evergreen Top 2', 'Evergreen Top 3'],
        source: 'static-fallback',
      };
    }

    // Giả lập gọi recommender service (EN: simulate recommender call)
    await new Promise((r) => setTimeout(r, 50));
    return {
      items: [`Personalized for user ${userId}: A`, `Personalized for user ${userId}: B`],
      source: 'recommender-service',
    };
  }

  /**
   * Tier 1 — Core flow không được fallback
   * (EN: Tier 1 — core flow, no fallback allowed)
   *
   * Nếu flow này fail → throw để upstream xử lý; KHÔNG "giả vờ thành công".
   */
  async checkout(orderId: number): Promise<{ orderId: number; charged: boolean }> {
    // Giả lập charge credit card — luôn phải chạy thật (EN: must always run for real)
    await new Promise((r) => setTimeout(r, 100));
    return { orderId, charged: true };
  }
}
