import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import Redis from 'ioredis';

/**
 * Service xử lý logic nghiệp vụ — tương tác MySQL và Redis
 * (EN: Service handling business logic — interacts with MySQL and Redis)
 */
@Injectable()
export class AppService {
  constructor(
    // Inject repository để thao tác bảng items (EN: inject repository to operate on items table)
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    // Inject Redis client từ RedisModule (EN: inject Redis client from RedisModule)
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  /**
   * Kiểm tra kết nối MySQL và Redis còn sống không
   * (EN: Health check — verify MySQL and Redis connections are alive)
   *
   * @returns Promise<object> - Trạng thái kết nối (EN: connection status)
   */
  async healthCheck() {
    // Kiểm tra MySQL bằng cách đếm bản ghi (EN: check MySQL by counting records)
    const itemCount = await this.itemRepository.count();

    // Kiểm tra Redis bằng lệnh PING (EN: check Redis with PING command)
    const redisPing = await this.redis.ping();

    return {
      mysql: { status: 'connected', itemCount },
      redis: { status: redisPing === 'PONG' ? 'connected' : 'disconnected' },
    };
  }

  /**
   * Lấy danh sách items — ưu tiên cache Redis, fallback MySQL
   * (EN: Get items list — prefer Redis cache, fallback to MySQL)
   *
   * @returns Promise<Item[]> - Danh sách item (EN: list of items)
   */
  async getItems(): Promise<Item[]> {
    const cacheKey = 'items:all';

    // Thử đọc từ Redis cache trước (EN: try reading from Redis cache first)
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      // Cache hit — parse JSON và trả về (EN: cache hit — parse JSON and return)
      return JSON.parse(cached);
    }

    // Cache miss — truy vấn MySQL (EN: cache miss — query MySQL)
    const items = await this.itemRepository.find();

    // Lưu vào Redis cache với TTL 60 giây (EN: store in Redis cache with 60s TTL)
    await this.redis.set(cacheKey, JSON.stringify(items), 'EX', 60);

    return items;
  }

  /**
   * Tạo item mới trong MySQL và xóa cache cũ
   * (EN: Create a new item in MySQL and invalidate old cache)
   *
   * @param name - Tên item cần tạo (EN: name of the item to create)
   * @returns Promise<Item> - Item vừa được tạo (EN: the created item)
   */
  async createItem(name: string): Promise<Item> {
    // Tạo entity và lưu vào MySQL (EN: create entity and persist to MySQL)
    const item = this.itemRepository.create({ name });
    await this.itemRepository.save(item);

    // Xóa cache cũ để lần get tiếp theo lấy dữ liệu mới (EN: invalidate old cache so next get fetches fresh data)
    await this.redis.del('items:all');

    return item;
  }
}
