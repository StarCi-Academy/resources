import { Controller, Get, Query } from '@nestjs/common';
import { hostname } from 'os';

/**
 * Factory tạo một controller có endpoint giống nhau cho mọi service
 *
 * @param serviceName - tên service hiển thị ra (EN: service display name)
 * @param data - dataset giả lập riêng cho từng service (EN: per-service mock data)
 * @param basePath - path gốc khi đứng sau Ingress (EN: base path behind Ingress)
 * @returns Controller class đã decorate, có thể import thẳng vào `AppModule`.
 *
 * @remarks Dùng factory để 3 app chia sẻ đúng một phiên bản logic `whoami/list/work/healthz`
 * mà vẫn "đóng gói" dữ liệu + prefix riêng → dễ bảo trì, dễ đọc diff.
 * (EN: Factory so 3 apps share one logic for whoami/list/work/healthz but each
 *  has its own data + path prefix; fewer duplicated files to maintain.)
 */
export function createServiceController<T>(
  serviceName: string,
  basePath: string,
  data: T[],
): any {
  @Controller(basePath)
  class ServiceController {
    // Trong K8s HOSTNAME == pod name; ngoài K8s fallback về OS hostname
    // (EN: inside K8s HOSTNAME == pod name; otherwise fallback to OS hostname)
    private readonly podName = process.env.HOSTNAME ?? hostname();

    /**
     * GET <basePath> — trả về dataset riêng của service này
     *
     * @returns `{ service, pod, count, items }` (EN: service, pod, count, items)
     */
    @Get()
    list(): { service: string; pod: string; count: number; items: T[] } {
      return { service: serviceName, pod: this.podName, count: data.length, items: data };
    }

    /**
     * GET <basePath>/whoami — xác nhận pod phục vụ request
     *
     * @returns `{ service, pod, ts }`
     */
    @Get('whoami')
    whoami(): { service: string; pod: string; ts: string } {
      return { service: serviceName, pod: this.podName, ts: new Date().toISOString() };
    }

    /**
     * GET <basePath>/work?ms= — giả lập xử lý nặng để test least_conn
     *
     * @param ms - delay ms (EN: injected latency in ms)
     * @returns pod + thời gian đã tốn
     */
    @Get('work')
    async work(@Query('ms') ms?: string): Promise<{ service: string; pod: string; tookMs: number }> {
      // Ngủ để mô phỏng request chiếm kết nối lâu (EN: sleep to mimic long-held connection)
      const delay = Number(ms ?? '0');
      await new Promise((r) => setTimeout(r, delay));
      return { service: serviceName, pod: this.podName, tookMs: delay };
    }

    /**
     * GET <basePath>/healthz — probe cho K8s + Ingress
     *
     * @returns `{ service, pod, ok: true }`
     */
    @Get('healthz')
    healthz(): { service: string; pod: string; ok: true } {
      return { service: serviceName, pod: this.podName, ok: true };
    }
  }

  return ServiceController;
}
