import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useVTOStore } from "@/store/useVTOStore";
import { VTOModal } from "@/components/VTOModal";

export default function App() {
  const [product, setProduct] = useState<any>(null);
  const setSelectedProduct = useVTOStore((state) => state.setSelectedProduct);

  // Fetch the static product from our NestJS backend
  useEffect(() => {
    fetch("http://localhost:3000/products/demo")
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error("Failed to fetch product:", err));
  }, []);

  if (!product) return <div className="p-10 text-center">Loading Demo...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-zinc-900">
          Virtual Try-On Demo
        </h1>

        <Card className="overflow-hidden border-zinc-200 shadow-sm">
          <CardContent className="p-0 bg-white flex justify-center items-center h-64">
            {/* Vite will look in the public folder for this exact string */}
            <img
              src={product.image_url}
              alt={product.name}
              className="w-4/5 object-contain"
            />
          </CardContent>

          <CardFooter className="flex flex-col items-start gap-4 p-6 bg-zinc-50 border-t">
            <div className="flex justify-between w-full items-center">
              <h2 className="text-lg font-semibold text-zinc-800">
                {product.name}
              </h2>
              <p className="text-lg font-bold text-zinc-900">
                ${product.price}
              </p>
            </div>

            <Button
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setSelectedProduct(product);
                // Next step: We will open the Modal here!
                console.log("VTO Clicked! Selected:", product.name);
              }}
            >
              <Camera size={18} />
              Try On Virtually
            </Button>
          </CardFooter>
        </Card>
      </div>
      {/* ======================== */}
      <VTOModal />
      {/* ======================== */}
    </div>
  );
}
