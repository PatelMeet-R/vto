import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Loader2,
  Download,
  RefreshCcw,
  Camera as CameraIcon,
  Image as ImageIcon,
} from "lucide-react";
import { useVTOStore } from "@/core/store/useVTOStore";
import { useFaceLandmarker } from "@/hooks/useFaceLandmarker";
import { useCamera } from "@/hooks/useCamera";
import { useVTOEngine } from "@/hooks/useVTOEngine";

export function VTOModal({ products = [] }: { products?: any[] }) {
  const {
    selectedProduct,
    setSelectedProduct,
    userImage,
    setUserImage,
    landmarks,
    setLandmarks,
  } = useVTOStore();
  const [activeTab, setActiveTab] = useState<"upload" | "camera">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HOOKS ---
  const { landmarker, isAILoading } = useFaceLandmarker();

  const { stream, videoRef, startCamera, stopCamera, capturePhoto } = useCamera(
    (base64) => {
      setUserImage(base64);
      setLandmarks(null);
    },
  );

  const { canvasRef } = useVTOEngine(landmarks, userImage, selectedProduct);

  // --- UI LOGIC ---
  const handleTabSwitch = async (tab: "upload" | "camera") => {
    setActiveTab(tab);
    if (tab === "camera") {
      try {
        await startCamera();
      } catch (e) {
        console.log(e);
        setActiveTab("upload");
      }
    } else {
      stopCamera();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
        setLandmarks(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!landmarker) return;
    const result = landmarker.detect(e.currentTarget);
    if (result.faceLandmarks && result.faceLandmarks.length > 0) {
      setLandmarks(result.faceLandmarks[0]);
    } else {
      alert("No face detected. Please try a clearer photo.");
      setLandmarks(null);
      setUserImage(null);
    }
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setUserImage(null);
    setLandmarks(null);
    stopCamera();
  };

  // --- RENDER ---
  return (
    <Dialog open={!!selectedProduct} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[95vw] rounded-xl bg-white max-h-[95vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="p-4 pb-0 border-b border-zinc-100">
          <DialogTitle className="text-center font-semibold text-zinc-800">
            {selectedProduct?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
          {!userImage ? (
            <div className="w-full flex flex-col items-center gap-4">
              {/* Tabs */}
              <div className="flex bg-zinc-100 p-1 rounded-lg w-full">
                <button
                  onClick={() => handleTabSwitch("upload")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === "upload" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                  <ImageIcon size={16} /> Upload Photo
                </button>
                <button
                  onClick={() => handleTabSwitch("camera")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === "camera" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                  <CameraIcon size={16} /> Live Camera
                </button>
              </div>

              {/* Upload View */}
              {activeTab === "upload" && (
                <div className="w-full bg-zinc-50 p-8 rounded-xl border-2 border-dashed border-zinc-200 text-center flex flex-col items-center justify-center aspect-[3/4]">
                  <p className="text-sm text-zinc-500 mb-6">
                    Upload a clear, front-facing selfie.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAILoading}
                    className="w-full gap-2 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isAILoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />{" "}
                        Initializing...
                      </>
                    ) : (
                      <>
                        <Upload size={18} /> Select Image
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Camera View */}
              {activeTab === "camera" && (
                <div className="w-full relative rounded-xl overflow-hidden aspect-[3/4] bg-zinc-900 flex flex-col items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover mirror-video"
                    style={{ transform: "scaleX(-1)" }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <svg className="w-2/3 h-1/2" viewBox="0 0 200 300">
                      <ellipse
                        cx="100"
                        cy="150"
                        rx="85"
                        ry="130"
                        fill="none"
                        stroke="#00E676"
                        strokeWidth="4"
                        strokeDasharray="10 8"
                        className="opacity-90 animate-[pulse_2s_ease-in-out_infinite]"
                      />
                    </svg>
                  </div>
                  <Button
                    onClick={capturePhoto}
                    disabled={isAILoading || !stream}
                    className="absolute bottom-6 z-20 gap-2 bg-white text-zinc-900 hover:bg-zinc-100 shadow-xl px-8 rounded-full"
                  >
                    <CameraIcon size={18} /> Capture
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Canvas View */
            <div className="relative w-full flex flex-col items-center gap-4">
              <div className="relative w-full rounded-lg overflow-hidden bg-zinc-100 flex items-center justify-center border border-zinc-200 aspect-[3/4]">
                <img
                  src={userImage}
                  alt="Hidden"
                  className="hidden"
                  crossOrigin="anonymous"
                  onLoad={handleImageLoad}
                />
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUserImage(null);
                    setLandmarks(null);
                    handleTabSwitch(activeTab);
                  }}
                  className="w-full border-zinc-300 text-zinc-700"
                >
                  <RefreshCcw size={16} className="mr-2" /> Retake
                </Button>
                <Button
                  onClick={() => {}}
                  disabled={!landmarks}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white gap-2"
                >
                  <Download size={16} /> Save Look
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Phase 4 Carousel */}
        {userImage && products && products.length > 0 && (
          <div className="bg-zinc-50 border-t border-zinc-200 p-4 pb-6">
            <div
              className="flex overflow-x-auto gap-3 pb-2 snap-x px-1"
              style={{ scrollbarWidth: "none" }}
            >
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 bg-white flex items-center justify-center p-2 transition-all snap-center ${selectedProduct?.id === p.id ? "border-blue-600 shadow-md ring-2 ring-blue-100 scale-105" : "border-zinc-200 opacity-70 hover:opacity-100"}`}
                >
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-contain drop-shadow-sm"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
