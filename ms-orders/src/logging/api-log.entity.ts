import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'api_logs' })
export class ApiLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  route: string;

  @Column({ type: 'varchar', length: 20 })
  method: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @CreateDateColumn({ name: 'timestamp', type: 'timestamp' })
  timestamp: Date;

  @Column({ name: 'status_code', type: 'int' })
  statusCode: number;

  @Column({ type: 'text', nullable: true })
  message: string | null;
}
