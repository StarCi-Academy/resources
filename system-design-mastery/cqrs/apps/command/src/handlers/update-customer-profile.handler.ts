import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateCustomerProfileCommand } from '../commands';
import { CustomerProfileUpdatedEvent } from '../events/customer-profile-updated.event';
import { Customer } from '../entities';

/**
 * Handler xử lý lệnh cập nhật thông tin khách hàng
 * (EN: Handler to process customer profile update command)
 *
 * @param command - Đối tượng lệnh (EN: command object)
 * @returns Promise<any> - Kết quả xử lý (EN: execution result)
 */
@CommandHandler(UpdateCustomerProfileCommand)
export class UpdateCustomerProfileHandler implements ICommandHandler<UpdateCustomerProfileCommand> {
  constructor(
    // Bus nội bộ của NestJS (EN: NestJS internal EventBus)
    private readonly eventBus: EventBus,

    // Repository cho Write Model (EN: Repository for Write Model)
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  /**
   * Thực thi logic cập nhật (EN: Execute update logic)
   */
  async execute(command: UpdateCustomerProfileCommand) {
    const { id, name, email } = command;

    // 1. Prepare: Lấy thông tin hiện tại (EN: fetch current info)
    let customer = await this.customerRepository.findOne({ where: { id } });

    // 2. Sign: Kiểm tra và chuẩn bị dữ liệu (EN: validate and prepare data)
    if (!customer) {
      // Tạo mới nếu chưa tồn tại (EN: create new if not exists)
      customer = this.customerRepository.create({ id, name, email });
    } else {
      // Gán dữ liệu mới (EN: assign new data)
      customer.name = name;
      customer.email = email;
    }

    // 3. Execute: Lưu vào PostgreSQL (Write Model) (EN: save to PostgreSQL)
    await this.customerRepository.save(customer);

    // 4. Confirm: Đồng bộ qua EventBus (EN: sync via EventBus)
    // Phát tán local event (EN: publish local event)
    this.eventBus.publish(new CustomerProfileUpdatedEvent(id, name, email));

    return {
      success: true,
      message: 'Customer profile updated in Write Model and local domain event published',
      id,
    };
  }
}
