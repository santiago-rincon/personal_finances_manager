import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Categories } from '../../categories/entities/category.entity';

@Entity()
export class Finances {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unsigned: true })
  value: number;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'date', nullable: false })
  date: string;

  @ManyToOne(() => Categories, category => category.id, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Categories | number;
}
