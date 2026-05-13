import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { VTOCanvas } from "@/modules/vto/view/VTOCanvas";
import { CaptureModal } from "@/modules/vto/view/CaptureModal";
import { useCatalogViewModel } from "../viewmodel/useCatalogViewModel";

export function CatalogView() {
  const {
    products,
    isLoading,
    isVTOEnabled,
    isModalOpen,
    userImage,
    landmarks,
    toggleVTO,
    handleModalClose,
  } = useCatalogViewModel();

  if (isLoading)
    return (
      <div className="py-20 text-center text-zinc-500">Loading catalog...</div>
    );

  return (
    <div className="flex flex-col gap-6">
      {/* VTO Toggle Controls */}
      <div className="flex justify-end bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
        <div className="flex items-center gap-3 bg-zinc-100 p-2 rounded-xl">
          <span
            className={`text-sm font-semibold ${!isVTOEnabled ? "text-zinc-900" : "text-zinc-400"}`}
          >
            Standard View
          </span>
          <button
            onClick={toggleVTO}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${isVTOEnabled ? "bg-blue-600" : "bg-zinc-300"}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isVTOEnabled ? "translate-x-8" : "translate-x-1"}`}
            />
          </button>
          <span
            className={`text-sm font-semibold ${isVTOEnabled ? "text-blue-600" : "text-zinc-400"}`}
          >
            Live Try-On
          </span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden bg-white flex flex-col"
          >
            <CardContent className="p-0 flex justify-center items-center h-64 relative w-full">
              {isVTOEnabled && userImage && landmarks ? (
                <VTOCanvas
                  product={product}
                  userImage={userImage}
                  landmarks={landmarks}
                />
              ) : (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-3/4 object-contain"
                />
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-1 p-5 bg-zinc-50 border-t mt-auto">
              <h2 className="text-md font-semibold text-zinc-800">
                {product.name}
              </h2>
              <div className="flex justify-between w-full mt-2">
                <span className="text-xs font-medium bg-zinc-200 text-zinc-600 px-2 py-1 rounded-md">
                  {product.category}
                </span>
                <p className="text-lg font-bold">${product.price}</p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Hidden Modals */}
      <CaptureModal isOpen={isModalOpen} onClose={handleModalClose} />
    </div>
  );
}
