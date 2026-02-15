"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function ShieldOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} scale={1.6}>
        <icosahedronGeometry args={[1, 8]} />
        <MeshDistortMaterial
          color="#c084fc"
          emissive="#7c3aed"
          emissiveIntensity={0.15}
          roughness={0.2}
          metalness={0.8}
          distort={0.2}
          speed={2}
          transparent
          opacity={0.12}
        />
      </mesh>
      {/* Inner glow sphere */}
      <mesh scale={1.3}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0.03} />
      </mesh>
    </Float>
  );
}

function Particles() {
  const count = 120;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const temp = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3] + Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.3;
      const y = positions[i * 3 + 1] + Math.cos(state.clock.elapsedTime * 0.2 + i * 0.5) * 0.3;
      const z = positions[i * 3 + 2];
      temp.position.set(x, y, z);
      const scale = 0.015 + Math.sin(state.clock.elapsedTime + i) * 0.008;
      temp.scale.set(scale, scale, scale);
      temp.updateMatrix();
      meshRef.current.setMatrixAt(i, temp.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#c084fc" transparent opacity={0.15} />
    </instancedMesh>
  );
}

function OrbitalRing({ radius, speed, color }: { radius: number; speed: number; color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * speed;
      ringRef.current.rotation.x = Math.PI / 3;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.008, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} />
    </mesh>
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
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.6} color="#c084fc" />
        <pointLight position={[-5, -3, 3]} intensity={0.4} color="#f472b6" />
        <spotLight position={[0, 8, 4]} angle={0.3} intensity={0.5} color="#a78bfa" penumbra={1} />

        <ShieldOrb />
        <Particles />
        <OrbitalRing radius={3.2} speed={0.15} color="#c084fc" />
        <OrbitalRing radius={3.8} speed={-0.1} color="#f472b6" />
      </Canvas>
    </div>
  );
}
