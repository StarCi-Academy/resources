import { registerAs } from '@nestjs/config';

/**
 * logConfig — ConfigFactory cho cấu hình logging.
 * Namespace 'log' chứa tất cả tùy chọn liên quan đến Winston và Loki.
 * (EN: ConfigFactory for logging configuration.
 * The 'log' namespace contains all Winston and Loki related options.)
 *
 * Cách dùng (EN: Usage):
 *   @Inject(logConfig.KEY) private config: ConfigType<typeof logConfig>
 */
export const logConfig = registerAs('log', () => ({
  // Level log tối thiểu — production nên để 'warn', local để 'debug'
  // (EN: Minimum log level — production should use 'warn', local use 'debug')
  level: process.env.LOG_LEVEL ?? 'info',

  // Đường dẫn file log — rỗng = tắt file logging
  // (EN: Log file path — empty string = file logging disabled)
  filePath: process.env.LOG_FILE_PATH ?? '',

  // Cấu hình Loki (EN: Loki configuration)
  loki: {
    // Bật/tắt Loki transport — true ở production, false ở local
    // (EN: Enable/disable Loki transport — true in production, false locally)
    enabled: process.env.LOKI_ENABLED === 'true',

    // URL của Loki instance (EN: URL of the Loki instance)
    host: process.env.LOKI_HOST ?? 'http://localhost:3100',

    // Label phân biệt app trong Grafana — giúp filter log theo môi trường
    // (EN: Label to identify the app in Grafana — helps filter logs by environment)
    appLabel: process.env.LOKI_APP_LABEL ?? 'nestjs-app',
  },
}));
