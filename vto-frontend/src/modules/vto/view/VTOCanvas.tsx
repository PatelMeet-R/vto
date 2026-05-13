import { useVTOEngine } from "@/hooks/useVTOEngine";

export function VTOCanvas({
  product,
  userImage,
  landmarks,
}: {
  product: any;
  userImage: string;
  landmarks: any;
}) {
  //  shared face data and the specific card's product into the engine
  const { canvasRef } = useVTOEngine(landmarks, userImage, product);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-cover rounded-t-xl"
    />
  );
}
