/**
 * Calculates 3D position, rotation, and scale from MediaPipe landmarks
 * @param landmarks  478 MediaPipe face landmarks (normalized 0–1)
 * @param viewport   R3F viewport { width, height } in world units at z=0
 * @param video      The HTML video element to calculate object-cover cropping
 */
export function getFaceTransform(
  landmarks: any,
  viewport: { width: number; height: number },
  video?: HTMLVideoElement | null
) {
  const bridge = landmarks[168];
  const chin = landmarks[152];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];

  let cropScaleX = 1;
  let cropScaleY = 1;

  // 1. REVERSE-ENGINEER THE "OBJECT-COVER" CROP
  if (video && video.videoWidth && video.clientWidth) {
    const videoAspect = video.videoWidth / video.videoHeight;
    const containerAspect = video.clientWidth / video.clientHeight;

    if (containerAspect > videoAspect) {
      // Container is wider. Video height is heavily cropped.
      cropScaleY = (video.clientWidth / videoAspect) / video.clientHeight;
    } else if (containerAspect < videoAspect) {
      // Container is taller. Video width is heavily cropped.
      cropScaleX = (video.clientHeight * videoAspect) / video.clientWidth;
    }
  }

  // 2. APPLY CROP MULTIPLIERS TO SPATIAL COORDINATES
  const x = -(bridge.x - 0.5) * (viewport.width * cropScaleX);
  const y = -(bridge.y - 0.5) * (viewport.height * cropScaleY);

  const ref = viewport.height * cropScaleY;
  const z = -bridge.z * ref;

  const pitch = Math.atan2(chin.y - bridge.y, chin.z - bridge.z) - Math.PI / 2;
  const yaw = Math.atan2(rightEye.z - leftEye.z, rightEye.x - leftEye.x);
  const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

  const dx = rightEye.x - leftEye.x;
  const dy = rightEye.y - leftEye.y;
  const dz = rightEye.z - leftEye.z;
  const rawEyeDist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const scale = rawEyeDist3D * ref;

  return { position: [x, y, z] as const, rotation: [pitch, yaw, roll] as const, scale };
}