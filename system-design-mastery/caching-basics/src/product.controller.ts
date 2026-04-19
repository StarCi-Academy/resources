import { Body, Controller, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { ProductService } from './product.service';

/**
 * REST controller cho product — minh hoạ cache-aside
 * (EN: REST controller for product — showcasing cache-aside)
 */
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * GET /products/:id — đọc qua Cache-Aside
   * (EN: GET /products/:id — read via Cache-Aside)
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    // Đo thời gian để thấy chênh lệch cache hit vs miss
    // (EN: measure duration to observe cache hit vs miss difference)
    const startedAt = Date.now();
    const result = await this.productService.getById(id);
    const durationMs = Date.now() - startedAt;

    return { ...result, durationMs };
  }

  /**
   * PUT /products/:id/price — update giá và invalidate cache
   * (EN: PUT /products/:id/price — update price and invalidate cache)
   */
  @Put(':id/price')
  updatePrice(
    @Param('id', ParseIntPipe) id: number,
    @Body('price') price: number,
  ) {
    return this.productService.updatePrice(id, price);
  }
}
