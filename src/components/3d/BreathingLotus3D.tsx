import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshTransmissionMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  phase: string; // 'Breathe In' | 'Hold' | 'Breathe Out' | 'idle'
}

export const BreathingLotus3D: React.FC<Props> = ({ phase }) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreMaterial = useRef<any>(null);
  const auraMaterial = useRef<THREE.MeshBasicMaterial>(null);

  // Define target states based on breath step
  const getTargets = () => {
    switch (phase) {
      case 'idle':
        return { scale: 1.0, color: '#1B4D3E', distort: 0.1, transmission: 0.8, opacity: 0.2 };
      case 'Breathe In':
        return { scale: 1.8, color: '#3b82f6', distort: 0.3, transmission: 0.95, opacity: 0.6 };
      case 'Hold':
        return { scale: 1.8, color: '#F59E0B', distort: 0.15, transmission: 0.9, opacity: 0.5 };
      case 'Breathe Out':
        return { scale: 1.0, color: '#1B4D3E', distort: 0.05, transmission: 0.8, opacity: 0.2 };
      default:
        return { scale: 1.0, color: '#1B4D3E', distort: 0.1, transmission: 0.8, opacity: 0.2 };
    }
  };

  useFrame((_, delta) => {
    const targets = getTargets();
    
    if (groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(targets.scale, targets.scale, targets.scale), delta * 1.2);
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x += delta * 0.1;
    }

    if (coreMaterial.current) {
      coreMaterial.current.color.lerp(new THREE.Color(targets.color), delta * 1.5);
      coreMaterial.current.distort = THREE.MathUtils.lerp(coreMaterial.current.distort, targets.distort, delta * 1.5);
    }
    
    if (auraMaterial.current) {
      auraMaterial.current.color.lerp(new THREE.Color(targets.color), delta * 1.5);
      auraMaterial.current.opacity = THREE.MathUtils.lerp(auraMaterial.current.opacity, targets.opacity, delta * 1.5);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.0}>
      <group ref={groupRef}>
        {/* Deep, glowing organic core */}
        <mesh>
          <sphereGeometry args={[1.5, 64, 64]} />
          <MeshDistortMaterial
            ref={coreMaterial}
            color="#1B4D3E"
            envMapIntensity={2.0}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={0.4}
            roughness={0.1}
            speed={2}
          />
        </mesh>

        {/* Outer glass/crystal shell */}
        <mesh scale={1.2}>
          <icosahedronGeometry args={[1.5, 4]} />
          <MeshTransmissionMaterial
            color="#ffffff"
            roughness={0.1}
            thickness={2.0}
            transmission={0.9}
            ior={1.2}
            clearcoat={1}
            clearcoatRoughness={0.05}
            chromaticAberration={0.05}
          />
        </mesh>
        
        {/* Soft Aura */}
        <mesh scale={1.4}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial 
            ref={auraMaterial}
            color="#1B4D3E" 
            transparent 
            opacity={0.2} 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Healing particles */}
        <Sparkles count={80} scale={6} size={4} speed={0.5} opacity={0.5} color="#e0f2fe" />
      </group>
    </Float>
  );
};
