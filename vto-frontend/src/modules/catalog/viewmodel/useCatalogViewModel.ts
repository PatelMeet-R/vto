import { useState, useEffect } from "react";
import { useVTOStore } from "@/core/store/useVTOStore";
import type { Product } from "../type/product.type";
import { fetchProducts } from "../model/productService";

export function useCatalogViewModel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVTOEnabled, setIsVTOEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { userImage, landmarks } = useVTOStore();

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const toggleVTO = () => {
    if (!isVTOEnabled) {
      setIsVTOEnabled(true);
      if (!userImage || !landmarks) setIsModalOpen(true);
    } else {
      setIsVTOEnabled(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    if (!userImage) setIsVTOEnabled(false);
  };

  return {
    products,
    isLoading,
    isVTOEnabled,
    isModalOpen,
    userImage,
    landmarks,
    toggleVTO,
    handleModalClose,
  };
}
