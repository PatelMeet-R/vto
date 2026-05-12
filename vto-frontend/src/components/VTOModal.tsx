import { useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Download } from "lucide-react";
import { useVTOStore } from "@/store/useVTOStore";
import { useFaceLandmarker } from "@/hooks/useFaceLandmarker";

export function VTOModal() {
  const {
    selectedProduct,
    setSelectedProduct,
    userImage,
    setUserImage,
    landmarks,
    setLandmarks,
  } = useVTOStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { landmarker, isAILoading } = useFaceLandmarker();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
        setLandmarks(null); // Reset landmarks for new image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!landmarker) return;

    const result = landmarker.detect(e.currentTarget);
    if (result.faceLandmarks && result.faceLandmarks.length > 0) {
      setLandmarks(result.faceLandmarks[0]);
    } else {
      alert(
        "We couldn't detect a face. Please try a clearer front-facing photo.",
      );
      setLandmarks(null);
    }
  };

  // THE MAGIC: Draw the selfie and the glasses onto the canvas whenever landmarks change
  // useEffect(() => {
  //   if (!landmarks || !userImage || !selectedProduct || !canvasRef.current)
  //     return;

  //   const canvas = canvasRef.current;
  //   const ctx = canvas.getContext("2d");
  //   if (!ctx) return;

  //   // 1. Load the user's selfie
  //   const img = new Image();
  //   img.src = userImage;
  //   img.onload = () => {
  //     // Set canvas size to match the original photo resolution
  //     canvas.width = img.width;
  //     canvas.height = img.height;

  //     // Draw the selfie as the base layer
  //     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  //     // 2. Load the glasses PNG
  //     const glassesImg = new Image();
  //     glassesImg.src = selectedProduct.image_url;
  //     glassesImg.onload = () => {
  //       // MediaPipe coordinates are normalized (0 to 1). We convert them to actual pixels.
  //       const leftEyeOuter = landmarks[33];
  //       const rightEyeOuter = landmarks[263];
  //       const noseBridge = landmarks[168];

  //       const leftX = leftEyeOuter.x * canvas.width;
  //       const leftY = leftEyeOuter.y * canvas.height;
  //       const rightX = rightEyeOuter.x * canvas.width;
  //       const rightY = rightEyeOuter.y * canvas.height;
  //       const noseX = noseBridge.x * canvas.width;
  //       const noseY = noseBridge.y * canvas.height;

  //       // Math: Calculate angle of the head tilt
  //       const angle = Math.atan2(rightY - leftY, rightX - leftX);

  //       // Math: Calculate distance between eyes to scale the glasses
  //       const eyeDistance = Math.hypot(rightX - leftX, rightY - leftY);

  //       // Eyewear logic: The glasses should be roughly 2.2x wider than the distance between the outer eye corners.
  //       // We multiply by the backend scale_factor for fine-tuning.
  //       const baseMultiplier = 2.2;
  //       const scaleFactor = selectedProduct.vto_config?.scale_factor || 1.1;
  //       const finalWidth = eyeDistance * baseMultiplier * scaleFactor;

  //       // Maintain the aspect ratio of the glasses PNG
  //       const aspectRatio = glassesImg.width / glassesImg.height;
  //       const finalHeight = finalWidth / aspectRatio;

  //       // Apply any vertical offset from the backend (if glasses sit too high/low)
  //       const verticalOffsetPx =
  //         (selectedProduct.vto_config?.vertical_offset || 0) * canvas.height;

  //       // 3. Draw the glasses onto the canvas!
  //       ctx.save();
  //       ctx.translate(noseX, noseY + verticalOffsetPx); // Move to anchor point (nose bridge)
  //       ctx.rotate(angle); // Tilt the glasses to match the face
  //       // Draw the image centered at the translated point
  //       ctx.drawImage(
  //         glassesImg,
  //         -finalWidth / 2,
  //         -finalHeight / 2,
  //         finalWidth,
  //         finalHeight,
  //       );
  //       ctx.restore();
  //     };
  //   };
  // }, [landmarks, userImage, selectedProduct]);
  useEffect(() => {
    if (!landmarks || !userImage || !selectedProduct || !canvasRef.current)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const img = new Image();
    img.src = userImage;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw selfie
      ctx.drawImage(img, 0, 0);

      const glassesImg = new Image();
      glassesImg.src = selectedProduct.image_url;

      glassesImg.onload = () => {
        /**
         * ============================================
         * LANDMARKS
         * ============================================
         */

        const leftEyeOuter = landmarks[33];
        const rightEyeOuter = landmarks[263];

        const leftFace = landmarks[234];
        const rightFace = landmarks[454];

        /**
         * ============================================
         * PIXEL POSITIONS
         * ============================================
         */

        const leftEyeX = leftEyeOuter.x * canvas.width;
        const leftEyeY = leftEyeOuter.y * canvas.height;

        const rightEyeX = rightEyeOuter.x * canvas.width;
        const rightEyeY = rightEyeOuter.y * canvas.height;

        /**
         * ============================================
         * FACE CENTER
         * ============================================
         */

        const centerX = (leftEyeX + rightEyeX) / 2;
        const centerY = (leftEyeY + rightEyeY) / 2;

        /**
         * ============================================
         * FACE ROTATION
         * ============================================
         */

        const angle =
          Math.atan2(rightEyeY - leftEyeY, rightEyeX - leftEyeX) +
          (selectedProduct.vto_config?.rotation_offset || 0);

        /**
         * ============================================
         * FACE WIDTH
         * ============================================
         */

        const faceWidth = Math.abs(rightFace.x - leftFace.x) * canvas.width;

        /**
         * ============================================
         * SCALE
         * ============================================
         */

        const faceWidthRatio =
          selectedProduct.vto_config?.face_width_ratio || 0.78;

        const scaleFactor = selectedProduct.vto_config?.scale_factor || 1;

        const finalWidth = faceWidth * faceWidthRatio * scaleFactor;

        /**
         * ============================================
         * HEIGHT
         * ============================================
         */

        const aspectRatio = glassesImg.width / glassesImg.height;

        const finalHeight = finalWidth / aspectRatio;

        /**
         * ============================================
         * OFFSETS
         * ============================================
         */

        const verticalOffset =
          (selectedProduct.vto_config?.vertical_offset || 0) * canvas.height;

        const horizontalOffset =
          (selectedProduct.vto_config?.horizontal_offset || 0) * canvas.width;

        /**
         * ============================================
         * DEPTH / PERSPECTIVE
         * ============================================
         */

        const faceDepth = Math.abs(leftEyeOuter.z - rightEyeOuter.z);

        const perspectiveStrength =
          selectedProduct.vto_config?.perspective_strength || 0.15;

        const depthScale = 1 - faceDepth * perspectiveStrength;

        const adjustedWidth = finalWidth * depthScale;

        /**
         * ============================================
         * DRAW
         * ============================================
         */

        ctx.save();

        ctx.translate(centerX + horizontalOffset, centerY + verticalOffset);

        ctx.rotate(angle);

        ctx.drawImage(
          glassesImg,
          -adjustedWidth / 2,
          -finalHeight / 2,
          adjustedWidth,
          finalHeight,
        );

        ctx.restore();
      };
    };
  }, [landmarks, userImage, selectedProduct]);

  const handleClose = () => {
    setSelectedProduct(null);
    setUserImage(null);
    setLandmarks(null);
  };

  const downloadResult = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `vto-${selectedProduct?.name.replace(/\s+/g, "-")}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <Dialog open={!!selectedProduct} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[95vw] rounded-xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            Try On: {selectedProduct?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center mt-4">
          {!userImage ? (
            <div className="flex flex-col items-center w-full">
              <div className="bg-zinc-50 p-8 rounded-xl border-2 border-dashed border-zinc-200 w-full text-center">
                <p className="text-sm text-zinc-500 mb-6">
                  For best results, upload a clear, front-facing selfie in good
                  lighting.
                </p>

                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAILoading}
                  className="w-full gap-2 bg-zinc-900 text-white hover:bg-zinc-800"
                >
                  {isAILoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Loading
                      AI...
                    </>
                  ) : (
                    <>
                      <Upload size={18} /> Upload Selfie
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative w-full flex flex-col items-center gap-4">
              {/* The Canvas replaces the static image preview */}
              <div className="relative w-full rounded-lg overflow-hidden bg-zinc-100 flex items-center justify-center border border-zinc-200">
                {/* Hidden image tag just to trigger the AI load */}
                <img
                  src={userImage}
                  alt="Hidden user selfie"
                  className="hidden"
                  crossOrigin="anonymous"
                  onLoad={handleImageLoad}
                />

                {/* The final visible output */}
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>

              <div className="gap-2 m-1">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUserImage(null);
                    setLandmarks(null);
                  }}
                  className="w-full border-zinc-300 text-zinc-700"
                >
                  Retake Photo
                </Button>

                {/* Bonus: Let users download the final composite! */}
                <Button
                  onClick={downloadResult}
                  disabled={!landmarks}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Download size={18} /> Save Result
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
