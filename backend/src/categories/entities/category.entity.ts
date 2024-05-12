import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Categories {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  category: string;
}
