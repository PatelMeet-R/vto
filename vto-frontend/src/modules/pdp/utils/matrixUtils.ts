// ─────────────────────────────────────────────────────────────────────────────
// matrixUtils.ts — Streamlined coordinate pipeline for AR face tracking
//
// Pipeline:
//   MediaPipe (normalized 0–1)
//   → Direct viewport mapping (manual TUNE offsets in ARScene)
//   → R3F world space
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Face transform: MediaPipe landmarks → Three.js world-space pose.
 *
 * Simplified mapping — no object-fit:cover math.
 * Fine-tuning is handled by the TUNE constants in ARScene.
 *
 * @param landmarks  478 MediaPipe face landmarks (normalized 0–1)
 * @param viewport   R3F viewport { width, height } in world units at z=0
 */
export function getFaceTransform(
  landmarks: any,
  viewport: { width: number; height: number },
) {
  // ── Anchor points ──────────────────────────────────────────────────────
  const bridge   = landmarks[168]; // Nose bridge (between eyes) — stable pivot
  const chin     = landmarks[152];
  const leftEye  = landmarks[33];  // Left eye outer corner
  const rightEye = landmarks[263]; // Right eye outer corner

  // ── POSITION ───────────────────────────────────────────────────────────
  const x = -(bridge.x - 0.5) * viewport.width;
  const y = -(bridge.y - 0.5) * viewport.height;
  const z = -bridge.z * viewport.width;

  // ── ROTATION ───────────────────────────────────────────────────────────
  const pitch = Math.atan2(chin.y - bridge.y, chin.z - bridge.z) - Math.PI / 2;
  const yaw   = Math.atan2(rightEye.z - leftEye.z, rightEye.x - leftEye.x);
  const roll  = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

  // ── SCALE ──────────────────────────────────────────────────────────────
  // 3D eye distance (pose-invariant)
  const dx = rightEye.x - leftEye.x;
  const dy = rightEye.y - leftEye.y;
  const dz = rightEye.z - leftEye.z;
  const rawEyeDist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const scale = rawEyeDist3D * viewport.width;

  return { position: [x, y, z] as const, rotation: [pitch, yaw, roll] as const, scale };
}
