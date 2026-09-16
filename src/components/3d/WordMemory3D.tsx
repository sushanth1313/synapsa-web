import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Box, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const WordMemory3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 5, 10]} intensity={1.5} color="#8B5CF6" />
      <pointLight position={[-5, -5, -2]} intensity={1} color="#3B82F6" />

      {/* Floating abstract lexical structures */}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 12;
        const y = (Math.random() - 0.5) * 8;
        
        return (
          <Float key={i} speed={0.5 + Math.random()} rotationIntensity={1} floatIntensity={1} position={[x, y, -2 - Math.random() * 4]}>
            <Box args={[2, 0.5, 0.5]}>
              <MeshDistortMaterial color="#8B5CF6" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.2} speed={1.5} transparent opacity={0.2} />
            </Box>
          </Float>
        );
      })}

      <Sparkles count={50} scale={15} size={3} speed={0.3} opacity={0.3} color="#8B5CF6" />
    </group>
  );
};
