import { useState } from "react";
import { ArrowLeft, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import { ModelViewer360 } from "../components/ModelViewer360";
import { ARVTOModal } from "../components/ARVTOModal";

export function ProductDetailView() {
  const [isAROpen, setIsAROpen] = useState(false);

  const product = {
    id: "gltf-demo-1",
    name: "Aero Titanium Aviator",
    price: 145.0,
    category: "Premium Sun",
    description:
      "Ultra-lightweight titanium frame with polarized lenses. Built for daily wear and maximum UV protection.",
    modelUrl: "/models/glasses.glb",
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="p-6 max-w-6xl mx-auto flex items-center justify-between">
        <button className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 font-medium transition-colors">
          <ArrowLeft size={20} /> Back to Catalog
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* LEFT COLUMN: 360 Viewer */}
        <div className="aspect-square lg:aspect-[4/3] w-full sticky top-6">
          <ModelViewer360 modelUrl={product.modelUrl} />
        </div>

        {/* RIGHT COLUMN: Details */}
        <div className="flex flex-col gap-8 pt-4">
          <div>
            <span className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-2 block">
              {product.category}
            </span>
            <h1 className="text-4xl font-bold text-zinc-900 mb-2">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold text-zinc-700">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <p className="text-zinc-600 leading-relaxed text-lg">
            {product.description}
          </p>

          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-100">
            <button className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200">
              <ShoppingBag size={20} /> Add to Cart
            </button>

            {/* NEW: Updated button to open the AR Modal */}
            <button
              onClick={() => setIsAROpen(true)}
              className="w-full py-4 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-xl font-bold text-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              ✨ True 3D Try-On
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="flex items-center gap-3 text-zinc-600">
              <Truck size={24} className="text-zinc-400" />
              <span className="text-sm font-medium">
                Free Overnight Shipping
              </span>
            </div>
            <div className="flex items-center gap-3 text-zinc-600">
              <ShieldCheck size={24} className="text-zinc-400" />
              <span className="text-sm font-medium">
                1-Year Scratch Warranty
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* NEW: The AR Modal Component */}
      <ARVTOModal isOpen={isAROpen} onClose={() => setIsAROpen(false)} />
    </div>
  );
}
