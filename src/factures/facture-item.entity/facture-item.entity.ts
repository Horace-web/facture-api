import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne
} from 'typeorm';

import { Facture } from '../facture.entity/facture.entity';

@Entity()
export class FactureItem {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  quantity: number;

  @Column('decimal', {
    precision: 10,
    scale: 2
  })
  unitPrice: number;

  @Column('decimal', {
    precision: 10,
    scale: 2
  })
  total: number;

  @ManyToOne(() => Facture, facture => facture.items, {
    onDelete: 'CASCADE'
  })
  facture: Facture;

}