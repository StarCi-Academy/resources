import { Injectable, Logger } from '@nestjs/common';
import { CreateItemDto } from './dto';

/**
 * Item — Kiểu dữ liệu đơn giản đại diện cho một mục trong danh sách.
 * (EN: Simple data type representing a single item in the list.)
 */
export interface Item {
  id: number;
  name: string;
  description: string;
}

/**
 * ItemsService — Service xử lý business logic cho domain Items.
 * Dùng in-memory data thay vì database để giữ demo tập trung vào lifecycle.
 * (EN: Business logic service for the Items domain.
 * Uses in-memory data instead of a database to keep the demo focused on lifecycle.)
 */
@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  // Dữ liệu in-memory thay thế database — chỉ cho mục đích demo
  // (EN: In-memory data replacing database — for demo purposes only)
  private readonly items: Item[] = [
    { id: 1, name: 'Laptop', description: 'A powerful laptop' },
    { id: 2, name: 'Phone', description: 'A smart phone' },
    { id: 3, name: 'Tablet', description: 'A touch screen tablet' },
  ];

  /**
   * Trả về toàn bộ danh sách items.
   * (EN: Returns the full list of items.)
   *
   * @returns Item[] — Danh sách items (EN: list of items)
   */
  findAll(): Item[] {
    // Log để trace luồng request đến service layer
    // (EN: Log to trace the request flow reaching the service layer)
    this.logger.log('📦 findAll() called — returning all items');
    return this.items;
  }

  /**
   * Tìm item theo id. Ném lỗi nếu không tìm thấy.
   * (EN: Finds an item by id. Throws if not found.)
   *
   * @param id - ID của item cần tìm (EN: ID of the item to find)
   * @returns Item — Item tìm được (EN: found item)
   * @throws Error nếu không tìm thấy item (EN: if item is not found)
   */
  findOne(id: number): Item {
    this.logger.log(`📦 findOne(${id}) called`);

    // Tìm kiếm theo id — trả về undefined nếu không có
    // (EN: Search by id — returns undefined if not found)
    const item = this.items.find((i) => i.id === id);

    // Ném lỗi rõ ràng thay vì trả về null — không swallow error
    // (EN: Throw explicit error instead of returning null — do not swallow errors)
    if (!item) {
      throw new Error(`Item with id ${id} not found`);
    }

    return item;
  }

  /**
   * Tạo item mới từ dữ liệu đã được ValidationPipe validate qua CreateItemDto.
   * (EN: Creates a new item from data already validated by ValidationPipe via CreateItemDto.)
   *
   * @param dto - Dữ liệu đã validate từ request body (EN: validated data from request body)
   * @returns Item — Item vừa được tạo (EN: newly created item)
   * @side-effects Thêm item vào in-memory array (EN: appends item to the in-memory array)
   */
  create(dto: CreateItemDto): Item {
    this.logger.log(`📦 create() called — name: "${dto.name}"`);

    // Tự tăng id dựa trên phần tử cuối cùng trong mảng — đơn giản cho demo in-memory
    // (EN: Auto-increment id based on the last element — simple approach for in-memory demo)
    const nextId = this.items.length > 0 ? this.items[this.items.length - 1].id + 1 : 1;

    // Tạo item mới kết hợp id tự sinh và dữ liệu từ DTO
    // (EN: Compose new item from auto-generated id and DTO data)
    const newItem: Item = { id: nextId, ...dto };

    // Push vào array — thay thế cho INSERT INTO trong database thật
    // (EN: Push to array — replaces INSERT INTO in a real database)
    this.items.push(newItem);

    return newItem;
  }
}

