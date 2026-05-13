import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useVTOStore } from "@/core/store/useVTOStore";
import { useCamera } from "@/hooks/useCamera";
import {
  validateFacePose,
  getValidationMessage,
} from "@/modules/vto/utils/faceValidation";

interface CameraViewProps {
  landmarker: any;
  isAILoading: boolean;
  onClose: () => void;
}

export function CameraView({
  landmarker,
  isAILoading,
  onClose,
}: CameraViewProps) {
  const { setUserImage, setLandmarks } = useVTOStore();
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { stream, videoRef, startCamera, stopCamera } = useCamera((base64) => {
    setUserImage(base64);
    onClose();
  });

  // Start camera on mount, stop on unmount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const captureLivePhoto = () => {
    if (!videoRef.current || !landmarker) return;

    setIsProcessing(true);
    setCaptureError(null);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageSrc = canvas.toDataURL("image/jpeg");

      const img = new Image();
      img.src = imageSrc;

      img.onload = () => {
        const result = landmarker.detect(img);

        if (result.faceLandmarks && result.faceLandmarks.length > 0) {
          const landmarks = result.faceLandmarks[0];
          const status = validateFacePose(landmarks);

          if (status === "PERFECT") {
            setLandmarks(landmarks);
            setUserImage(imageSrc);
            setIsProcessing(false);
            stopCamera();
            onClose();
          } else {
            setCaptureError(getValidationMessage(status));
            setIsProcessing(false);
          }
        } else {
          setCaptureError(
            "No face detected. Please ensure your face is clearly visible.",
          );
          setIsProcessing(false);
        }
      };
    }
  };

  return (
    <div className="w-full relative rounded-2xl overflow-hidden aspect-[3/4] bg-black flex flex-col items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover mirror-video"
        style={{ transform: "scaleX(-1)" }}
      />

      <div className="absolute inset-0 z-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="face-hole">
              <rect width="100%" height="100%" fill="white" />
              <ellipse cx="50%" cy="45%" rx="35%" ry="28%" fill="black" />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.6)"
            mask="url(#face-hole)"
          />
          <ellipse
            cx="50%"
            cy="45%"
            rx="35%"
            ry="28%"
            fill="none"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="absolute top-20 left-0 right-0 z-20 flex justify-center pointer-events-none px-4">
        <div
          className={`backdrop-blur-md px-6 py-2.5 rounded-full border shadow-lg transition-all duration-300 text-center ${captureError ? "bg-red-500/20 border-red-500/50" : "bg-black/40 border-white/20"}`}
        >
          <p
            className={`text-sm font-semibold tracking-wide flex items-center gap-2 ${captureError ? "text-red-400" : "text-white"}`}
          >
            {captureError && <AlertCircle size={16} />}
            {isAILoading
              ? "Warming up engine..."
              : captureError || "Position face in frame"}
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center">
        <button
          onClick={captureLivePhoto}
          disabled={isAILoading || isProcessing || !stream}
          className="group relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-white/80 bg-white/10 hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg bg-white group-active:scale-90 transition-transform">
            {(isAILoading || isProcessing) && (
              <Loader2 className="animate-spin text-zinc-900" size={24} />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
