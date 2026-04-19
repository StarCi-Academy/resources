import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
import { AppController } from './app.controller';

/**
 * Module cấu hình Pino log theo 2 đích:
 *   1) stdout (pretty khi dev, raw JSON khi production)
 *   2) Loki qua pino-loki transport (ship log tự động)
 *
 * (EN: configures Pino to dual-ship logs — stdout + Loki via pino-loki transport)
 */
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        // Multi-target: stdout + loki (EN: dual targets)
        transport: {
          targets: [
            // Log ra stdout cho developer coi local (EN: stdout for local dev)
            {
              target: 'pino-pretty',
              level: 'info',
              options: { singleLine: true, colorize: true },
            },
            // Gửi log tới Loki (EN: ship logs to Loki)
            {
              target: 'pino-loki',
              level: 'info',
              options: {
                host: process.env.LOKI_URL ?? 'http://localhost:3100',
                batching: true,
                interval: 2,
                // Labels cho Loki — giúp filter (EN: Loki labels for filtering)
                labels: {
                  app: 'centralized-logging-demo',
                  env: process.env.NODE_ENV ?? 'dev',
                },
              },
            },
          ],
        },

        // Trace id per request (EN: per-request trace id)
        genReqId: (req) => (req.headers['x-trace-id'] as string) || uuidv4(),
        customProps: (req) => ({ traceId: req.id }),
      },
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
