import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entity Note — dùng chung cho postgres-app và sqlite-app
 *
 * @remarks Cùng một entity, nhưng khác driver → hành vi scale khác hoàn toàn.
 * (EN: Same entity, different driver → completely different scaling behavior.)
 */
@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  content!: string;

  // Ghi lại pod/instance đã tạo record để quan sát khi scale
  // (EN: record the pod that created this row to observe scaling)
  @Column({ type: 'varchar', length: 64 })
  createdByPod!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
