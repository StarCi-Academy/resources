import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ProductEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    name!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    description!: string;
}