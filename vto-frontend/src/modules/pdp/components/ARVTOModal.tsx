import { useRef, useEffect, useCallback, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Canvas } from "@react-three/fiber";
import { useCamera } from "@/hooks/useCamera";
import { useFaceLandmarker } from "@/hooks/useFaceLandmarker";
import { ARScene, DEFAULT_CALIBRATION, type CalibrationData } from "./ARScene";
import { X, Loader2 } from "lucide-react";

export function ARVTOModal({
  isOpen,
  onClose,
  productId, // Pass the product ID from your catalog grid!
}: {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}) {
  const { landmarker } = useFaceLandmarker("VIDEO");
  const { videoRef, startCamera, stopCamera } = useCamera();
  const landmarksRef = useRef<any>(null);

  // 1. State to hold the calibration from the database
  const [calibration, setCalibration] =
    useState<CalibrationData>(DEFAULT_CALIBRATION);
  const [isLoadingDB, setIsLoadingDB] = useState(true);

  // 2. Fetch the perfect fit from NestJS when the modal opens
  useEffect(() => {
    async function fetchCalibration() {
      setIsLoadingDB(true);
      console.log("🔍 [VTO Modal] Starting fetch for Product ID:", productId);
      try {
        const res = await fetch(
          `http://localhost:3000/api/products/${productId}`,
        );
        const data = await res.json();

        if (data.calibration) {
          let parsedCalibration = data.calibration;

          if (typeof parsedCalibration === "string") {
            try {
              // 1. Try strict standard JSON first
              parsedCalibration = JSON.parse(parsedCalibration);
            } catch (e) {
              console.log(e);
              // 2. FORGIVING FALLBACK: If the DB string is missing quotes around keys
              try {
                parsedCalibration = new Function(
                  "return " + parsedCalibration,
                )();
              } catch (e2) {
                console.error("Could not parse calibration data at all", e2);
              }
            }
          }

          setCalibration({ ...DEFAULT_CALIBRATION, ...parsedCalibration });
        }
      } catch (err) {
        console.error("Failed to load calibration:", err);
      } finally {
        setIsLoadingDB(false);
      }
    }

    if (isOpen && productId) {
      fetchCalibration();
    }
  }, [isOpen, productId]);
  // --- Standard MediaPipe Loop ---
  const requestRef = useRef<number | null>(null);
  const detectRef = useRef<() => void>(() => {});

  const detect = useCallback(() => {
    if (videoRef.current && landmarker && videoRef.current.readyState >= 2) {
      const results = landmarker.detectForVideo(
        videoRef.current,
        performance.now(),
      );
      landmarksRef.current =
        results.faceLandmarks?.length > 0 ? results.faceLandmarks[0] : null;
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
          {/* Optional Loading State while DB fetches */}
          {isLoadingDB && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 text-white">
              <Loader2 className="animate-spin mr-2" /> Loading perfect fit...
            </div>
          )}

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

              {/* 3. Pass the fetched database calibration! */}
              {!isLoadingDB && (
                <ARScene
                  landmarksRef={landmarksRef}
                  calibration={calibration}
                />
              )}
            </Canvas>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors pointer-events-auto"
          >
            <X size={24} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
