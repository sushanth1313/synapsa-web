import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const GamesLobby3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -2]}>
      {/* Ambient Depth Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#3B82F6" />
      <pointLight position={[-10, -10, -5]} intensity={1.5} color="#D97706" />

      {/* Floating Cognitive Spheres / Atoms */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1} floatingRange={[-0.5, 0.5]} position={[-4, 2, -5]}>
        <Sphere args={[1, 32, 32]}>
          <MeshDistortMaterial color="#D97706" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.2} speed={2} />
        </Sphere>
      </Float>

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5} floatingRange={[-0.8, 0.8]} position={[5, -1, -6]}>
        <Sphere args={[1.5, 32, 32]}>
          <MeshDistortMaterial color="#3B82F6" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.3} speed={1.5} />
        </Sphere>
      </Float>

      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.3, 0.3]} position={[-3, -3, -4]}>
        <Sphere args={[0.8, 32, 32]}>
          <MeshDistortMaterial color="#10B981" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.1} speed={1} />
        </Sphere>
      </Float>

      {/* Deep Atmospheric Particles */}
      <Sparkles count={100} scale={15} size={3} speed={0.2} opacity={0.3} color="#ffffff" />
    </group>
  );
};
