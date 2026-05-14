import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  modelUrl: string;

  // Store the 3D calibration data as a JSON object
  @Column({ type: 'jsonb', nullable: true })
  calibration: {
    scale: number;
    offsetX: number;
    offsetY: number;
    offsetZ: number;
    rotateX: number;
    rotateY: number;
    rotateZ: number;
  };
}
