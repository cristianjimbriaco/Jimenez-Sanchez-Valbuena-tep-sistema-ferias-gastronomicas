import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación con Stand por ID (NO FK, NO entidad de otro MS)
  @Index()
  @Column({ type: 'uuid' })
  standId: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Index()
  @Column({ type: 'varchar', length: 60 })
  category: string;

  // Postgres: money mejor como numeric; TypeORM sugiere string para numeric
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: string;

  // Disponibilidad manual (además del stock)
  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
