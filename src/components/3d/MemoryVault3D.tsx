import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, Box, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const MemoryVault3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.3;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} color="#fbcfe8" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#3B82F6" />

      {/* Floating Memory Frames (Abstract) */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={1} floatingRange={[-1, 1]} position={[-6, 3, -8]}>
        <Box args={[2, 3, 0.1]} rotation={[0, 0.4, 0]}>
          <MeshDistortMaterial color="#fbcfe8" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.9} roughness={0.1} distort={0.1} speed={1} transparent opacity={0.3} />
        </Box>
      </Float>

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.5} floatingRange={[-0.5, 0.5]} position={[7, -2, -6]}>
        <Box args={[3, 2, 0.1]} rotation={[0, -0.5, 0]}>
          <MeshDistortMaterial color="#3B82F6" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.9} roughness={0.1} distort={0.1} speed={1.5} transparent opacity={0.4} />
        </Box>
      </Float>
      
      <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.5} floatingRange={[-0.2, 0.2]} position={[-4, -4, -4]}>
        <Box args={[1.5, 1.5, 0.1]} rotation={[0.2, 0.2, 0]}>
          <MeshDistortMaterial color="#10B981" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.9} roughness={0.1} distort={0.1} speed={0.8} transparent opacity={0.2} />
        </Box>
      </Float>

      {/* Atmospheric Dust */}
      <Sparkles count={80} scale={20} size={4} speed={0.1} opacity={0.2} color="#fdfbf7" />
    </group>
  );
};
