import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCustomerProfileCommand } from './commands/update-customer-profile.command';

@Controller('customer')
export class AppController {
  constructor(private readonly commandBus: CommandBus) { }

  @Post('update')
  async updateProfile(@Body() body: { id: string; name: string; email: string }) {
    return this.commandBus.execute(
      new UpdateCustomerProfileCommand(body.id, body.name, body.email),
    );
  }
}
