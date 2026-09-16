import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Box, Text3D, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const NumberMemory3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#10B981" />
      <pointLight position={[-5, -5, -2]} intensity={1} color="#3B82F6" />

      {/* Floating abstract numeric shapes represented by geometric forms */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = (i % 3 - 1) * 4;
        const y = Math.floor(i / 3) * 4 - 2;
        
        return (
          <Float key={i} speed={0.5 + Math.random()} rotationIntensity={1} floatIntensity={1.5} position={[x, y, -2 - Math.random() * 3]}>
            <Box args={[1.5, 1.5, 0.2]}>
              <MeshDistortMaterial color="#10B981" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.9} roughness={0.1} distort={0.2} speed={1.5} transparent opacity={0.15} />
            </Box>
          </Float>
        );
      })}

      <Sparkles count={40} scale={15} size={3} speed={0.3} opacity={0.3} color="#10B981" />
    </group>
  );
};
