import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn
} from 'typeorm';
import { OneToMany } from 'typeorm';
import { FactureItem } from '../facture-item.entity/facture-item.entity';

@Entity()
export class Facture {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  reference: string;

  @Column()
  clientName: string;

  @Column()
  clientEmail: string;

  @Column()
  clientPhone: string;

  @Column({
    nullable: true
  })
  paymentMethod: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0
  })
  transactionFee: number;

  @Column('decimal', {
    precision: 10,
    scale: 2
  })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING'
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    nullable: true
  })
  paidAt: Date;

  @OneToMany(() => FactureItem, item => item.facture, {
  cascade: true
  })
  items: FactureItem[];

}