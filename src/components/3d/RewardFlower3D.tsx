// ============================================================
// SYNAPSA — RewardFlower3D
// Kopou Phool (orchid) particle burst for successful actions
// ============================================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  active: boolean;
  position?: [number, number, number];
}

export const RewardFlower3D: React.FC<Props> = ({ active, position = [0, 0, 0] }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const petalColor = '#FF6B9D'; // Kopou Phool pink

  useFrame((_, delta) => {
    if (groupRef.current && active) {
      groupRef.current.position.y += delta * 2;
      groupRef.current.rotation.y += delta;
      // Fade out logic could be added here if we had custom shader materials, 
      // but Sparkles handles its own lifecycle usually. We'll just float it up.
    } else if (groupRef.current && !active) {
      groupRef.current.position.y = position[1];
    }
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={position}>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sparkles 
          count={50} 
          scale={5} 
          size={8} 
          speed={0.5} 
          opacity={0.8} 
          color={petalColor} 
          noise={1}
        />
        {/* Core glow */}
        <pointLight color={petalColor} intensity={2} distance={5} />
      </Float>
    </group>
  );
};
