import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const CompanionPageBackground3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
    if (coreRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      coreRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -8]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1.5} color="#8B5CF6" />
      <pointLight position={[-5, 0, -2]} intensity={2} color="#60A5FA" />
      <pointLight position={[5, -5, -2]} intensity={1.5} color="#F472B6" />

      {/* Central neural core */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5} position={[0, 0, -2]}>
        <Sphere ref={coreRef} args={[3, 64, 64]}>
          <MeshDistortMaterial color="#8B5CF6" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.2} speed={2} transparent opacity={0.2} />
        </Sphere>
      </Float>

      {/* Orbiting nodes */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 6;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle * 2) * 2;
        const z = Math.sin(angle) * radius;
        
        return (
          <Float key={i} speed={1.5} rotationIntensity={1} floatIntensity={1.5} position={[x, y, z]}>
            <Sphere args={[0.5, 32, 32]}>
              <MeshDistortMaterial color="#60A5FA" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.9} roughness={0.1} distort={0.4} speed={3} transparent opacity={0.3} />
            </Sphere>
          </Float>
        );
      })}

      <Sparkles count={100} scale={25} size={3} speed={0.4} opacity={0.4} color="#F472B6" />
    </group>
  );
};
