import { Injectable, Logger } from '@nestjs/common';

/**
 * Service xử lý logic nghiệp vụ cho User (gRPC backend)
 * (EN: Service handling business logic for User — gRPC backend)
 *
 * Dùng in-memory array để đơn giản hóa demo
 * (EN: Uses in-memory array for demo simplicity)
 */
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  // Dữ liệu mẫu lưu trong memory (EN: sample data stored in memory)
  private users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com' },
    { id: 2, name: 'Trần Thị B', email: 'b@example.com' },
  ];

  /**
   * Lấy danh sách tất cả users
   * (EN: Get list of all users)
   *
   * @returns Object chứa mảng users (EN: object containing users array)
   */
  findAll() {
    this.logger.log({ message: 'gRPC FindAll — lấy tất cả users (EN: fetching all users)' });
    return { users: this.users };
  }

  /**
   * Lấy user theo ID
   * (EN: Get user by ID)
   *
   * @param id - ID user cần tìm (EN: user ID to find)
   * @returns User object hoặc undefined (EN: User object or undefined)
   */
  findOne(id: number) {
    this.logger.log({ message: 'gRPC FindOne — tìm user theo ID (EN: finding user by ID)', id });
    // Tìm user trong mảng bằng ID (EN: find user in array by ID)
    return this.users.find((user) => user.id === id) || {};
  }

  /**
   * Tạo user mới và thêm vào mảng
   * (EN: Create new user and add to array)
   *
   * @param name - Tên user (EN: user name)
   * @param email - Email user (EN: user email)
   * @returns User vừa tạo (EN: newly created user)
   */
  create(name: string, email: string) {
    // Tạo ID mới = max ID hiện tại + 1 (EN: create new ID = current max ID + 1)
    const id = Math.max(...this.users.map((u) => u.id), 0) + 1;
    const user = { id, name, email };

    // Thêm vào danh sách (EN: add to list)
    this.users.push(user);
    this.logger.log({ message: 'gRPC Create — tạo user thành công (EN: user created)', userId: id });
    return user;
  }
}
