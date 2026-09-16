import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const ObjectRecall3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#D97706" />
      <pointLight position={[-5, -5, -2]} intensity={1} color="#10B981" />

      {/* Floating Cognitive Orbs */}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 12;
        const y = (Math.random() - 0.5) * 12;
        
        return (
          <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={1.5} position={[x, y, -2 - Math.random() * 4]}>
            <Sphere args={[0.5 + Math.random() * 0.5, 32, 32]}>
              <MeshDistortMaterial color={i % 2 === 0 ? "#F59E0B" : "#10B981"} envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.3} speed={1.5} transparent opacity={0.2} />
            </Sphere>
          </Float>
        );
      })}

      <Sparkles count={50} scale={15} size={3} speed={0.2} opacity={0.2} color="#F59E0B" />
    </group>
  );
};
