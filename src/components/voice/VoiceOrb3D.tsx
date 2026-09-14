// ============================================================
// SYNAPSA — VoiceOrb3D
// Audio-reactive 3D orb for companion page
// ============================================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import type { AIState } from '../../services';

interface Props {
  state: AIState;
  amplitude?: number;
}

export const VoiceOrb3D: React.FC<Props> = ({ state, amplitude = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  const isActive = state === 'listening' || state === 'speaking';
  const color = state === 'listening' ? '#D97706' : '#2A6B57';
  const targetDistort = isActive ? 0.4 + amplitude * 1.5 : 0.2;
  const targetSpeed = isActive ? 2 + amplitude * 4 : 1;
  const targetScale = isActive ? 1 + amplitude * 0.4 : 0.9;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
      meshRef.current.rotation.y += delta * 0.5;
    }
    if (materialRef.current) {
      materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, targetDistort, delta * 5);
      materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, targetSpeed, delta * 5);
      materialRef.current.color.lerp(new THREE.Color(color), delta * 3);
    }
  });

  if (!isActive) return null;

  return (
    <group>
      <Sphere ref={meshRef} args={[2, 64, 64]}>
        <MeshDistortMaterial
          ref={materialRef}
          color={color}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.2}
          roughness={0.1}
          transparent
          opacity={0.8}
        />
      </Sphere>
      {/* Outer glow layer */}
      <Sphere args={[2.2, 32, 32]}>
        <MeshDistortMaterial
          color={color}
          distort={targetDistort * 1.2}
          speed={targetSpeed * 1.2}
          transparent
          opacity={0.2}
          wireframe
        />
      </Sphere>
    </group>
  );
};
