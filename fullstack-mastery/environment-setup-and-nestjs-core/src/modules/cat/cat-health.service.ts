import { Injectable, Logger } from '@nestjs/common';
import { CatFoodService } from './cat-food.service';

/**
 * CatHealthService — mid-level provider in the DI chain.
 * Depends on CatFoodService (injected by NestJS IoC Container).
 * Handles health checks and feeding schedules.
 */
@Injectable()
export class CatHealthService {
  private readonly logger = new Logger(CatHealthService.name);

  // NestJS automatically injects CatFoodService — no "new" keyword needed!
  constructor(private readonly catFoodService: CatFoodService) { }

  checkHealth(): string {
    const menu = this.catFoodService.getMenu();
    this.logger.log(`🩺 Health check: cat has access to ${menu.length} food types.`);
    return `Cat is healthy! Available foods: ${menu.join(', ')}`;
  }


  feedCat(food: string): string {
    const meal = this.catFoodService.prepareMeal(food);
    return `🐱 Cat received: ${meal}`;
  }
}
