import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller()
export class AppController {
  constructor(private readonly product: ProductService) {}

  /**
   * GET /recommendations/:userId — Tier 3, fallback nếu recommender chết
   * (EN: GET /recommendations/:userId — Tier 3 with fallback)
   */
  @Get('recommendations/:userId')
  recommendations(@Param('userId', ParseIntPipe) userId: number) {
    return this.product.getRecommendations(userId);
  }

  /**
   * POST /checkout — Tier 1, không fallback
   * (EN: POST /checkout — Tier 1, no fallback)
   */
  @Post('checkout')
  checkout(@Body() body: { orderId: number }) {
    return this.product.checkout(body.orderId);
  }

  /**
   * PUT /dev/recommender-dead — bật/tắt giả lập recommender chết
   * (EN: PUT /dev/recommender-dead — toggle recommender outage simulation)
   */
  @Put('dev/recommender-dead')
  toggle(@Body() body: { dead: boolean }) {
    this.product.setRecommenderDead(body.dead);
    return { recommenderDead: body.dead };
  }
}
