import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
// Import từ barrel export (EN: Import from barrel export)
import { UpdateCustomerProfileCommand } from './commands';

@Controller('customer')
export class AppController {
  constructor(
    // Inject CommandBus để gửi lệnh xử lý (EN: Inject CommandBus to dispatch commands)
    private readonly commandBus: CommandBus
  ) { }

  /**
   * API cập nhật thông tin khách hàng (Write Model)
   * (EN: API to update customer profile)
   *
   * @param body - Dữ liệu cập nhật (EN: update data)
   * @returns Promise<any> - Kết quả xử lý lệnh (EN: command execution result)
   */
  @Post('update')
  async updateProfile(@Body() body: { id: string; name: string; email: string }) {
    // Thực thi Command thông qua Bus (EN: execute Command via Bus)
    return this.commandBus.execute(
      new UpdateCustomerProfileCommand(body.id, body.name, body.email),
    );
  }
}
