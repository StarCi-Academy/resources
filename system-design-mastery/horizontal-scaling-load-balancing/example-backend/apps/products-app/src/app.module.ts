import { Module } from '@nestjs/common';
import { createServiceController } from '../../../libs/base.controller';

/**
 * Dataset giả lập cho products (EN: mock product dataset)
 */
interface Product { id: string; name: string; price: number; stock: number }
const PRODUCTS: Product[] = [
  { id: 'P-001', name: 'Mechanical Keyboard', price:  79.00, stock: 42 },
  { id: 'P-002', name: 'Noise-cancel Headset', price: 149.00, stock: 17 },
  { id: 'P-003', name: '4K Monitor 27"',       price: 299.00, stock:  8 },
  { id: 'P-004', name: 'USB-C Hub 7-in-1',     price:  39.50, stock: 95 },
  { id: 'P-005', name: 'Ergonomic Mouse',      price:  29.00, stock: 60 },
  { id: 'P-006', name: 'Webcam 1080p',         price:  59.00, stock: 23 },
];

const ProductsController = createServiceController<Product>('products-app', 'api/products', PRODUCTS);

@Module({ controllers: [ProductsController] })
export class AppModule {}
