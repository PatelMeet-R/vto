import { create } from "zustand";

// 1. You can define a quick Product type here to be safe
export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  vto_config: any;
}

interface VTOState {
  selectedProduct: Product | null; // <--- Allows null
  userImage: string | null;
  resultImage: string | null;

  // 2. Update this to explicitly accept Product OR null
  setSelectedProduct: (product: Product | null) => void;
  setUserImage: (image: string | null) => void;
  setResultImage: (image: string | null) => void;

  landmarks: any | null; // <--- NEW: Stores the face coordinates
  setLandmarks: (landmarks: any | null) => void; // <--- NEW
}

export const useVTOStore = create<VTOState>((set) => ({
  selectedProduct: null,
  userImage: null,
  resultImage: null,
  landmarks: null,
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setUserImage: (image) => set({ userImage: image }),
  setResultImage: (image) => set({ resultImage: image }),
  setLandmarks: (landmarks) => set({ landmarks: landmarks }),
}));
