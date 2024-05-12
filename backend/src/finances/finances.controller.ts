import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FinancesService } from './finances.service';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import { ParamsFinanceDto } from './dto/params-finance.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Finances')
@Controller('finances')
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @ApiQuery({ name: 'initial', required: false })
  @ApiQuery({ name: 'end', required: false })
  @Get()
  findAll(@Query() params: ParamsFinanceDto) {
    if (Object.keys(params).length === 0) return this.financesService.findAll();
    return this.financesService.findByDate(0, params);
  }

  @ApiQuery({ name: 'initial', required: false })
  @ApiQuery({ name: 'end', required: false })
  @Get(':category')
  findOne(
    @Param('category') category: number,
    @Query() params: ParamsFinanceDto
  ) {
    if (Object.keys(params).length === 0)
      return this.financesService.findOne(+category);
    return this.financesService.findByDate(+category, params);
  }

  @Post()
  create(@Body() createFinanceDto: CreateFinanceDto) {
    return this.financesService.create(createFinanceDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFinanceDto: UpdateFinanceDto) {
    return this.financesService.update(+id, updateFinanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.financesService.remove(+id);
  }
}
