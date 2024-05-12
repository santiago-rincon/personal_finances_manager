import { Module } from '@nestjs/common';
import { FinancesModule } from './finances/finances.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      retryDelay: 5000,
      retryAttempts: 9999,
    }),
    FinancesModule,
    CategoriesModule,
  ],
})
export class AppModule {}
