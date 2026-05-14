/**
 * Calculates 3D position, rotation, and scale from MediaPipe landmarks
 * @param landmarks  478 MediaPipe face landmarks (normalized 0–1)
 * @param viewport   R3F viewport { width, height } in world units at z=0
 */
export function getFaceTransform(
  landmarks: any,
  viewport: { width: number; height: number },
) {
  // ── Anchor points ──────────────────────────────────────────────────────
  const bridge = landmarks[168]; // Nose bridge (between eyes) — stable pivot
  const chin = landmarks[152];
  const leftEye = landmarks[33];  // Left eye outer corner
  const rightEye = landmarks[263]; // Right eye outer corner

  // ── Reference dimension (aspect-ratio invariant) ───────────────────────
  // ANTIGRAVITY PATCH: We rely EXCLUSIVELY on viewport.height for all spatial
  // calculations. This ensures that regardless of the container's CSS width,
  // the physical rendering math remains perfectly constant.
  const ref = viewport.height;

  // ── POSITION ───────────────────────────────────────────────────────────
  // Calculate the aspect ratio of the current viewport
  const aspect = viewport.width / viewport.height;

  // ANTIGRAVITY PATCH: We normalize the X calculation. Since the MediaPipe
  // coordinates (0-1) stretch across the width, we must account for the aspect
  // ratio to translate that 0-1 range into physical world units correctly
  // without relying on the absolute `viewport.width` multiplier.
  const x = -(bridge.x - 0.5) * (ref * aspect);

  const y = -(bridge.y - 0.5) * ref;
  const z = -bridge.z * ref;

  // ── ROTATION ───────────────────────────────────────────────────────────
  const pitch = Math.atan2(chin.y - bridge.y, chin.z - bridge.z) - Math.PI / 2;
  const yaw = Math.atan2(rightEye.z - leftEye.z, rightEye.x - leftEye.x);
  const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

  // ── SCALE ──────────────────────────────────────────────────────────────
  // 3D eye distance (pose-invariant)
  const dx = rightEye.x - leftEye.x;
  const dy = rightEye.y - leftEye.y;
  const dz = rightEye.z - leftEye.z;
  const rawEyeDist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Use `ref` (viewport.height) so scale is identical across aspect ratios.
  const scale = rawEyeDist3D * ref;

  return { position: [x, y, z] as const, rotation: [pitch, yaw, roll] as const, scale };
}