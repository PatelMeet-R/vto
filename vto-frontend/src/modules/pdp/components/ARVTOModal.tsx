import { useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Canvas } from "@react-three/fiber";
import { useCamera } from "@/hooks/useCamera";
import { useFaceLandmarker } from "@/hooks/useFaceLandmarker";
import { ARScene } from "./ARScene";
import { X } from "lucide-react";

export function ARVTOModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { landmarker } = useFaceLandmarker("VIDEO");
  const { videoRef, startCamera, stopCamera } = useCamera();

  const landmarksRef = useRef<any>(null);

  const requestRef = useRef<number | null>(null);
  const detectRef = useRef<() => void>(() => {});

  const detect = useCallback(() => {
    if (videoRef.current && landmarker && videoRef.current.readyState >= 2) {
      const results = landmarker.detectForVideo(
        videoRef.current,
        performance.now(),
      );
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        landmarksRef.current = results.faceLandmarks[0];
      } else {
        landmarksRef.current = null;
      }
    }
    requestRef.current = requestAnimationFrame(detectRef.current);
  }, [landmarker, videoRef]);

  useEffect(() => {
    detectRef.current = detect;
  }, [detect]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      requestRef.current = requestAnimationFrame(detectRef.current);
    } else {
      stopCamera();
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [isOpen, startCamera, stopCamera]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl aspect-video p-0 overflow-hidden bg-black border-none">
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />

          <div className="absolute inset-0 z-10 pointer-events-none">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 45 }}
              gl={{ alpha: true, antialias: true }}
            >
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <ARScene landmarksRef={landmarksRef} />
            </Canvas>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors pointer-events-auto"
          >
            <X size={24} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
