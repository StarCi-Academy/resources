import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
import { AppController } from './app.controller';
import { MetricsController } from './metrics.controller';

/**
 * Module gom 3 pillar:
 *  - Logs: nestjs-pino (JSON structured) với trace-id tự inject
 *  - Metrics: prom-client expose /metrics
 *  - Traces: trace-id được generate và gắn vào log mọi request
 *
 * (EN: module bundles the 3 pillars — logs via pino, metrics via prom-client,
 * traces via per-request trace-id)
 */
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        // Dev mode: in đẹp; production: JSON raw
        // (EN: pretty for dev; raw JSON for production)
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : { target: 'pino-pretty', options: { singleLine: true, colorize: true } },

        // Gen trace-id cho mỗi request → binding vào log (EN: per-request trace id binding)
        genReqId: (req) => (req.headers['x-trace-id'] as string) || uuidv4(),
        customProps: (req) => ({ traceId: req.id }),
      },
    }),
  ],
  controllers: [AppController, MetricsController],
})
export class AppModule {}
