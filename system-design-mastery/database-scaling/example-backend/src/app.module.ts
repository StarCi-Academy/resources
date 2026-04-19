import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CassandraModule } from './cassandra/cassandra.module';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { MongoEvent, MongoEventSchema } from './mongo/mongo-event.schema';
import { RedisClusterModule } from './redis/redis-cluster.module';

/**
 * Root module — gom TypeORM (Postgres), Mongoose (Mongo sharded), Redis Cluster, Cassandra driver
 *
 * @remarks Biến môi trường mặc định trùng DNS Service trong namespace `database` sau khi Helm install.
 * (EN: Default env vars match in-cluster DNS under namespace `database` after Helm installs.)
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'postgresql-ha-pgpool.database.svc.cluster.local',
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      username: process.env.POSTGRES_USER ?? 'postgres',
      password: process.env.POSTGRES_PASSWORD ?? 'postgres123',
      database: process.env.POSTGRES_DATABASE ?? 'demo_db',
      // Không dùng entity file — chỉ raw query qua DataSource (EN: no entity files — raw queries via DataSource)
      entities: [],
      synchronize: false,
      ssl: process.env.POSTGRES_SSL === 'true',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? buildDefaultMongoUri(), {
      dbName: process.env.MONGODB_DB ?? 'demo',
      connectionName: 'mongo',
    }),
    MongooseModule.forFeature([{ name: MongoEvent.name, schema: MongoEventSchema }], 'mongo'),
    RedisClusterModule,
    CassandraModule,
  ],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
})
export class AppModule {}

/**
 * URI mặc định tới mongos Bitnami sharded (EN: default URI to Bitnami mongos)
 *
 * @returns connection string (mongodb://...)
 */
function buildDefaultMongoUri(): string {
  const host =
    process.env.MONGODB_HOST ?? 'mongodb-sharded-mongodb-sharded.database.svc.cluster.local';
  const port = process.env.MONGODB_PORT ?? '27017';
  const user = encodeURIComponent(process.env.MONGODB_ROOT_USER ?? 'root');
  const pass = encodeURIComponent(process.env.MONGODB_ROOT_PASSWORD ?? 'root123');
  // authSource=admin vì Bitnami đặt root ở admin DB (EN: authSource=admin for Bitnami root user)
  return `mongodb://${user}:${pass}@${host}:${port}/?authSource=admin`;
}
