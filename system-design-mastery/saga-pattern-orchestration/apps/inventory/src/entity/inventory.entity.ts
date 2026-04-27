import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { InventoryStatus } from "../inventory.enum";

@Entity()
export class InventoryEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: false })
    productId!: string;
  
    @Column({ type: 'integer', nullable: false })
    quantity!: number;
}