import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, Box, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const SoundMemory3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
      groupRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1.5} color="#F59E0B" />
      <pointLight position={[-5, -5, -2]} intensity={1} color="#3B82F6" />

      {/* Rhythmic pulses */}
      {Array.from({ length: 4 }).map((_, i) => {
        const x = (i - 1.5) * 4;
        const y = Math.sin(i * 2) * 2;
        
        return (
          <Float key={i} speed={2} rotationIntensity={1} floatIntensity={1} position={[x, y, -3]}>
            <Sphere args={[1 + Math.random(), 32, 32]}>
              <MeshDistortMaterial color="#F59E0B" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.5} speed={3} transparent opacity={0.2} />
            </Sphere>
          </Float>
        );
      })}

      <Sparkles count={50} scale={15} size={4} speed={0.5} opacity={0.3} color="#F59E0B" />
    </group>
  );
};
