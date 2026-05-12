import { useEffect, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export function useFaceLandmarker() {
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null);
  const [isAILoading, setIsAILoading] = useState(true);

  useEffect(() => {
    async function initAI() {
      try {
        // We use a CDN for the WASM files to avoid Vite local server MIME type errors
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        // const model = await FaceLandmarker.createFromOptions(vision, {
        //   baseOptions: {
        //     // This points to the file you placed in your public folder!
        //     modelAssetPath: "/models/face_landmarker.task",
        //     delegate: "GPU", // Uses the user's GPU (or fallback to CPU)
        //   },
        //   outputFaceBlendshapes: false,
        //   runningMode: "IMAGE",
        //   numFaces: 1, // We only need to track one face for this demo
        // });
        const model = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/face_landmarker.task",

            delegate: "GPU",
          },

          runningMode: "IMAGE",

          numFaces: 1,

          /**
           * IMPORTANT UPGRADES
           */

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
  }, []);

  return { landmarker, isAILoading };
}
