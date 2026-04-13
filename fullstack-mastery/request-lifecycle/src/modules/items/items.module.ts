import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

/**
 * ItemsModule — Bounded context cho domain Items.
 * (EN: Bounded context for the Items domain.)
 */
@Module({
  // Controller nhận HTTP request từ bên ngoài
  // (EN: Controller accepting HTTP requests from outside)
  controllers: [ItemsController],

  // Service chứa business logic — được inject vào controller
  // (EN: Service containing business logic — injected into controller)
  providers: [ItemsService],
})
export class ItemsModule {}
