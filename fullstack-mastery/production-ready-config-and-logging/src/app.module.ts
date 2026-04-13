import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { appConfig, logConfig } from './config';
import { getWinstonOptions } from './common/logger/winston.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * AppModule — Nơi khởi tạo hệ thống Config và Logging tập trung.
 * (EN: Root module where centralized Config and Logging systems are initialized.)
 */
@Module({
  imports: [
    // 1. Khởi tạo ConfigModule — Load file .env tương ứng với môi trường
    // (EN: Initialize ConfigModule — Loads the .env file corresponding to the environment)
    ConfigModule.forRoot({
      // Xác định file .env dựa trên NODE_ENV (EN: Determine .env file based on NODE_ENV)
      envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`, '.env'],
      isGlobal: true, // Cho phép dùng ở mọi module khác (EN: Allow usage in all other modules)
      load: [appConfig, logConfig], // Đăng ký các config factories
    }),

    // 2. Khởi tạo WinstonModule Async — Đảm bảo config được load xong mới init logger
    // (EN: Initialize WinstonModule Async — Ensures config is loaded before init logger)
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Lấy log settings từ namespace 'log' (EN: Get log settings from 'log' namespace)
        const loggingSettings = configService.get('log');
        return getWinstonOptions(loggingSettings);
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
