// ============================================================
// Smarani NER — Environment3D Component
// Cinematic spatial background using Three.js and Fiber
// ============================================================

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

interface Environment3DProps {
  variant: 'home' | 'calm' | 'game' | 'routine';
  reducedMotion: boolean;
}

const Particles: React.FC<{ variant: string }> = ({ variant }) => {
  const group = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  const particleColor = useMemo(() => {
    switch (variant) {
      case 'calm': return '#89CFF0'; // soft blue
      case 'game': return '#FFB347'; // soft orange
      case 'routine': return '#98FF98'; // mint green
      case 'home':
      default: return '#E0E7FF'; // soft white/indigo
    }
  }, [variant]);

  return (
    <group ref={group}>
      {/* Volumetric dust effect */}
      <Sparkles 
        count={variant === 'calm' ? 150 : 250} 
        scale={20} 
        size={2} 
        speed={0.2} 
        opacity={0.3} 
        color={particleColor} 
      />
      {variant === 'calm' && (
        <Stars radius={50} depth={50} count={300} factor={4} saturation={0} fade speed={0.5} />
      )}
    </group>
  );
};

export const Environment3D: React.FC<Environment3DProps> = ({ variant, reducedMotion }) => {
  if (reducedMotion) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={variant === 'calm' ? 0.2 : 0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1} color="#fef3c7" />
        
        {/* Soft volumetric floating elements if needed */}
        {variant !== 'calm' && (
           <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
             {/* We can add abstract shapes here later if we want */}
           </Float>
        )}

        <Particles variant={variant} />
      </Canvas>
    </div>
  );
};
