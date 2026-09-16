import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Box, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const MemoryGame3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -4]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 5, 2]} intensity={1.2} color="#D97706" />
      <pointLight position={[-5, -5, -2]} intensity={1.5} color="#3B82F6" />

      {/* Floating Cards Background */}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 15;
        const y = (Math.random() - 0.5) * 15;
        const z = -2 - Math.random() * 5;
        const rotX = Math.random() * Math.PI;
        const rotY = Math.random() * Math.PI;

        return (
          <Float key={i} speed={1 + Math.random()} rotationIntensity={1} floatIntensity={2} position={[x, y, z]}>
            <Box args={[1.5, 2, 0.05]} rotation={[rotX, rotY, 0]}>
              <MeshDistortMaterial color={i % 2 === 0 ? "#D97706" : "#3B82F6"} envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.9} roughness={0.1} distort={0.1} speed={2} transparent opacity={0.3} />
            </Box>
          </Float>
        );
      })}
    </group>
  );
};
