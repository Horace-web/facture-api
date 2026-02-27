import { Module } from '@nestjs/common';
import { FacturesService } from './factures.service';
import { FacturesController } from './factures.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facture } from './facture.entity/facture.entity';
import { FactureItem } from './facture-item.entity/facture-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Facture, FactureItem])],
  controllers: [FacturesController],
  providers: [FacturesService],
})
export class FacturesModule {}