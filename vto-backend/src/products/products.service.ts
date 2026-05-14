import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  // Used by the VTO Modal to get the glasses & calibration
  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // Used by the Admin UI to save new slider values
  async updateCalibration(id: string, calibrationData: any): Promise<Product> {
    const product = await this.findOne(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    product.calibration = calibrationData;
    return this.productsRepository.save(product);
  }
}
