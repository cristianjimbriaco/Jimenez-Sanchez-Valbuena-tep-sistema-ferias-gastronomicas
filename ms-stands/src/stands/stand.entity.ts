import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StandStatus {
  PENDING = 'pendiente',
  APPROVED = 'aprobado',
  ACTIVE = 'activo',
  INACTIVE = 'inactivo',
}

@Entity('stands')
export class Stand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Index()
  @Column({ type: 'uuid' })
  entrepreneurId: string;

  @Column({ type: 'enum', enum: StandStatus, default: StandStatus.PENDING })
  status: StandStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
