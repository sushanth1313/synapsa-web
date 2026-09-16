import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Box, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const SettingsPageBackground3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#9CA3AF" />
      <pointLight position={[-5, -5, -2]} intensity={0.8} color="#6B7280" />

      {/* Elegant, slow-moving geometric forms for Settings */}
      {Array.from({ length: 4 }).map((_, i) => {
        const x = (i - 1.5) * 6;
        const y = Math.sin(i) * 2;
        const z = -3 - (i % 2) * 2;
        
        return (
          <Float key={i} speed={0.2} rotationIntensity={0.2} floatIntensity={0.5} position={[x, y, z]}>
            <Box args={[3, 4, 0.2]}>
              <MeshDistortMaterial color="#4B5563" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.1} speed={0.5} transparent opacity={0.1} />
            </Box>
          </Float>
        );
      })}

      <Sparkles count={30} scale={15} size={2} speed={0.1} opacity={0.2} color="#D1D5DB" />
    </group>
  );
};
