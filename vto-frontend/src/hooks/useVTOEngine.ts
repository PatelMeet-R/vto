import { useEffect, useRef } from "react";

export function useVTOEngine(
  landmarks: any,
  userImage: string | null,
  selectedProduct: any,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      ctx.drawImage(img, 0, 0);

      const glassesImg = new Image();
      glassesImg.src = selectedProduct.image_url;

      glassesImg.onload = () => {
        // --- 2.5D MATH ENGINE ---
        const leftEyeOuter = landmarks[33];
        const rightEyeOuter = landmarks[263];

        const leftEyeX = leftEyeOuter.x * canvas.width;
        const leftEyeY = leftEyeOuter.y * canvas.height;
        const rightEyeX = rightEyeOuter.x * canvas.width;
        const rightEyeY = rightEyeOuter.y * canvas.height;

        const centerX = (leftEyeX + rightEyeX) / 2;
        const centerY = (leftEyeY + rightEyeY) / 2;

        const angle =
          Math.atan2(rightEyeY - leftEyeY, rightEyeX - leftEyeX) +
          (selectedProduct.vto_config?.rotation_offset || 0);

        const eyeDistancePx = Math.hypot(
          rightEyeX - leftEyeX,
          rightEyeY - leftEyeY,
        );
        const glassesToIpdRatio =
          selectedProduct.vto_config?.glasses_to_ipd_ratio || 2.14;
        const scaleFactor = selectedProduct.vto_config?.scale_factor || 1;
        const finalWidth = eyeDistancePx * glassesToIpdRatio * scaleFactor;

        const aspectRatio = glassesImg.width / glassesImg.height;
        const finalHeight = finalWidth / aspectRatio;

        const lensCenterYRatio =
          selectedProduct.vto_config?.lens_center_y_ratio || 0.45;
        const drawOriginY = -finalHeight * lensCenterYRatio;

        const verticalOffset =
          (selectedProduct.vto_config?.vertical_offset || 0) * canvas.height;
        const horizontalOffset =
          (selectedProduct.vto_config?.horizontal_offset || 0) * canvas.width;

        const faceDepth = leftEyeOuter.z - rightEyeOuter.z;
        const perspectiveStrength =
          selectedProduct.vto_config?.perspective_strength || 0.15;
        const depthScale = 1 - Math.abs(faceDepth) * perspectiveStrength;
        const adjustedWidth = finalWidth * depthScale;

        // --- DRAWING PIPELINE ---
        ctx.save();
        ctx.translate(centerX + horizontalOffset, centerY + verticalOffset);
        ctx.rotate(angle);

        ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
        ctx.shadowBlur = finalWidth * 0.02;
        ctx.shadowOffsetX = faceDepth * 20;
        ctx.shadowOffsetY = finalHeight * 0.03;

        ctx.drawImage(
          glassesImg,
          -adjustedWidth / 2,
          drawOriginY,
          adjustedWidth,
          finalHeight,
        );
        ctx.restore();
      };
    };
  }, [landmarks, userImage, selectedProduct]);

  return { canvasRef };
}
