import { Module } from '@nestjs/common';
import { FinancesService } from './finances.service';
import { FinancesController } from './finances.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Finances } from './entities/finance.entity';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Finances]), CategoriesModule],
  controllers: [FinancesController],
  providers: [FinancesService],
})
export class FinancesModule {}
