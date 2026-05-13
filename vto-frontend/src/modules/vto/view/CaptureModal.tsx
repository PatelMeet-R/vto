import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera as CameraIcon, Image as ImageIcon } from "lucide-react";
import { useFaceLandmarker } from "@/hooks/useFaceLandmarker";
import { CameraView } from "./CameraView";
import { UploadView } from "./UploadView";

export function CaptureModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"camera" | "upload">("camera");

  // Load the AI once at the top level
  const { landmarker, isAILoading } = useFaceLandmarker();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] rounded-3xl bg-zinc-900 border-zinc-800 p-2 overflow-hidden shadow-2xl">
        {/* Sleek Tab Switcher Overlay */}
        <div className="absolute top-6 left-0 right-0 z-30 flex justify-center px-4 pointer-events-auto">
          <div className="flex bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/10 w-3/4 max-w-[250px]">
            <button
              onClick={() => setActiveTab("camera")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all flex items-center justify-center gap-2 ${activeTab === "camera" ? "bg-white/20 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              <CameraIcon size={14} /> Camera
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all flex items-center justify-center gap-2 ${activeTab === "upload" ? "bg-white/20 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              <ImageIcon size={14} /> Upload
            </button>
          </div>
        </div>

        {/* Render Active View */}
        {activeTab === "camera" ? (
          <CameraView
            landmarker={landmarker}
            isAILoading={isAILoading}
            onClose={onClose}
          />
        ) : (
          <UploadView
            landmarker={landmarker}
            isAILoading={isAILoading}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
