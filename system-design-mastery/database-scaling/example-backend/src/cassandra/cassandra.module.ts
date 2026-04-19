import { Global, Module } from '@nestjs/common';
import { Client } from 'cassandra-driver';

export const CASSANDRA_CLIENT = 'CASSANDRA_CLIENT';

/**
 * Module đăng ký Apache Cassandra client (DataStax `cassandra-driver`) — không có package `@nestjs/cassandra` chính thức
 *
 * @remarks NestJS khuyến nghị bọc driver bằng provider factory; đây là pattern chuẩn production.
 * (EN: NestJS recommends wrapping the driver in a factory provider — standard production pattern.)
 */
@Global()
@Module({
  providers: [
    {
      provide: CASSANDRA_CLIENT,
      useFactory: async (): Promise<Client> => {
        const points =
          process.env.CASSANDRA_CONTACT_POINTS ??
          'cassandra-headless.database.svc.cluster.local';
        const client = new Client({
          contactPoints: points.split(',').map((p) => p.trim()),
          localDataCenter: process.env.CASSANDRA_LOCAL_DC ?? 'dc1',
          credentials: {
            username: process.env.CASSANDRA_USER ?? 'cassandra',
            password: process.env.CASSANDRA_PASSWORD ?? 'cassandra123',
          },
          // Không set keyspace ở đây — service tự `USE` sau khi tạo keyspace (EN: keyspace applied after ensure)
          protocolOptions: { port: Number(process.env.CASSANDRA_PORT ?? 9042) },
        });
        await client.connect();
        return client;
      },
    },
  ],
  exports: [CASSANDRA_CLIENT],
})
export class CassandraModule {}
