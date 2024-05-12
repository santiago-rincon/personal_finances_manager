import { PartialType } from '@nestjs/mapped-types';
import { CreateFinanceDto } from './create-finance.dto';
import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFinanceDto extends PartialType(CreateFinanceDto) {
  @ApiProperty()
  @IsNumber()
  category?: number;

  @ApiProperty()
  @IsString()
  date?: string;

  @ApiProperty()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  value?: number;
}
