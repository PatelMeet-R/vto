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
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
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
