import { Body, Controller, Logger, Post } from '@nestjs/common';

/**
 * Payload Alertmanager gửi qua webhook
 * (EN: Alertmanager webhook payload)
 */
interface AlertmanagerPayload {
  status: 'firing' | 'resolved';
  alerts: Array<{
    status: 'firing' | 'resolved';
    labels: Record<string, string>;
    annotations: Record<string, string>;
    startsAt: string;
    endsAt: string;
  }>;
}

/**
 * Webhook receiver — mô phỏng bước đầu của "incident response"
 *
 * Thực tế Alertmanager sẽ gọi PagerDuty / Slack / OpsGenie; ở đây ta log
 * theo severity và phân loại P1/P2 giúp đội on-call triage nhanh.
 *
 * (EN: Webhook receiver mimicking the first step of incident response.
 *  Normally Alertmanager calls PagerDuty/Slack/OpsGenie; here we log by
 *  severity so the on-call team can triage quickly.)
 */
@Controller('alerts')
export class AlertsController {
  private readonly logger = new Logger('Alerts');

  /**
   * Nhận alert từ Alertmanager
   *
   * @param payload - body do Alertmanager POST (EN: body posted by Alertmanager)
   * @returns ack đơn giản (EN: simple ack)
   */
  @Post()
  receive(@Body() payload: AlertmanagerPayload): { received: number } {
    for (const alert of payload.alerts) {
      // Phân loại severity để demo escalation
      // (EN: classify severity to demo escalation)
      const severity = alert.labels.severity ?? 'unknown';
      const name = alert.labels.alertname ?? 'unnamed';
      const state = alert.status;

      if (severity === 'p1' && state === 'firing') {
        // P1 → giả lập gọi pager
        // (EN: P1 → simulate paging)
        this.logger.error(
          `[P1][PAGE] ${name} FIRING — ${alert.annotations.summary ?? ''}`,
        );
      } else if (severity === 'p2' && state === 'firing') {
        // P2 → chỉ warn, đẩy vào kênh Slack #alerts
        // (EN: P2 → warn only, push to #alerts Slack channel)
        this.logger.warn(
          `[P2][SLACK] ${name} FIRING — ${alert.annotations.summary ?? ''}`,
        );
      } else if (state === 'resolved') {
        // Post-mortem hook: khi resolved thì log để tính MTTR
        // (EN: post-mortem hook: log on resolve to compute MTTR)
        this.logger.log(`[RESOLVED] ${name} (severity=${severity})`);
      } else {
        this.logger.log(`[${severity.toUpperCase()}] ${name} ${state}`);
      }
    }
    return { received: payload.alerts.length };
  }
}
