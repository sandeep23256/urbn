"use client";

import { Suspense } from "react";
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF, Html } from "@react-three/drei";

function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.4} />;
}

interface Props {
  modelUrl?: string;
  fallbackImage: string;
  productName: string;
}

// Shows the real interactive 3D viewer only when a product actually has a
// .glb model uploaded. Faking a shoe out of primitive boxes never reads as
// a shoe — it reads as a mistake — so until a real 3D scan exists, this
// just shows the product's real photo, styled to match the rest of the site.
export default function ProductViewer3D({ modelUrl, fallbackImage, productName }: Props) {
  if (!modelUrl) {
    return (
      <div className="relative h-[320px] w-full overflow-hidden rounded-2xl bg-black/5 sm:h-[420px] md:h-[520px]">
        <Image
          src={fallbackImage}
          alt={productName}
          fill
          sizes="(max-width: 768px) 90vw, 500px"
          className="object-cover"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/80 px-3 py-1 text-xs text-bone/60 backdrop-blur">
          3D preview coming soon for this pair
        </p>
      </div>
    );
  }

  return (
    <div className="h-[320px] w-full rounded-2xl bg-black/5 sm:h-[420px] md:h-[520px]">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [2.6, 1.4, 2.6], fov: 40 }}
        gl={{ powerPreference: "high-performance", antialias: true }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            console.warn("3D viewer lost its GPU context — this is harmless, just visual.");
          });
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 4]} intensity={1.1} castShadow />
        <Suspense
          fallback={
            <Html center className="text-sm text-bone/60">
              Loading model…
            </Html>
          }
        >
          <GLTFModel url={modelUrl} />
          <ContactShadows position={[0, -0.55, 0]} opacity={0.5} scale={5} blur={2.2} />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={5}
          autoRotate
          autoRotateSpeed={1.2}
        />
      </Canvas>
      <p className="mt-2 text-center text-xs text-bone/40">Drag to rotate · scroll to zoom</p>
    </div>
  );
}
