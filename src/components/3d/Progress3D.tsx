import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Line, Environment } from '@react-three/drei';
import * as THREE from 'three';

export const Progress3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -3]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} color="#3B82F6" />

      {/* Subtle Geometric Data Lines */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Line
          key={i}
          points={[[-10, i * 1.5 - 3, -5], [10, i * 1.5 - 3, -5]]}
          color="#3B82F6"
          opacity={0.05}
          transparent
          lineWidth={1}
        />
      ))}
      
      {Array.from({ length: 5 }).map((_, i) => (
        <Line
          key={`v-${i}`}
          points={[[i * 2 - 4, -10, -6], [i * 2 - 4, 10, -6]]}
          color="#10B981"
          opacity={0.03}
          transparent
          lineWidth={1}
        />
      ))}

      {/* Data Dust */}
      <Sparkles count={50} scale={15} size={2} speed={0.5} opacity={0.3} color="#fdfbf7" />
    </group>
  );
};
