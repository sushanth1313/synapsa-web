import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Box, Sphere, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const FaceMemory3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 5, 5]} intensity={1.5} color="#EC4899" />
      <pointLight position={[-5, -5, -2]} intensity={1} color="#3B82F6" />

      {/* Soft floating structures representing human traits */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 12;
        const y = (Math.random() - 0.5) * 8;
        const isSphere = i % 2 === 0;
        
        return (
          <Float key={i} speed={0.5 + Math.random()} rotationIntensity={1} floatIntensity={1} position={[x, y, -2 - Math.random() * 4]}>
            {isSphere ? (
              <Sphere args={[1.5, 32, 32]}>
                <MeshDistortMaterial color="#EC4899" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.3} speed={2} transparent opacity={0.2} />
              </Sphere>
            ) : (
              <Box args={[2, 2, 0.5]}>
                <MeshDistortMaterial color="#3B82F6" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.2} speed={1.5} transparent opacity={0.2} />
              </Box>
            )}
          </Float>
        );
      })}

      <Sparkles count={50} scale={15} size={3} speed={0.3} opacity={0.3} color="#EC4899" />
    </group>
  );
};
