import { useState, useCallback, useRef, useEffect } from "react";

export function useCamera(onCapture?: (base64Image: string) => void) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const stopCamera = useCallback(() => {
    setStream((prevStream) => {
      if (prevStream) {
        prevStream.getTracks().forEach((track) => track.stop());
      }
      return null;
    });
    // Ensure the video element releases the stream
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // CRITICAL FIX: Wrapped in useCallback and added a guard
  const startCamera = useCallback(async () => {
    
    if (videoRef.current && videoRef.current.srcObject) {
      return;
    }

    try {
      // CRITICAL: Request 16:9 resolution (1280×720) to match the aspect-video
      // containers used in both AdminVTO and ARVTOModal. When the webcam's
      // native AR matches the container AR, object-fit:cover produces ZERO crop,
      // so MediaPipe's 0–1 normalized coords map 1:1 to the visible area.
      // Without this, the browser defaults to 4:3 (640×480), causing object-cover
      // to crop ~12.5% off top/bottom, poisoning all Y-axis calibration.
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && onCapture) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        onCapture(canvas.toDataURL("image/jpeg"));
        stopCamera();
      }
    }
  }, [onCapture, stopCamera]);

  // Auto-cleanup when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return { stream, videoRef, startCamera, stopCamera, capturePhoto };
}
// ====================
