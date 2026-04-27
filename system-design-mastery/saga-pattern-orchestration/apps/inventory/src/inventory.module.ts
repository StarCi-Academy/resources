import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryEntity } from './entity/inventory.entity';
import { Transport } from '@nestjs/microservices';
import { ClientsModule } from '@nestjs/microservices';
import { ProductEntity } from './entity/product.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'sqlite/inventory.sqlite', // Tên file DB sẽ được tạo ở thư mục gốc project
      entities: [InventoryEntity, ProductEntity],
      synchronize: true, // Tự động tạo table dựa trên Entity (Chỉ nên dùng khi dev)
    }),
    TypeOrmModule.forFeature([InventoryEntity, ProductEntity]),
    ClientsModule.register([
      {
        name: 'INVENTORY_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'inventory',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'inventory-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
