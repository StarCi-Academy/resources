import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat } from './entities';

/**
 * Cat Service — Xử lý logic nghiệp vụ cho mèo và các quan hệ.
 * Tuân thủ pattern: prepare → execute → confirm.
 * (EN: Business logic service for cats and relationships. Follows pattern: prepare → execute → confirm.)
 */
@Injectable()
export class CatService {
  private readonly logger = new Logger(CatService.name);

  constructor(
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,
  ) {}

  /**
   * Lấy danh sách toàn bộ mèo kèm theo các quan hệ (JOIN).
   * (EN: Retrieves all cats with their relationships (JOIN).)
   *
   * @returns Promise<Cat[]> - Danh sách mèo đầy đủ thông tin (EN: list of cats with full info)
   */
  async findAll(): Promise<Cat[]> {
    // [execute] Thực hiện truy vấn JOIN với tất cả các bảng liên quan
    // (EN: Execute JOIN query with all related tables)
    this.logger.log('Fetching all cats with relations...');
    return await this.catRepository.find({
      relations: ['passport', 'toys', 'owners'],
    });
  }

  /**
   * Tạo mèo mới với đầy đủ các quan hệ (CASCADE).
   * (EN: Creates a new cat with all relationships (CASCADE).)
   *
   * @param catData - Dữ liệu mèo (EN: cat data)
   * @returns Promise<Cat> - Mèo vừa được tạo (EN: newly created cat)
   */
  async create(catData: Partial<Cat>): Promise<Cat> {
    // [prepare] Khởi tạo instance mới từ dữ liệu đầu vào
    // (EN: Prepare new instance from input data)
    this.logger.log({ message: 'Preparing to create new cat', data: catData });
    const cat = this.catRepository.create(catData);

    // [execute] Lưu vào database (TypeORM sẽ tự động lưu các quan hệ nhờ cascade)
    // (EN: Execute save to database (TypeORM auto-saves relations due to cascade))
    const savedCat = await this.catRepository.save(cat);

    // [confirm] Log kết quả thành công
    // (EN: Confirm success result)
    this.logger.log({ message: 'Cat created successfully', id: savedCat.id });
    return savedCat;
  }

  /**
   * Lấy chi tiết một con mèo theo ID.
   * (EN: Returns details of a cat by ID.)
   *
   * @param id - ID của mèo (EN: cat ID)
   * @returns Promise<Cat> - Thông tin chi tiết mèo (EN: detailed cat info)
   */
  async findOne(id: number): Promise<Cat> {
    // [execute] Tìm kiếm mèo kèm JOIN quan hệ
    // (EN: Execute find cat with relationship JOIN)
    const cat = await this.catRepository.findOne({
      where: { id },
      relations: ['passport', 'toys', 'owners'],
    });

    // [confirm] Kiểm tra sự tồn tại (EN: confirm existence)
    if (!cat) {
      this.logger.error(`Cat with ID ${id} not found`);
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }

    return cat;
  }
}
