import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { RewardFlower3D } from './RewardFlower3D';

interface Props {
  gamesPlayed: number;
  score: number;
  routineAdherence: number;
}

export const MemoryGarden3D: React.FC<Props> = ({ gamesPlayed, score, routineAdherence }) => {
  const group = useRef<THREE.Group>(null);
  
  // Calculate how many flowers/plants to show based on stats
  const flowerCount = useMemo(() => {
    // 1 base flower + 1 per 5 games + 1 per 50 score
    return Math.min(1 + Math.floor(gamesPlayed / 5) + Math.floor(score / 50), 12);
  }, [gamesPlayed, score]);

  const plants = useMemo(() => {
    return Array.from({ length: flowerCount }).map((_, i) => {
      // Distribute in a spiral or circle
      const angle = (i / flowerCount) * Math.PI * 2;
      const radius = 2 + Math.random() * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      return { id: i, position: [x, -1, z] as [number, number, number], rotation: [0, Math.random() * Math.PI, 0] as [number, number, number], scale: 0.8 + Math.random() * 0.5 };
    });
  }, [flowerCount]);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.05; // Slow ambient rotation
    }
  });

  return (
    <group ref={group}>
      {plants.map((plant) => (
        <group key={plant.id} position={plant.position} rotation={plant.rotation} scale={plant.scale}>
          <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
            <RewardFlower3D active={true} position={[0, 0, 0]} />
          </Float>
        </group>
      ))}

      {/* Garden base / Winding Journey Path (represents routine adherence) */}
      <group position={[0, -1.2, 0]}>
        {/* Base shadow/path */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[15, 15]} />
          <meshBasicMaterial color="#1B4D3E" transparent opacity={0.05} />
        </mesh>
        
        {/* Adherence Ring - A glowing cinematic arc */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2, 2.05, 64, 1, 0, (Math.PI * 2) * (routineAdherence / 100)]} />
          <meshBasicMaterial color="#FFB347" transparent opacity={0.8} />
        </mesh>
        
        {/* Base faint ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2, 2.05, 64]} />
          <meshBasicMaterial color="#2A6B57" transparent opacity={0.2} />
        </mesh>
      </group>
    </group>
  );
};
