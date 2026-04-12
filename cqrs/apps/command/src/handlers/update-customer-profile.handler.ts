import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateCustomerProfileCommand } from '../commands/update-customer-profile.command';
import { CustomerProfileUpdatedEvent } from '../events/customer-profile-updated.event';
import { Customer } from '../entities/customer.entity';

@CommandHandler(UpdateCustomerProfileCommand)
export class UpdateCustomerProfileHandler implements ICommandHandler<UpdateCustomerProfileCommand> {
  constructor(
    private readonly eventBus: EventBus,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async execute(command: UpdateCustomerProfileCommand) {
    const { id, name, email } = command;
    console.log(`[Command] Saving to DB: Customer ${id} - ${name}`);

    // Update in Database (Write Model)
    let customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      customer = this.customerRepository.create({ id, name, email });
    } else {
      customer.name = name;
      customer.email = email;
    }
    await this.customerRepository.save(customer);

    // Publish event
    console.log(`[Command] Publishing Event for Customer ${id}`);
    this.eventBus.publish(new CustomerProfileUpdatedEvent(id, name, email));
    
    return { success: true, id };
  }
}
