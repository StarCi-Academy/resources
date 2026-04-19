import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Client, types } from 'cassandra-driver';
import { randomUUID } from 'crypto';
import { Cluster } from 'ioredis';
import { Model } from 'mongoose';
import { DataSource } from 'typeorm';
import { CASSANDRA_CLIENT } from './cassandra/cassandra.module';
import { MongoEvent } from './mongo/mongo-event.schema';
import { REDIS_CLUSTER } from './redis/redis-cluster.module';

/** Kết quả ping một backend (EN: single-backend ping result) */
export type PingSlice = { ok: boolean; ms: number; detail?: string; error?: string };

/**
 * Gọi song song 4 backend (Postgres, Redis, Mongo, Cassandra) để demo kết nối từ NestJS
 *
 * @remarks Không nuốt lỗi — trả `ok:false` + message để debug Helm/DNS từ xa.
 * (EN: Does not swallow errors — returns `ok:false` + message for remote Helm/DNS debugging.)
 */
@Injectable()
export class IntegrationsService implements OnModuleDestroy {
  private readonly logger = new Logger(IntegrationsService.name);

  private cassandraReady = false;

  constructor(
    @InjectDataSource()
    private readonly postgres: DataSource,
    @InjectModel(MongoEvent.name, 'mongo')
    private readonly mongoEvent: Model<MongoEvent>,
    @Inject(REDIS_CLUSTER)
    private readonly redis: Cluster,
    @Inject(CASSANDRA_CLIENT)
    private readonly cassandra: Client,
  ) {}

  /**
   * Đóng Redis cluster khi app shutdown (EN: close Redis cluster on app shutdown)
   */
  async onModuleDestroy(): Promise<void> {
    await this.redis.quit().catch(() => undefined);
    await this.cassandra.shutdown().catch(() => undefined);
  }

  /**
   * Ping cả 4 nguồn và trả latency từng cái
   *
   * @returns object với key postgres, redis, mongodb, cassandra
   */
  async pingAll(): Promise<Record<string, PingSlice>> {
    const [postgres, redis, mongodb, cassandra] = await Promise.all([
      this.safePing('postgres', () => this.pingPostgres()),
      this.safePing('redis', () => this.pingRedis()),
      this.safePing('mongodb', () => this.pingMongo()),
      this.safePing('cassandra', () => this.pingCassandra()),
    ]);
    return { postgres, redis, mongodb, cassandra };
  }

  /**
   * Ghi một dòng demo lên Mongo (bucket hash) + Cassandra + Redis counter
   *
   * @param message - nội dung log (EN: log message)
   * @returns tóm tắt thao tác đã chạy (EN: summary of executed writes)
   */
  async writeDemo(message: string): Promise<{
    mongo: { id: string; bucket: number };
    cassandra: { id: string };
    redis: { counter: number };
  }> {
    const bucket = Math.floor(Math.random() * 16);
    const doc = await this.mongoEvent.create({ bucket, message });
    await this.ensureCassandraSchema();
    const id = randomUUID();
    await this.cassandra.execute(
      'INSERT INTO demo.integration_events (id, message, created_at) VALUES (?, ?, ?)',
      [types.Uuid.fromString(id), message, new Date()],
      { prepare: true },
    );
    const counter = await this.redis.incr('demo:write_count');
    return {
      mongo: { id: String(doc._id), bucket },
      cassandra: { id },
      redis: { counter },
    };
  }

  private async safePing(label: string, fn: () => Promise<PingSlice>): Promise<PingSlice> {
    try {
      return await fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`[${label}] ping failed: ${msg}`);
      return { ok: false, ms: 0, error: msg };
    }
  }

  private async pingPostgres(): Promise<PingSlice> {
    const t0 = Date.now();
    const rows = await this.postgres.query('SELECT version() AS v');
    const ms = Date.now() - t0;
    const v = rows[0] as { v: string } | undefined;
    return { ok: true, ms, detail: v?.v?.slice(0, 80) };
  }

  private async pingRedis(): Promise<PingSlice> {
    const t0 = Date.now();
    await this.redis.set('ping:integration', String(t0), 'EX', 30);
    const v = await this.redis.get('ping:integration');
    const ms = Date.now() - t0;
    return { ok: v != null, ms, detail: `value=${v}` };
  }

  private async pingMongo(): Promise<PingSlice> {
    const t0 = Date.now();
    const n = await this.mongoEvent.estimatedDocumentCount();
    const ms = Date.now() - t0;
    return { ok: true, ms, detail: `estimatedDocuments=${n}` };
  }

  private async pingCassandra(): Promise<PingSlice> {
    const t0 = Date.now();
    await this.ensureCassandraSchema();
    const rs = await this.cassandra.execute('SELECT release_version FROM system.local');
    const ms = Date.now() - t0;
    const row = rs.first();
    const ver = row ? row.get('release_version') : undefined;
    return { ok: true, ms, detail: `release_version=${ver}` };
  }

  /**
   * Tạo keyspace/table demo một lần (RF đọc từ env để Minikube chỉ cần RF=1)
   *
   * @remarks SimpleStrategy + RF thấp chỉ dùng lab; production dùng NetworkTopologyStrategy.
   * (EN: SimpleStrategy + low RF for labs only; production should use NetworkTopologyStrategy.)
   */
  private async ensureCassandraSchema(): Promise<void> {
    if (this.cassandraReady) return;
    const rf = process.env.CASSANDRA_RF ?? '1';
    await this.cassandra.execute(
      `CREATE KEYSPACE IF NOT EXISTS demo WITH replication = {'class': 'SimpleStrategy', 'replication_factor': ${rf}}`,
    );
    await this.cassandra.execute(
      `CREATE TABLE IF NOT EXISTS demo.integration_events (id uuid PRIMARY KEY, message text, created_at timestamp)`,
    );
    this.cassandraReady = true;
  }
}
