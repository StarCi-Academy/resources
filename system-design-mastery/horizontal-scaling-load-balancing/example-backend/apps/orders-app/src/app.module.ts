import { Module } from '@nestjs/common';
import { createServiceController } from '../../../libs/base.controller';

/**
 * Dataset giả lập cho orders (EN: mock order dataset)
 */
interface Order { id: string; userId: number; total: number; status: 'paid' | 'pending' | 'shipped' }
const ORDERS: Order[] = [
  { id: 'ORD-1001', userId: 1, total:  42.50, status: 'paid'    },
  { id: 'ORD-1002', userId: 2, total: 180.00, status: 'shipped' },
  { id: 'ORD-1003', userId: 1, total:  12.00, status: 'pending' },
  { id: 'ORD-1004', userId: 3, total:  99.90, status: 'paid'    },
  { id: 'ORD-1005', userId: 4, total: 255.75, status: 'pending' },
];

const OrdersController = createServiceController<Order>('orders-app', 'api/orders', ORDERS);

@Module({ controllers: [OrdersController] })
export class AppModule {}
