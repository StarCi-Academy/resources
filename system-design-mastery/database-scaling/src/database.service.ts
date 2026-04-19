import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

/**
 * Service quản lý 2 pool — Primary (writes) và Replica (reads)
 * (EN: Manages 2 pools — Primary for writes, Replica for reads)
 *
 * Đây là điểm mấu chốt của Read Replica: app chủ động route query theo loại
 * (EN: Core idea of Read Replica: app routes queries by type)
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private primary!: Pool;
  private replica!: Pool;

  onModuleInit(): void {
    // Pool cho writes — trỏ tới primary (EN: write pool → primary)
    this.primary = new Pool({
      host: process.env.DB_PRIMARY_HOST ?? '127.0.0.1',
      port: Number(process.env.DB_PRIMARY_PORT ?? 5432),
      user: 'app',
      password: 'app123',
      database: 'appdb',
      max: 10,
    });

    // Pool cho reads — trỏ tới replica (EN: read pool → replica)
    this.replica = new Pool({
      host: process.env.DB_REPLICA_HOST ?? '127.0.0.1',
      port: Number(process.env.DB_REPLICA_PORT ?? 5433),
      user: 'app',
      password: 'app123',
      database: 'appdb',
      max: 10,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([this.primary.end(), this.replica.end()]);
  }

  /**
   * Query đọc — đi vào replica pool
   * (EN: read query — goes to replica pool)
   *
   * Lưu ý: replica có thể bị replication lag → đọc dữ liệu hơi cũ
   * (EN: note: replicas may have replication lag → slightly stale data)
   */
  async read<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    this.logger.log(`[READ  → replica] ${sql}`);
    const result = await this.replica.query(sql, params);
    return result.rows as T[];
  }

  /**
   * Query ghi — PHẢI đi vào primary
   * (EN: write query — MUST go to primary)
   */
  async write<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    this.logger.warn(`[WRITE → primary] ${sql}`);
    const result = await this.primary.query(sql, params);
    return result.rows as T[];
  }

  /**
   * Đọc nhưng yêu cầu strong consistency — đi primary để tránh lag
   * (EN: read that requires strong consistency — goes to primary to avoid lag)
   *
   * Ví dụ: sau khi user đổi mật khẩu, bước verify ngay phải đọc primary
   * (EN: e.g. right after a password change, verification must read primary)
   */
  async readStrong<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    this.logger.warn(`[READ  → primary (strong)] ${sql}`);
    const result = await this.primary.query(sql, params);
    return result.rows as T[];
  }
}
