import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';

/**
 * UsersService — Xử lý logic nghiệp vụ cho Resource 'User'.
 * Tuân thủ pattern: prepare → execute → confirm.
 * (EN: UsersService — Handles business logic for the 'User' resource.
 * Follows pattern: prepare → execute → confirm.)
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  // Giả lập database trong bộ nhớ (EN: Simulate in-memory database)
  private users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
  ];

  /**
   * Lấy toàn bộ danh sách người dùng.
   * (EN: Retrieves the entire list of users.)
   *
   * @returns User[] - Danh sách người dùng (EN: List of users)
   */
  findAll(): User[] {
    this.logger.log('Fetching all users...');
    return this.users;
  }

  /**
   * Tìm người dùng theo ID.
   * (EN: Finds a user by ID.)
   *
   * @param id - ID của người dùng (EN: User ID)
   * @returns User - Thông tin người dùng (EN: User info)
   */
  findOne(id: string): User {
    this.logger.log(`Searching for user with ID: ${id}`);
    const user = this.users.find((u) => u.id === id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Tạo người dùng mới.
   * (EN: Creates a new user.)
   *
   * @param payload - Dữ liệu người dùng mới (EN: New user data)
   * @returns User - Người dùng vừa tạo (EN: Newly created user)
   */
  create(payload: Partial<User>): User {
    // [prepare] Khởi tạo dữ liệu và sinh ID (EN: Prepare data and generate ID)
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      name: payload.name || 'Anonymous',
      email: payload.email || 'no-email@example.com',
    };

    // [execute] Lưu vào database giả lập (EN: Execute save to mock database)
    this.users.push(newUser);

    // [confirm] Trả về kết quả (EN: Confirm and return result)
    this.logger.log({ message: 'User created successfully', userId: newUser.id });
    return newUser;
  }

  /**
   * Cập nhật toàn bộ thông tin người dùng (PUT).
   * (EN: Completely updates user info (PUT).)
   */
  update(id: string, payload: Partial<User>): User {
    // [prepare] Tìm user hiện tại (EN: Find current user)
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new NotFoundException('User not found');

    // [execute] Thay thế toàn bộ dữ liệu (EN: Execute full data replacement)
    this.users[index] = { ...this.users[index], ...payload, id };

    // [confirm] Trả về bản ghi đã cập nhật (EN: Return updated record)
    return this.users[index];
  }

  /**
   * Xóa người dùng.
   * (EN: Deletes a user.)
   */
  remove(id: string): void {
    // [execute] Thực hiện xóa (EN: Execute deletion)
    const initialLength = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);

    // [confirm] Kiểm tra nếu không tìm thấy để xóa (EN: Check if nothing to delete)
    if (this.users.length === initialLength) {
      throw new NotFoundException('Cannot delete: User not found');
    }

    this.logger.log(`User ${id} removed successfully`);
  }
}
