import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MongoEventDocument = HydratedDocument<MongoEvent>;

/**
 * Document mẫu ghi vào MongoDB sharded — shard key = `bucket` (hash để phân tán)
 *
 * @remarks Mongos route document theo shard key; bucket là số 0–15 giả lập phân vùng.
 * (EN: Mongos routes by shard key; `bucket` is 0–15 to simulate spread across shards.)
 */
@Schema({ collection: 'integration_events', timestamps: true })
export class MongoEvent {
  @Prop({ required: true, index: true })
  bucket!: number;

  @Prop({ required: true })
  message!: string;
}

export const MongoEventSchema = SchemaFactory.createForClass(MongoEvent);
