import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Box, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const CategorySort3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1} color="#3B82F6" />
      <pointLight position={[-5, 0, -2]} intensity={1.5} color="#D97706" />

      {/* Buckets/Sections represented by large abstract planes */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.5} position={[-4, 0, -4]}>
        <Box args={[4, 6, 0.1]} rotation={[0, 0.2, 0]}>
          <MeshDistortMaterial color="#3B82F6" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.9} roughness={0.1} distort={0.1} speed={1} transparent opacity={0.15} />
        </Box>
      </Float>

      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5} position={[4, 0, -4]}>
        <Box args={[4, 6, 0.1]} rotation={[0, -0.2, 0]}>
          <MeshDistortMaterial color="#D97706" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.9} roughness={0.1} distort={0.1} speed={1.5} transparent opacity={0.15} />
        </Box>
      </Float>

      {/* Sorting particles */}
      <Sparkles count={60} scale={15} size={4} speed={0.4} opacity={0.3} color="#fdfbf7" />
    </group>
  );
};
