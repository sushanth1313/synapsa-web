import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Box, Sphere, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const RoutineOrder3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1.5} color="#10B981" />
      <pointLight position={[-5, 0, -2]} intensity={1} color="#3B82F6" />

      {/* Structured but flowing blocks representing steps in a routine */}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = -4 + (i * 2);
        const y = Math.sin(i) * 1;
        const z = -2 - (i % 2);
        
        return (
          <Float key={i} speed={1} rotationIntensity={0.2} floatIntensity={0.5} position={[x, y, z]}>
            <Box args={[1.5, 0.5, 0.5]}>
              <MeshDistortMaterial color="#10B981" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.9} roughness={0.1} distort={0.1} speed={1} transparent opacity={0.2} />
            </Box>
          </Float>
        );
      })}

      <Sparkles count={40} scale={15} size={3} speed={0.4} opacity={0.4} color="#fdfbf7" />
    </group>
  );
};
