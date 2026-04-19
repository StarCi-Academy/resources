import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

/**
 * Khởi tạo OpenTelemetry trước khi Nest load app
 * (EN: initialize OpenTelemetry before Nest bootstraps the app)
 *
 * Function này được gọi ngay dòng đầu trong main.ts của mỗi service
 * để auto-instrumentation kịp hook vào HTTP, Express, axios...
 * (EN: must run before app bootstrap so auto-instrumentation can hook
 * into HTTP, Express, axios...)
 *
 * @param serviceName - tên service gửi lên Jaeger
 */
export function startOtel(serviceName: string): NodeSDK {
  const sdk = new NodeSDK({
    // Resource: metadata gắn vào mọi span (service.name là bắt buộc)
    // (EN: resource metadata — service.name is required)
    resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: serviceName }),

    // Gửi span tới Jaeger qua OTLP HTTP (EN: send spans via OTLP HTTP)
    traceExporter: new OTLPTraceExporter({
      url: process.env.OTLP_ENDPOINT ?? 'http://localhost:4318/v1/traces',
    }),

    // Auto-instrumentation: tự động bọc HTTP, Express, axios, fs...
    // (EN: auto-instruments HTTP, Express, axios, fs out-of-the-box)
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
  console.log(`[otel] started for service=${serviceName}`);

  // Graceful shutdown — flush span còn lại khi SIGTERM
  // (EN: graceful shutdown — flush pending spans on SIGTERM)
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('[otel] shutdown'))
      .finally(() => process.exit(0));
  });

  return sdk;
}
