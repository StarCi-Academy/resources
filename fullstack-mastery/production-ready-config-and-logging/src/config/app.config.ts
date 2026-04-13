import { registerAs } from '@nestjs/config';

/**
 * appConfig — ConfigFactory cho các biến cấu hình ứng dụng.
 * Dùng registerAs() để tạo namespace 'app' — tránh đụng độ với các config khác.
 * (EN: ConfigFactory for application configuration variables.
 * Uses registerAs() to create the 'app' namespace — avoids collision with other configs.)
 *
 * Cách dùng (EN: Usage):
 *   @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>
 *   this.config.name  → tên app
 *   this.config.port  → port HTTP
 */
export const appConfig = registerAs('app', () => ({
  // Tên ứng dụng — dùng trong log và Loki label
  // (EN: Application name — used in logs and Loki labels)
  name: process.env.APP_NAME ?? 'nestjs-app',

  // Phiên bản ứng dụng — hữu ích để trace khi deploy nhiều version song song
  // (EN: Application version — useful to trace when deploying multiple versions concurrently)
  version: process.env.APP_VERSION ?? '0.0.1',

  // PORT HTTP server — đọc từ env để deploy linh hoạt trên mọi platform
  // (EN: HTTP server PORT — read from env for flexible deployment on any platform)
  port: parseInt(process.env.PORT ?? '3000', 10),

  // NODE_ENV xác định môi trường: local | development | staging | production
  // (EN: NODE_ENV identifies the environment: local | development | staging | production)
  nodeEnv: process.env.NODE_ENV ?? 'local',
}));
