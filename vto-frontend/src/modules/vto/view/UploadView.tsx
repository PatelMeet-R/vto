import { useRef, useState } from "react";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { useVTOStore } from "@/core/store/useVTOStore";
import {
  validateFacePose,
  getValidationMessage,
} from "@/modules/vto/utils/faceValidation";

interface UploadViewProps {
  landmarker: any;
  isAILoading: boolean;
  onClose: () => void;
}

export function UploadView({
  landmarker,
  isAILoading,
  onClose,
}: UploadViewProps) {
  const { setUserImage, setLandmarks } = useVTOStore();
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processUploadedImage = (imageSrc: string) => {
    if (!landmarker) return;

    setIsProcessing(true);
    setCaptureError(null);

    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      const result = landmarker.detect(img);

      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const landmarks = result.faceLandmarks[0];

        // Subject the upload to the same strict validation!
        const status = validateFacePose(landmarks);

        if (status === "PERFECT") {
          setLandmarks(landmarks);
          setUserImage(imageSrc);
          setIsProcessing(false);
          onClose();
        } else {
          setCaptureError(getValidationMessage(status));
          setIsProcessing(false);
        }
      } else {
        setCaptureError("No face detected. Please try a clearer photo.");
        setIsProcessing(false);
      }
    };
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full relative rounded-2xl overflow-hidden aspect-[3/4] bg-zinc-950 flex flex-col items-center justify-center p-8">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageUpload}
      />

      <div
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`w-full max-w-xs aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all ${isProcessing ? "border-zinc-700 bg-zinc-900" : "border-zinc-600 hover:border-blue-500 hover:bg-zinc-900 cursor-pointer"}`}
      >
        {isProcessing || isAILoading ? (
          <>
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-zinc-400 text-sm font-medium">
              {isAILoading ? "Loading AI..." : "Analyzing face..."}
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
              <Upload className="text-zinc-400" size={24} />
            </div>
            <div className="text-center">
              <p className="text-white font-medium text-sm">
                Tap to upload photo
              </p>
              <p className="text-zinc-500 text-xs mt-1">
                Must be a clear, front-facing selfie
              </p>
            </div>
          </>
        )}
      </div>

      {captureError && (
        <div className="mt-8 backdrop-blur-md px-5 py-2 rounded-full border border-red-500/50 bg-red-500/20 text-center animate-in fade-in zoom-in-95">
          <p className="text-xs font-semibold flex items-center justify-center gap-2 text-red-400">
            <AlertCircle size={14} /> {captureError}
          </p>
        </div>
      )}
    </div>
  );
}
