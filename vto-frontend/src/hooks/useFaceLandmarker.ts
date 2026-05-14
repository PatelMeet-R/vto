import { useEffect, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

/**
 * @param mode - "IMAGE" for static photo detection, "VIDEO" for live webcam
 *   tracking with detectForVideo(). Defaults to "IMAGE".
 */
export function useFaceLandmarker(mode: "IMAGE" | "VIDEO" = "IMAGE") {
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null);
  const [isAILoading, setIsAILoading] = useState(true);

  useEffect(() => {
    async function initAI() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        const model = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/face_landmarker.task",
            delegate: "GPU",
          },
          // CRITICAL: must match the detection method used at call-site.
          // "IMAGE" → landmarker.detect()
          // "VIDEO" → landmarker.detectForVideo()
          runningMode: mode,
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        });

        setLandmarker(model);
      } catch (error) {
        console.error("Failed to load MediaPipe AI:", error);
      } finally {
        setIsAILoading(false);
      }
    }

    initAI();
  }, [mode]);

  return { landmarker, isAILoading };
}
