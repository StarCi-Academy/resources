import { Injectable } from '@nestjs/common';

/**
 * Service tính shard key — demo logic Sharding
 * (EN: Shard routing service — demonstrates sharding logic)
 *
 * Production sẽ có pool riêng cho từng shard. Demo này chỉ expose hàm
 * tính ra shard index để minh hoạ tư duy Hash(key) % N.
 * (EN: In production each shard has its own pool. This demo only exposes
 * the routing function to illustrate Hash(key) % N logic.)
 */
@Injectable()
export class ShardService {
  // Số shard giả lập (EN: number of simulated shards)
  private static readonly TOTAL_SHARDS = 4;

  /**
   * Tính shard index cho 1 user id
   * (EN: compute shard index for a user id)
   *
   * Hash đơn giản: `id % N` — trong production dùng consistent hashing
   * để resharding đỡ tốn kém (EN: production uses consistent hashing)
   */
  pickShard(userId: number): { shardIndex: number; totalShards: number } {
    // Hash đơn giản theo modulo (EN: simple modulo-based hash)
    const shardIndex = ((userId % ShardService.TOTAL_SHARDS) + ShardService.TOTAL_SHARDS) %
      ShardService.TOTAL_SHARDS;

    return { shardIndex, totalShards: ShardService.TOTAL_SHARDS };
  }
}
