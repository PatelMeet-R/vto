import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useGLTF,
  Html,
  ContactShadows,
} from "@react-three/drei";
import { Loader2 } from "lucide-react";

// 1. The Model Loader Component
function GlassesModel({ url }: { url: string }) {
  // useGLTF automatically loads and caches the .glb file
  const { scene } = useGLTF(url);

  // Center the model and scale it slightly for the hero view
  return <primitive object={scene} scale={2} position={[0, 0, 0]} />;
}

// 2. The Main Viewer Component
export function ModelViewer360({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="w-full h-full bg-zinc-100 rounded-3xl overflow-hidden relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        {/* Basic Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* Realistic HDRI Environment (Makes the glass look like real glass) */}
        <Environment preset="city" />

        {/* The Model wrapped in a Suspense boundary for loading states */}
        <Suspense
          fallback={
            <Html center>
              <div className="flex flex-col items-center gap-2 text-zinc-500">
                <Loader2 className="animate-spin" size={24} />
                <span className="text-sm font-medium">Loading 3D Asset...</span>
              </div>
            </Html>
          }
        >
          <GlassesModel url={modelUrl} />

          {/* A soft drop shadow beneath the glasses */}
          <ContactShadows
            position={[0, -1, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />
        </Suspense>

        {/* Controls to let the user spin and zoom the glasses */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={8}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}

// Pre-load the model so it snaps in instantly if they navigate away and back
useGLTF.preload("/models/glasses.glb");
