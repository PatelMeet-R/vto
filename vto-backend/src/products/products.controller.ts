import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Get('demo')
  getDemoProducts() {
    // database query
    return [
      {
        id: 'glass-101',
        name: 'Classic Aviator Sunglasses',
        price: 59.99,
        category: 'Aviator',
        image_url: '/assets/eyewear/aviator.png',
        vto_config: {
          scale_factor: 1.0,
          vertical_offset: 0,
          horizontal_offset: 0,
          rotation_offset: 0,
          perspective_strength: 0.1, // Less perspective needed for flat readers
          // CRITICAL: The nose bridge is perfectly in the vertical center of these frames.
          lens_center_y_ratio: 0.5,
          // CRITICAL: Reading glasses are much narrower.
          glasses_to_ipd_ratio: 2.0,
        },
      },
      {
        id: 'glass-102',
        name: 'Narrow Rectangle Readers',
        price: 35.0,
        category: 'Rectangle',
        image_url: '/assets/eyewear/rectangle.png',
        vto_config: {
          scale_factor: 1.0,
          vertical_offset: 0,
          horizontal_offset: 0,
          rotation_offset: 0,
          perspective_strength: 0.1, // Less perspective needed for flat readers
          // CRITICAL: The nose bridge is perfectly in the vertical center of these frames.
          lens_center_y_ratio: 0.5,
          // CRITICAL: Reading glasses are much narrower.
          glasses_to_ipd_ratio: 2.0,
        },
      },
      {
        id: 'glass-103',
        name: 'Retro Round Frames',
        price: 45.5,
        category: 'Round',
        image_url: '/assets/eyewear/round.png',
        vto_config: {
          scale_factor: 1.0,
          vertical_offset: 0,
          horizontal_offset: 0,
          rotation_offset: 0,
          perspective_strength: 0.1, // Less perspective needed for flat readers
          // CRITICAL: The nose bridge is perfectly in the vertical center of these frames.
          lens_center_y_ratio: 0.5,
          // CRITICAL: Reading glasses are much narrower.
          glasses_to_ipd_ratio: 2.0,
        },
      },
      {
        id: 'glass-104',
        name: 'Chunky Wayfarer',
        price: 85.0,
        category: 'Square',
        image_url: '/assets/eyewear/square.png',
        vto_config: {
          scale_factor: 1.0,
          vertical_offset: 0,
          horizontal_offset: 0,
          rotation_offset: 0,
          perspective_strength: 0.1, // Less perspective needed for flat readers
          // CRITICAL: The nose bridge is perfectly in the vertical center of these frames.
          lens_center_y_ratio: 0.5,
          // CRITICAL: Reading glasses are much narrower.
          glasses_to_ipd_ratio: 2.0,
        },
      },
      {
        id: 'glass-105',
        name: 'Vintage Cat-Eye',
        price: 65.0,
        category: 'Cat-Eye',
        image_url: '/assets/eyewear/cateye.png',
        vto_config: {
          scale_factor: 1.0,
          vertical_offset: 0,
          horizontal_offset: 0,
          rotation_offset: 0,
          perspective_strength: 0.1, // Less perspective needed for flat readers
          // CRITICAL: The nose bridge is perfectly in the vertical center of these frames.
          lens_center_y_ratio: 0.5,
          // CRITICAL: Reading glasses are much narrower.
          glasses_to_ipd_ratio: 2.0,
        },
      },
    ];
  }
  @Get(':id')
  getProduct(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put('admin/:id/calibrate')
  updateCalibration(
    @Param('id') id: string,
    @Body('calibration') calibration: any,
  ) {
    return this.productsService.updateCalibration(id, calibration);
  }
}
