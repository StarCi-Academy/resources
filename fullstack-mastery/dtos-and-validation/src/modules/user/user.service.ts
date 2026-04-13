import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

/**
 * UsersService — Quản lý dữ liệu User sau khi đã được validate.
 * (EN: UsersService — Manages User data after validation.)
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private users: any[] = [];

  /**
   * Tạo user mới.
   * Dữ liệu nhận vào đã được ValidationPipe đảm bảo an toàn.
   * (EN: Creates a new user. Input data is guaranteed safe by ValidationPipe.)
   */
  create(dto: CreateUserDto) {
    // [prepare] Gán ID ngẫu nhiên (EN: Assign random ID)
    const user = { id: Date.now(), ...dto };

    // [execute] Lưu vào memory (EN: Save to memory)
    this.users.push(user);

    // [confirm] Trả về kêt quả (EN: Confirm result)
    this.logger.log({ message: 'User created safely', user });
    return user;
  }

  /**
   * Lấy toàn bộ danh sách users.
   */
  findAll() {
    return this.users;
  }
}
