import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';

export const MemoryJourney3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Simulate forward movement through space
      groupRef.current.position.z = (state.clock.elapsedTime * 0.5) % 5;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -10]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, -5]} intensity={1.5} color="#A78BFA" />
      <pointLight position={[5, -5, -15]} intensity={2} color="#34D399" />
      <pointLight position={[-5, 5, -10]} intensity={1.5} color="#FBBF24" />

      <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />

      {/* Floating abstract landmarks along the journey */}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 15;
        const z = -5 - (i * 4); // Spread them deeply into the Z axis
        
        return (
          <Float key={i} speed={0.5} rotationIntensity={1} floatIntensity={2} position={[x, y, z]}>
            <Sphere args={[1 + Math.random() * 2, 32, 32]}>
              <MeshDistortMaterial color={i % 2 === 0 ? "#A78BFA" : "#34D399"} envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.4} speed={2} transparent opacity={0.15} />
            </Sphere>
          </Float>
        );
      })}

      <Sparkles count={150} scale={30} size={3} speed={0.5} opacity={0.4} color="#fdfbf7" />
    </group>
  );
};
