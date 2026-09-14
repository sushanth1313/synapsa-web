import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  exercising: boolean;
  breathStep: number; // 0: In, 1: Hold, 2: Out
}

export const BreathingLotus3D: React.FC<Props> = ({ exercising, breathStep }) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreMaterial = useRef<any>(null);

  // Define target states based on breath step
  const getTargets = () => {
    if (!exercising) return { scale: 1, color: '#1B4D3E', distort: 0.1 };
    switch (breathStep) {
      case 0: // Breathe In
        return { scale: 1.8, color: '#4A90D9', distort: 0.4 };
      case 1: // Hold
        return { scale: 1.8, color: '#D97706', distort: 0.2 };
      case 2: // Breathe Out
        return { scale: 1.0, color: '#1B4D3E', distort: 0.1 };
      default:
        return { scale: 1, color: '#1B4D3E', distort: 0.1 };
    }
  };

  useFrame((_, delta) => {
    const targets = getTargets();
    
    if (groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(targets.scale, targets.scale, targets.scale), delta * 1.5);
      groupRef.current.rotation.y += delta * 0.1;
    }

    if (coreMaterial.current) {
      coreMaterial.current.color.lerp(new THREE.Color(targets.color), delta * 2);
      coreMaterial.current.distort = THREE.MathUtils.lerp(coreMaterial.current.distort, targets.distort, delta * 2);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* The breathing core */}
        <Sphere args={[1.5, 64, 64]}>
          <MeshDistortMaterial
            ref={coreMaterial}
            color="#1B4D3E"
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={0.1}
            roughness={0.2}
            transparent
            opacity={0.8}
            speed={2}
          />
        </Sphere>
        
        {/* Outer protective aura */}
        <Sphere args={[1.7, 32, 32]}>
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.1} 
            wireframe 
          />
        </Sphere>
      </group>
    </Float>
  );
};
