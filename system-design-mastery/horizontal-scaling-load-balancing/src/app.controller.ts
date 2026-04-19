import { Controller, Get } from '@nestjs/common';
import * as os from 'os';

/**
 * Controller demo — endpoint trả về instance id để thấy được round-robin
 * (EN: Demo controller — exposes instance id so round-robin is visible)
 */
@Controller()
export class AppController {
  /**
   * GET / — trả về instance id, hostname, pid
   * (EN: GET / — returns instance id, hostname, pid)
   *
   * Side effect: không có — idempotent, stateless (EN: none — idempotent, stateless)
   */
  @Get()
  identify() {
    return {
      // Lấy instance id đã gán ở main.ts (EN: instance id assigned in main.ts)
      instanceId: process.env.INSTANCE_ID,
      hostname: os.hostname(),
      pid: process.pid,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /health — health check dummy cho Nginx/LB
   * (EN: GET /health — dummy health check used by Nginx/LB)
   */
  @Get('health')
  health() {
    return { status: 'ok', instanceId: process.env.INSTANCE_ID };
  }
}
