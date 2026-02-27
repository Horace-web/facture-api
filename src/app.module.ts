import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturesModule } from './factures/factures.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '0000',
      database: 'facture_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    FacturesModule,
  ],
})
export class AppModule {}