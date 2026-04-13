import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import LokiTransport from 'winston-loki';

/**
 * Tạo cấu hình Winston dựa trên môi trường và settings từ logConfig.
 * (EN: Generates Winston configuration based on the environment and settings from logConfig.)
 *
 * @param config - Object chứa log settings (EN: Log settings object)
 * @returns WinstonModuleOptions
 */
export const getWinstonOptions = (config: any): WinstonModuleOptions => {
  const transports: winston.transport[] = [];

  // 1. Console Transport — Luôn bật, hỗ trợ hiển thị màu sắc đẹp mắt khi local
  // (EN: Console Transport — Always enabled, supports pretty colors for local development)
  transports.push(
    new winston.transports.Console({
      level: config.level,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context }) => {
          return `[${timestamp}] ${level} [${context || 'System'}]: ${message}`;
        }),
      ),
    }),
  );

  // 2. File Transport — Chỉ bật nếu có LOG_FILE_PATH
  // (EN: File Transport — Only enabled if LOG_FILE_PATH is provided)
  if (config.filePath) {
    transports.push(
      new winston.transports.File({
        filename: config.filePath,
        level: config.level,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(), // Lưu dạng JSON để dễ parse log sau này (EN: Save as JSON for easier parsing later)
        ),
      }),
    );
  }

  // 3. Loki Transport — Đẩy log lên Grafana stack (chỉ bật ở production)
  // (EN: Loki Transport — Pushes logs to Grafana stack (enabled in production only))
  if (config.loki?.enabled) {
    transports.push(
      new LokiTransport({
        host: config.loki.host,
        labels: { app: config.loki.appLabel },
        json: true,
        format: winston.format.json(),
        replaceTimestamp: true,
        onConnectionError: (err) => console.error('Loki Connection Error:', err),
      }),
    );
  }

  return {
    transports,
    // Format mặc định cho app
    // (EN: Default app format)
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'context'] }),
    ),
  };
};
