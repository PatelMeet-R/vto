import { useRef, useEffect, useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useCamera } from "@/hooks/useCamera";
import { useFaceLandmarker } from "@/hooks/useFaceLandmarker";
import { ARScene, type CalibrationData } from "./ARScene";

const PRODUCT_ID = "3989a210-b2b8-4c70-a52c-663836c9dfeb";
export const INITIAL_CALIBRATION: CalibrationData = {
  "scale": 2.7,
  "offsetX": 0.15,
  "offsetY": 0,
  "offsetZ": -0.6,
  "rotateX": 0.21,
  "rotateY": 0.06,
  "rotateZ": 0
}

export function AdminVTO() {
  const { landmarker } = useFaceLandmarker("VIDEO");
  const { videoRef, startCamera, stopCamera } = useCamera();
  const landmarksRef = useRef<any>(null);

  // State to hold our slider values
  const [tune, setTune] = useState<CalibrationData>(INITIAL_CALIBRATION);
  // Fetch initial data from NestJS on load
  useEffect(() => {
    fetch(`http://localhost:3000/api/products/${PRODUCT_ID}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.calibration) {
          let parsed = data.calibration;

          if (typeof parsed === "string") {
            try {
              parsed = JSON.parse(parsed);
            } catch (e) {
              console.log(e);
              // Forgiving fallback for malformed DB strings
              parsed = new Function("return " + parsed)();
            }
          }

          setTune({ ...INITIAL_CALIBRATION, ...parsed });
        }
      })
      .catch((err) => console.error("Failed to load DB config", err));
  }, []);

  // Save to NestJS when button is clicked
  const saveCalibration = async () => {
    try {
      await fetch(
        `http://localhost:3000/products/admin/${PRODUCT_ID}/calibrate`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ calibration: tune }),
        },
      );
      alert("✅ Saved to Supabase successfully!");
    } catch (err) {
      console.log(err);
      alert("❌ Failed to save!");
    }
  };

  // --- Standard MediaPipe Loop (with ESLint fix) ---
  const requestRef = useRef<number | null>(null);
  const detectRef = useRef<() => void>(() => { });

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

  // Keep the ref updated with the latest callback
  useEffect(() => {
    detectRef.current = detect;
  }, [detect]);

  useEffect(() => {
    startCamera();
    requestRef.current = requestAnimationFrame(detectRef.current);

    return () => {
      stopCamera();
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [startCamera, stopCamera]);

  return (
    <div className="flex w-full h-screen bg-zinc-900 text-white">
      {/* LEFT: THE CAMERA VIEW
          DOM STRUCTURE MUST BE IDENTICAL to ARVTOModal:
            → One relative container with `aspect-video`
            → <video> absolute-inset-0 with object-cover
            → <Canvas> absolute-inset-0 overlay
          The webcam is forced to 1280×720 (16:9) by useCamera, matching
          aspect-video exactly, so object-cover produces ZERO crop.
          This makes MediaPipe's 0–1 coords map 1:1 to the visible area. */}
      <div className="w-3/4 h-full flex items-center justify-center bg-zinc-950">
        <div className="relative w-full max-h-full aspect-video">
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
              <ARScene landmarksRef={landmarksRef} calibration={tune} />
            </Canvas>
          </div>
        </div>
      </div>

      {/* RIGHT: THE CONTROL PANEL */}
      <div className="w-1/4 h-full bg-zinc-800 p-6 flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-white">Admin Calibrator</h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-300">
            Scale: {tune.scale.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.5"
            max="4.0"
            step="0.1"
            value={tune.scale}
            onChange={(e) =>
              setTune({ ...tune, scale: parseFloat(e.target.value) })
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-300">
            Offset X (Left/Right): {tune.offsetX.toFixed(2)}
          </label>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.05"
            value={tune.offsetX}
            onChange={(e) =>
              setTune({ ...tune, offsetX: parseFloat(e.target.value) })
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-300">
            Offset Y (Up/Down): {tune.offsetY.toFixed(2)}
          </label>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.05"
            value={tune.offsetY}
            onChange={(e) =>
              setTune({ ...tune, offsetY: parseFloat(e.target.value) })
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-300">
            Offset Z (Forward/Back): {tune.offsetZ.toFixed(2)}
          </label>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.05"
            value={tune.offsetZ}
            onChange={(e) =>
              setTune({ ...tune, offsetZ: parseFloat(e.target.value) })
            }
          />
        </div>

        {/* ROTATION SLIDERS TO FIX THE BROKEN .GLB AXIS */}
        <div className="flex flex-col gap-1 mt-4">
          <label className="text-sm font-medium text-yellow-400">
            Rotate X (Pitch): {tune.rotateX.toFixed(2)}
          </label>
          <input
            type="range"
            min="-3.14"
            max="3.14"
            step="0.05"
            value={tune.rotateX}
            onChange={(e) =>
              setTune({ ...tune, rotateX: parseFloat(e.target.value) })
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-yellow-400">
            Rotate Y (Yaw): {tune.rotateY.toFixed(2)}
          </label>
          <input
            type="range"
            min="-3.14"
            max="3.14"
            step="0.05"
            value={tune.rotateY}
            onChange={(e) =>
              setTune({ ...tune, rotateY: parseFloat(e.target.value) })
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-yellow-400">
            Rotate Z (Roll): {tune.rotateZ.toFixed(2)}
          </label>
          <input
            type="range"
            min="-3.14"
            max="3.14"
            step="0.05"
            value={tune.rotateZ}
            onChange={(e) =>
              setTune({ ...tune, rotateZ: parseFloat(e.target.value) })
            }
          />
        </div>

        <button
          onClick={saveCalibration}
          className="mt-8 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-500 transition-colors"
        >
          Save to Database
        </button>
      </div>
    </div>
  );
}
