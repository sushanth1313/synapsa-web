import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Box, Sphere, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const OddOneOut3D: React.FC = () => {
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

      {/* Identical boxes with one sphere */}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = (i - 2) * 3;
        const y = Math.sin(i * 1.5) * 2;
        const isOdd = i === 2;

        return (
          <Float key={i} speed={isOdd ? 2 : 1} rotationIntensity={isOdd ? 2 : 0.5} floatIntensity={1} position={[x, y, -2 - Math.random() * 2]}>
            {isOdd ? (
              <Sphere args={[1.2, 32, 32]}>
                <MeshDistortMaterial color="#D97706" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.4} speed={2} transparent opacity={0.3} />
              </Sphere>
            ) : (
              <Box args={[1.5, 1.5, 1.5]}>
                <MeshDistortMaterial color="#3B82F6" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.1} speed={1} transparent opacity={0.2} />
              </Box>
            )}
          </Float>
        );
      })}

      <Sparkles count={50} scale={20} size={3} speed={0.2} opacity={0.3} color="#fdfbf7" />
    </group>
  );
};
