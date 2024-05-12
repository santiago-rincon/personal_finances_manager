import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateFinanceDto {
  @ApiProperty()
  @IsString()
  readonly description: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  readonly value: number;

  @ApiProperty()
  @IsString()
  readonly date: string;

  @ApiProperty()
  @IsNumber()
  readonly category: number;
}
