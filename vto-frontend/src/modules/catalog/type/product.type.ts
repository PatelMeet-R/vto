export interface VTOConfig {
  scale_factor: number;
  vertical_offset: number;
  horizontal_offset: number;
  rotation_offset: number;
  perspective_strength: number;
  lens_center_y_ratio: number;
  glasses_to_ipd_ratio: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  vto_config: VTOConfig;
}
