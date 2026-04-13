import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Cat } from './cat.entity';

/**
 * Owner Entity — Đại diện cho người chủ của mèo.
 * Một người chủ có thể có nhiều mèo, và một con mèo có thể có nhiều chủ (N:N).
 * (EN: Represents the owner of a cat. An owner can have many cats, and a cat can have many owners (N:N).)
 */
@Entity('owners')
export class Owner {
  /**
   * ID tự tăng của người chủ.
   * (EN: Auto-incremented ID of the owner.)
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Tên của người chủ.
   * (EN: Name of the owner.)
   */
  @Column()
  name: string;

  /**
   * Quan hệ N:N với Cat.
   * (EN: N:N relationship with Cat.)
   */
  @ManyToMany(() => Cat, (cat) => cat.owners)
  cats: Cat[];
}
