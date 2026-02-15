"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PASTEL_COLORS = [
  "#c4b5fd", // violet-300
  "#f9a8d4", // pink-300
  "#fdba74", // orange-300
  "#67e8f9", // cyan-300
  "#86efac", // green-300
  "#fde68a", // amber-300
  "#a5b4fc", // indigo-300
  "#fca5a5", // red-300
];

interface BlobData {
  x: number;
  y: number;
  z: number;
  scale: number;
  speed: number;
  phase: number;
  color: string;
  distort: number;
}

function PastelBlob({ data }: { data: BlobData }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * data.speed + data.phase;
    meshRef.current.position.y = data.y + Math.sin(t) * 0.4;
    meshRef.current.position.x = data.x + Math.cos(t * 0.7) * 0.2;
    meshRef.current.rotation.x = t * 0.15;
    meshRef.current.rotation.z = t * 0.1;
  });

  return (
    <mesh ref={meshRef} position={[data.x, data.y, data.z]} scale={data.scale}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial color={data.color} transparent opacity={0.25} />
    </mesh>
  );
}

function FloatingBlobs() {
  const blobs = useMemo<BlobData[]>(() => {
    const items: BlobData[] = [];
    for (let i = 0; i < 18; i++) {
      items.push({
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 7,
        z: (Math.random() - 0.5) * 4 - 2,
        scale: 0.2 + Math.random() * 0.6,
        speed: 0.2 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        color: PASTEL_COLORS[i % PASTEL_COLORS.length],
        distort: 0.2 + Math.random() * 0.3,
      });
    }
    return items;
  }, []);

  return (
    <>
      {blobs.map((blob, i) => (
        <PastelBlob key={i} data={blob} />
      ))}
    </>
  );
}

function TinyDots() {
  const count = 60;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const temp = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const t = state.clock.elapsedTime * 0.3 + i;
      temp.position.set(
        positions[i * 3] + Math.sin(t) * 0.15,
        positions[i * 3 + 1] + Math.cos(t * 0.8) * 0.15,
        positions[i * 3 + 2]
      );
      const s = 0.02 + Math.sin(state.clock.elapsedTime * 0.5 + i * 2) * 0.01;
      temp.scale.set(s, s, s);
      temp.updateMatrix();
      meshRef.current.setMatrixAt(i, temp.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#c4b5fd" transparent opacity={0.3} />
    </instancedMesh>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.6} />
        <FloatingBlobs />
        <TinyDots />
      </Canvas>
    </div>
  );
}
