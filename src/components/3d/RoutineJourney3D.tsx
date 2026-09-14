import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Float, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { RoutineItem } from '../../services';

interface Props {
  items: RoutineItem[];
  selectedIndex?: number;
}

const TypeObject: React.FC<{ type: string; completed: boolean; position: [number, number, number] }> = ({ type, completed, position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = completed ? '#15803D' : (
    type === 'hydration' ? '#4A90D9' :
    type === 'medication' ? '#D97706' :
    type === 'meal' ? '#8B5E3C' : '#2A6B57'
  );

  useFrame((_, delta) => {
    if (meshRef.current) {
      if (completed) {
        meshRef.current.rotation.y += delta * 0.5;
        meshRef.current.rotation.x += delta * 0.2;
      } else {
        meshRef.current.rotation.y += delta * 0.2;
      }
    }
  });

  return (
    <Float speed={completed ? 3 : 1} rotationIntensity={0.5} floatIntensity={1} floatingRange={[-0.1, 0.1]}>
      {type === 'hydration' ? (
        <Sphere ref={meshRef} position={position} args={[0.4, 32, 32]}>
          <meshPhysicalMaterial color={color} transmission={0.9} roughness={0.1} thickness={0.5} />
        </Sphere>
      ) : type === 'medication' ? (
        <Box ref={meshRef} position={position} args={[0.6, 0.3, 0.3]}>
          <meshStandardMaterial color={color} roughness={0.3} />
        </Box>
      ) : type === 'meal' ? (
        <Sphere ref={meshRef} position={position} args={[0.5, 32, 32]} scale={[1, 0.2, 1]}>
           <meshStandardMaterial color={color} roughness={0.8} />
        </Sphere>
      ) : (
        <Box ref={meshRef} position={position} args={[0.4, 0.4, 0.4]}>
          <meshStandardMaterial color={color} roughness={0.5} />
        </Box>
      )}
      
      {completed && (
        <pointLight position={position} color="#15803D" intensity={1} distance={2} />
      )}
    </Float>
  );
};

export const RoutineJourney3D: React.FC<Props> = ({ items }) => {
  // Generate a winding path
  const points: [number, number, number][] = [];
  const startX = -3;
  const endX = 3;
  
  items.forEach((_, i) => {
    const t = i / Math.max(1, items.length - 1);
    const x = THREE.MathUtils.lerp(startX, endX, t);
    const y = Math.sin(t * Math.PI * 2) * 1.5;
    const z = Math.cos(t * Math.PI * 2) * 0.5;
    points.push([x, y, z]);
  });

  // Create smooth curve points for the path line
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const linePoints = curve.getPoints(50);

  return (
    <group>
      {/* The glowing path */}
      <Line
        points={linePoints}
        color="#FDFBF7"
        lineWidth={3}
        transparent
        opacity={0.3}
      />
      
      {/* The items along the path */}
      {items.map((item, idx) => (
        <TypeObject 
          key={item.id} 
          type={item.type} 
          completed={item.completed} 
          position={points[idx]} 
        />
      ))}
    </group>
  );
};
