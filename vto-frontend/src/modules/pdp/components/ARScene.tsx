import { useRef, useMemo, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { getFaceTransform } from "../utils/matrixUtils";

// ---------------------------------------------------------------------------
// ARScene – Production AR Tracking
//
// Responsibilities:
//   1. Visibility Toggle    – hide 3D group when no face is detected.
//   2. Bounding-box Norm.   – auto-center & normalize any .glb to width = 1.
//   3. Head Occluder        – invisible sphere blocking temple arms.
//   4. TUNE constants       – manual calibration for scale & offset.
// ---------------------------------------------------------------------------

// ── Calibration Panel ─────────────────────────────────────────────────────
// Tweak these values to dial in the fit for your glasses model.
export type CalibrationData = {
  scale: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
};

type ARSceneProps = {
  landmarksRef: MutableRefObject<any>;
  calibration?: CalibrationData;
};

// Default fit used by the customer VTO modal when no admin calibration is passed.
export const DEFAULT_CALIBRATION: CalibrationData = {
  "scale": 2.7,
  "offsetX": 0.15,
  "offsetY": 0,
  "offsetZ": -0.6,
  "rotateX": 0.21,
  "rotateY": 0.06,
  "rotateZ": 0
}

export function ARScene({ landmarksRef, calibration }: ARSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const tune = useMemo(
    () => ({ ...DEFAULT_CALIBRATION, ...calibration }),
    [calibration],
  );

  // ---- Load the glasses model (drei caches this automatically) ----
  const { scene } = useGLTF("/models/glasses.glb");

  // ---- Bounding Box Normalization ----
  // Clone once, center at origin, normalize width to 1 world unit.
  const normalizedModel = useMemo(() => {
    const cloned = scene.clone(true);

    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const modelSize = box.getSize(new THREE.Vector3());

    const scaleFactor = 1 / modelSize.x;
    cloned.position.sub(center);
    cloned.scale.multiplyScalar(scaleFactor);

    // Glasses render AFTER the occluder writes to the depth buffer.
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.renderOrder = 1;
      }
    });

    return cloned;
  }, [scene]);

  // ---- Per-frame tracking (pure ref mutation, zero re-renders) ----
  useFrame(() => {
    if (!groupRef.current) return;

    const landmarks = landmarksRef.current;

    if (!landmarks) {
      groupRef.current.visible = false;
      return;
    }

    const { position, rotation, scale } = getFaceTransform(landmarks, viewport);

    groupRef.current.visible = true;
    groupRef.current.position.set(position[0], position[1], position[2]);
    groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2], "YXZ");
    groupRef.current.scale.setScalar(scale * tune.scale);
  });

  // ---- Render ----
  return (
    <group ref={groupRef} visible={false}>
      {/* Invisible Head Occluder
          Renders FIRST (renderOrder 0), writes depth only (no color),
          blocking temple arms from rendering through the user's head. */}
      <mesh renderOrder={0} position={[0, -0.15, -0.6]} scale={[0.65, 1, 0.65]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          colorWrite={false}
          depthWrite={true}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Glasses model with TUNE offsets for manual calibration */}
      <group
        position={[tune.offsetX, tune.offsetY, tune.offsetZ]}
        rotation={[tune.rotateX, tune.rotateY, tune.rotateZ]}
      >
        <primitive object={normalizedModel} />
      </group>
    </group>
  );
}

// Preload the model so it's ready before the component mounts
useGLTF.preload("/models/glasses.glb");
