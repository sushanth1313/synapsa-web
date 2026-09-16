import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Box, Line, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const VisualPath3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  const points = [
    [-4, 2, -2],
    [-2, -2, -4],
    [2, -1, -3],
    [4, 3, -5]
  ].map(p => new THREE.Vector3(...p));

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1.5} color="#10B981" />
      <pointLight position={[-5, -5, -2]} intensity={1.5} color="#3B82F6" />

      {/* Connection lines representing paths */}
      <Line points={points} color="#10B981" lineWidth={2} transparent opacity={0.3} />
      
      {points.map((p, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={1} position={[p.x, p.y, p.z]}>
          <Box args={[0.5, 0.5, 0.5]}>
            <MeshDistortMaterial color="#3B82F6" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.2} speed={1.5} transparent opacity={0.4} />
          </Box>
        </Float>
      ))}

      <Sparkles count={50} scale={15} size={3} speed={0.3} opacity={0.3} color="#10B981" />
    </group>
  );
};
