import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Box, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const FindChange3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#3B82F6" />
      <pointLight position={[-10, -10, -5]} intensity={1.5} color="#D97706" />

      {/* Subtle Abstract Forms */}
      <Float speed={1} rotationIntensity={1} floatIntensity={1} position={[-4, 2, -6]}>
        <Box args={[2, 2, 2]}>
          <MeshDistortMaterial color="#3B82F6" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.2} speed={1.5} transparent opacity={0.3} />
        </Box>
      </Float>

      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={2} position={[5, -2, -8]}>
        <Box args={[3, 1.5, 1.5]}>
          <MeshDistortMaterial color="#D97706" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.3} speed={2} transparent opacity={0.2} />
        </Box>
      </Float>

      <Sparkles count={60} scale={20} size={3} speed={0.2} opacity={0.3} color="#fdfbf7" />
    </group>
  );
};
