import { Module } from '@nestjs/common';
import { FinancesModule } from './finances/finances.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { Categories } from './categories/entities/category.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.MYSQL_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}', Categories],
      synchronize: true,
    }),
    FinancesModule,
    CategoriesModule,
  ],
})
export class AppModule {}
