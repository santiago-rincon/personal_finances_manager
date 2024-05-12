import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isValidDate } from 'src/utils/dateValidator';
import { Between, Repository } from 'typeorm';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { ParamsFinanceDto } from './dto/params-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import { Finances } from './entities/finance.entity';
import { CategoriesService } from 'src/categories/categories.service';
// import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class FinancesService {
  constructor(
    @InjectRepository(Finances) private financeRepository: Repository<Finances>,
    private categorySvc: CategoriesService
  ) {}

  async findAll() {
    return this.financeRepository.find({ relations: ['category'] });
  }

  async findOne(category: number) {
    if (isNaN(category))
      throw new HttpException(
        'Parameter must be a number',
        HttpStatus.BAD_REQUEST
      );
    const allFinances = await this.findAll();
    return allFinances.filter(finance => {
      if (typeof finance.category === 'number') return null;
      return finance.category.id === category;
    });
  }

  async create(createFinanceDto: CreateFinanceDto) {
    const { category, date } = createFinanceDto;
    if (!(await this.categorySvc.isValidCategory(category)))
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    if (!isValidDate(date))
      throw new HttpException(
        'Invalid date for month selected',
        HttpStatus.BAD_REQUEST
      );
    const finance = this.financeRepository.create(createFinanceDto);
    return this.financeRepository.save(finance);
  }

  async update(id: number, updateFinanceDto: UpdateFinanceDto) {
    if (Object.keys(updateFinanceDto).length === 0)
      throw new HttpException('No data to update', HttpStatus.BAD_REQUEST);
    const { category } = updateFinanceDto;
    if (category && !(await this.categorySvc.isValidCategory(category)))
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    return this.financeRepository.update({ id }, updateFinanceDto);
  }

  async findByDate(category: number, params: ParamsFinanceDto) {
    const initialDate = new Date(params.initial);
    const endDate = new Date(params.end);

    if (initialDate.getTime() >= endDate.getTime())
      throw new HttpException(
        'Invalid dates, initial date must be less than the end day',
        HttpStatus.BAD_REQUEST
      );

    if (!isValidDate(params.initial))
      throw new HttpException(
        'Error in initial. Invalid day for selected month',
        HttpStatus.BAD_REQUEST
      );

    if (!isValidDate(params.end))
      throw new HttpException(
        'Error in end. Invalid day for selected month',
        HttpStatus.BAD_REQUEST
      );

    const financesPerDate = await this.financeRepository.find({
      where: {
        date: Between(params.initial, params.end),
      },
    });

    return category === 0
      ? financesPerDate
      : financesPerDate.filter(finance => {
          if (typeof finance.category === 'number') return null;
          return finance.category.id === category;
        });
  }

  remove(id: number) {
    return this.financeRepository.delete({ id });
  }
}
