import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Glasses } from "lucide-react";
import { useVTOStore } from "@/store/useVTOStore";
import { VTOModal } from "@/components/VTOModal";

export default function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);

  const setSelectedProduct = useVTOStore((state) => state.setSelectedProduct);

  // Fetch the array of products from the NestJS backend
  useEffect(() => {
    fetch("http://localhost:3000/products/demo")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setIsLoading(false);
      });
  }, []);

  // Extract unique categories for our filter buttons
  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  // Filter products based on selected category
  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        Loading eyewear catalog...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-2">
              <Glasses size={32} />
              Lenskart Clone Demo
            </h1>
            <p className="text-zinc-500 mt-2">
              Try on our latest collection virtually.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                onClick={() => setActiveCategory(cat as string)}
                className={
                  activeCategory === cat ? "bg-zinc-900 text-white" : "bg-white"
                }
              >
                {cat as string}
              </Button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden border-zinc-200 shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <CardContent className="p-0 bg-white flex justify-center items-center h-56 relative group">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-3/4 object-contain transition-transform group-hover:scale-105"
                />
              </CardContent>

              <CardFooter className="flex flex-col items-start gap-4 p-5 bg-zinc-50 border-t">
                <div className="flex justify-between w-full items-start">
                  <div>
                    <h2 className="text-md font-semibold text-zinc-800 leading-tight">
                      {product.name}
                    </h2>
                    <span className="text-xs text-zinc-500">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-zinc-900">
                    ${product.price}
                  </p>
                </div>

                <Button
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setSelectedProduct(product)}
                >
                  <Camera size={18} />
                  Try On Virtually
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* The VTO Modal stays at the root level */}
      <VTOModal />
    </div>
  );
}
