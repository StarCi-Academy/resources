import { Module } from '@nestjs/common';
import { OrderOrchestrationController } from './order-orchestration.controller';
import { OrderOrchestrationService } from './order-orchestration.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORDER_ORCHESTRATION_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { 
            clientId: 'order-orchestration',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'order-orchestration-consumer',
          },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner,
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  controllers: [OrderOrchestrationController],
  providers: [OrderOrchestrationService],
})
export class OrderOrchestrationModule {}
