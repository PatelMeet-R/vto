import { Controller, Get } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  @Get('demo')
  getDemoProduct() {
    return {
      // id: 'glass-101',
      // name: 'Classic Black Frames',
      // price: 49.99,
      // image_url: `/assets/eyewear/glass-1.png`, // mapped to frontend  folder
      // vto_config: {
      //   vertical_offset: 0, // Adjusts if glasses sit too high/low
      //   scale_factor: 1.1, // Adjusts size relative to face
      // },
      id: 'glass-101',
      name: 'Classic Black Frames',
      price: 49.99,

      image_url: '/assets/eyewear/glass-1.png',

      vto_config: {
        // Width tuning
        scale_factor: 1.5,

        // Move glasses up/down
        vertical_offset: 0.01,

        // Move left/right if needed
        horizontal_offset: 0,

        // Realistic width relative to face
        face_width_ratio: 1.05,

        // Asset calibration
        lens_center_y_ratio: 0.42,

        // Extra adjustments
        rotation_offset: 0,

        // For future depth handling
        perspective_strength: 0.15,
      },
    };
  }
}
