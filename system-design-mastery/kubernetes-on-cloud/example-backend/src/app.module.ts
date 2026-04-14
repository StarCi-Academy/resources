import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis.module';
import { Item } from './item.entity';

/**
 * Root module — kết nối MySQL qua Kubernetes DNS và đăng ký Redis module
 * (EN: Root module — connect MySQL via Kubernetes DNS and register Redis module)
 */
@Module({
  imports: [
    // Kết nối MySQL thông qua ClusterIP Service DNS (EN: connect MySQL via ClusterIP Service DNS)
    TypeOrmModule.forRoot({
      type: 'mysql',
      // Kubernetes DNS nội bộ: <service-name>.<namespace>.svc.cluster.local
      // (EN: internal Kubernetes DNS: <service-name>.<namespace>.svc.cluster.local)
      host: process.env.MYSQL_HOST || 'mysql-service.default.svc.cluster.local',
      port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
      username: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root123',
      database: process.env.MYSQL_DATABASE || 'demo_db',
      entities: [Item],
      // Tự tạo bảng khi khởi động — chỉ dùng cho môi trường dev (EN: auto-create tables on boot — dev only)
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Item]),
    // Module quản lý kết nối Redis (EN: module managing Redis connection)
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
