import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

/**
 * Service xử lý logic nghiệp vụ cho User
 * (EN: Service handling business logic for User)
 */
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Lấy danh sách tất cả user
   * (EN: Get list of all users)
   *
   * @returns Promise<User[]> - Danh sách user (EN: list of users)
   */
  async findAll(): Promise<User[]> {
    // Truy vấn tất cả user từ database (EN: query all users from database)
    this.logger.log({ message: 'Lấy danh sách tất cả user (EN: fetching all users)' });
    return this.userRepository.find();
  }

  /**
   * Lấy user theo ID
   * (EN: Get user by ID)
   *
   * @param id - ID của user cần tìm (EN: ID of user to find)
   * @returns Promise<User | null> - User tìm được hoặc null (EN: found user or null)
   */
  async findOne(id: number): Promise<User | null> {
    // Tìm user bằng primary key (EN: find user by primary key)
    this.logger.log({ message: `Tìm user theo ID (EN: finding user by ID)`, id });
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * Tạo user mới
   * (EN: Create new user)
   *
   * @param name - Tên user (EN: user name)
   * @param email - Email user (EN: user email)
   * @returns Promise<User> - User vừa tạo (EN: newly created user)
   */
  async create(name: string, email: string): Promise<User> {
    // Tạo entity từ dữ liệu đầu vào (EN: create entity from input data)
    const user = this.userRepository.create({ name, email });

    // Lưu vào database (EN: save to database)
    const saved = await this.userRepository.save(user);
    this.logger.log({ message: 'Tạo user thành công (EN: user created successfully)', userId: saved.id });
    return saved;
  }
}
