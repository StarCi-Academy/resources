import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Cat Entity — Thực thể minh họa caching.
 * (EN: Cat Entity for caching demonstration.)
 */
@Entity('cats')
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  breed: string;
}
