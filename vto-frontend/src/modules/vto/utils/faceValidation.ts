export type ValidationStatus =
  | "NO_FACE"
  | "CENTER_FACE"
  | "TILT_HEAD_LEVEL"
  | "LOOK_STRAIGHT"
  | "LOOK_UP"
  | "LOOK_DOWN"
  | "PERFECT";

export function validateFacePose(landmarks: any[] | null): ValidationStatus {
  if (!landmarks || landmarks.length === 0) return "NO_FACE";

  // Key MediaPipe Indices
  const nose = landmarks[1];
  const leftEyeOuter = landmarks[33];
  const rightEyeOuter = landmarks[263];
  const leftEar = landmarks[234];
  const rightEar = landmarks[454];
  const topForehead = landmarks[10];
  const chin = landmarks[152];

  // 1. POSITION: Widened from a strict center to allowing the face anywhere in the middle 60% of the image.
  if (nose.x < 0.2 || nose.x > 0.8 || nose.y < 0.2 || nose.y > 0.8) {
    return "CENTER_FACE";
  }

  // 2. ROLL (Tilt):  engine rotates the canvas natively!
  // Relaxed from a strict 6 degrees to a very forgiving 22 degrees.
  const eyeAngle =
    Math.atan2(
      rightEyeOuter.y - leftEyeOuter.y,
      rightEyeOuter.x - leftEyeOuter.x,
    ) *
    (180 / Math.PI);
  if (eyeAngle > 15 || eyeAngle < -15) {
    return "TILT_HEAD_LEVEL";
  }

  // 3. YAW (Looking Left/Right): Widened the ratio.
  // Now allows users to be looking slightly off-camera (like the boy in the blue hoodie).
  const distLeft = nose.x - leftEar.x;
  const distRight = rightEar.x - nose.x;
  const yawRatio = distLeft / (distLeft + distRight);
  if (yawRatio < 0.32 || yawRatio > 0.68) {
    return "LOOK_STRAIGHT";
  }

  // 4. PITCH (Looking Up/Down): Widened to allow natural camera angles.
  const distTop = nose.y - topForehead.y;
  const distBottom = chin.y - nose.y;
  const pitchRatio = distTop / (distTop + distBottom);
  if (pitchRatio < 0.28) return "LOOK_DOWN";
  if (pitchRatio > 0.65) return "LOOK_UP";

  return "PERFECT"; // The image passed our relaxed checks!
}

export function getValidationMessage(status: ValidationStatus): string {
  switch (status) {
    case "NO_FACE":
      return "Looking for face...";
    case "CENTER_FACE":
      return "Bring your face into view";
    case "TILT_HEAD_LEVEL":
      return "Keep your head mostly level";
    case "LOOK_STRAIGHT":
      return "Face the camera a bit more";
    case "LOOK_UP":
      return "Tilt your head up slightly";
    case "LOOK_DOWN":
      return "Tilt your head down slightly";
    case "PERFECT":
      return "Perfect! Hold still.";
    default:
      return "Position face in frame";
  }
}
