import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Categories } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private categoryRepository: Repository<Categories>
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const exist = await this.categoryRepository.find({
      where: {
        category: createCategoryDto.category,
      },
    });
    if (exist.length === 0) {
      const category = this.categoryRepository.create(createCategoryDto);
      return this.categoryRepository.save(category);
    } else {
      throw new HttpException('Category already exists', HttpStatus.CONFLICT);
    }
  }

  findAll() {
    return this.categoryRepository.find();
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    if (Object.keys(updateCategoryDto).length === 0)
      throw new HttpException('No data to update', HttpStatus.BAD_REQUEST);
    if (id && !(await this.isValidCategory(id)))
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    return this.categoryRepository.update({ id }, updateCategoryDto);
  }

  async isValidCategory(id: number) {
    const categories = await this.findAll();
    const ids = categories.map(category => category.id);
    return ids.includes(id);
  }
}
