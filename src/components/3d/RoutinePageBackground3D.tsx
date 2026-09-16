import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Box, Sphere, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const RoutinePageBackground3D: React.FC = () => {
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
        const x = (Math.random() - 0.5) * 15;
        const y = (Math.random() - 0.5) * 10;
        const z = -2 - (i * 2);
        
        return (
          <Float key={i} speed={0.5 + Math.random()} rotationIntensity={0.5} floatIntensity={1} position={[x, y, z]}>
            <Sphere args={[2, 32, 32]}>
              <MeshDistortMaterial color="#10B981" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.9} roughness={0.1} distort={0.2} speed={1.5} transparent opacity={0.15} />
            </Sphere>
          </Float>
        );
      })}

      <Sparkles count={50} scale={20} size={3} speed={0.2} opacity={0.3} color="#10B981" />
    </group>
  );
};
