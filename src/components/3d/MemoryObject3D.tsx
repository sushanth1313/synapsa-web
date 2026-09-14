import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  id: string;
  emoji: string;
  label: string;
  position: [number, number, number];
  isFlipped: boolean;
  isMatched?: boolean;
  onClick?: () => void;
}

export const MemoryObject3D: React.FC<Props> = ({ id, emoji, label, position, isFlipped, isMatched, onClick }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const isMissing = id === 'missing';

  // Massive scale for judges to see clearly
  const baseScale = 2.5;
  const hoverScale = 2.8;
  const targetScale = isMatched ? baseScale * 1.1 : (hovered && !isMissing ? hoverScale : baseScale);

  // Target position Y based on hover and matched state
  const targetPositionY = isMatched ? 1 : (hovered && !isFlipped && !isMissing ? 0.3 : 0);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Smooth rotation flip
      const targetRotY = isFlipped ? Math.PI : 0;
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, delta * 5);
      
      // Smooth hover lift
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1] + targetPositionY, delta * 6);
      
      // Smooth scale
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
    }
  });

  // Void aesthetic colors
  const cardColor = isMissing ? '#000000' : '#000000';
  const borderColor = isMissing ? '#ffb829' : (hovered ? '#ffffff' : '#333333');

  return (
    <group 
      ref={meshRef} 
      position={position}
      onClick={(e) => {
        if (!isMissing && onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* The physical card/block */}
      <RoundedBox args={[1.5, 1.5, 0.2]} radius={0.15} smoothness={4}>
        {/* Core material */}
        <meshStandardMaterial 
          color={cardColor} 
          metalness={0.8}
          roughness={0.2}
          emissive={isMissing ? '#ffb829' : '#000000'}
          emissiveIntensity={isMissing ? 0.2 : 0}
          wireframe={isMissing}
        />
        
        {/* Glowing Edge outline */}
        <lineSegments>
          <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(1.5, 1.5, 0.2)]} />
          <lineBasicMaterial attach="material" color={borderColor} linewidth={2} />
        </lineSegments>
      </RoundedBox>

      {/* Front Face (Emoji + Label) */}
      <group position={[0, 0, 0.11]} rotation={[0, 0, 0]}>
        <Text 
          position={[0, 0.1, 0]} 
          fontSize={0.6} 
          color="#ffffff"
          anchorX="center" 
          anchorY="middle"
        >
          {emoji}
        </Text>
        <Text 
          position={[0, -0.4, 0]} 
          fontSize={0.2} 
          color={isMissing ? '#ffb829' : '#bdbdbd'}
          font="https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NJtEtq.woff"
          anchorX="center" 
          anchorY="middle"
        >
          {label}
        </Text>
      </group>

      {/* Back Face (Smarani Logo / Pattern) */}
      <group position={[0, 0, -0.11]} rotation={[0, Math.PI, 0]}>
        <Text 
          position={[0, 0, 0]} 
          fontSize={0.4} 
          color="#8052ff"
          font="https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NJtEtq.woff"
          anchorX="center" 
          anchorY="middle"
        >
          DALA
        </Text>
      </group>
    </group>
  );
};
