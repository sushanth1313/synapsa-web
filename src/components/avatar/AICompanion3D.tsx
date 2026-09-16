import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshTransmissionMaterial, Trail } from '@react-three/drei';
import * as THREE from 'three';
import type { AIState } from '../../services';

interface Props {
  state: AIState;
  isVisible?: boolean;
}

export const AICompanion3D: React.FC<Props> = ({ state, isVisible = true }) => {
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  // State-driven target configurations
  const getTargetValues = () => {
    switch (state) {
      case 'idle':
        return { color: '#ffffff', core: '#2A6B57', speed: 1.0, scale: 1.0, floatSpeed: 1.5, floatInt: 0.6, ringSpeed: 0.5 };
      case 'listening':
        return { color: '#fef08a', core: '#F59E0B', speed: 2.5, scale: 1.1, floatSpeed: 1.2, floatInt: 0.4, ringSpeed: 1.5 };
      case 'thinking':
        return { color: '#bfdbfe', core: '#1B4D3E', speed: 0.8, scale: 0.95, floatSpeed: 0.8, floatInt: 0.3, ringSpeed: 3.0 };
      case 'searching':
        return { color: '#93c5fd', core: '#1A365D', speed: 1.5, scale: 0.98, floatSpeed: 1.0, floatInt: 0.5, ringSpeed: 4.0 };
      case 'speaking':
        return { color: '#a7f3d0', core: '#15803D', speed: 3.0, scale: 1.05, floatSpeed: 2.5, floatInt: 0.8, ringSpeed: 2.0 };
      case 'success':
        return { color: '#fbcfe8', core: '#D97706', speed: 2.0, scale: 1.15, floatSpeed: 3.5, floatInt: 1.2, ringSpeed: 5.0 };
      case 'concern':
        return { color: '#fef08a', core: '#DC2626', speed: 0.5, scale: 0.9, floatSpeed: 1.0, floatInt: 0.2, ringSpeed: 0.2 };
      default:
        return { color: '#ffffff', core: '#2A6B57', speed: 1.0, scale: 1.0, floatSpeed: 1.5, floatInt: 0.6, ringSpeed: 0.5 };
    }
  };

  // Pre-calculate geometry to save memory
  // Use a soft capsule as the core instead of a sharp icosahedron
  const coreGeo = useMemo(() => new THREE.CapsuleGeometry(0.8, 1.2, 32, 32), []);
  // Outer shell uses a slightly larger capsule
  const shellGeo = useMemo(() => new THREE.CapsuleGeometry(1.0, 1.4, 32, 32), []);
  const auraGeo = useMemo(() => new THREE.SphereGeometry(3.0, 32, 32), []);
  
  // Create beautiful interlocking rings
  const ringGeo1 = useMemo(() => new THREE.TorusGeometry(2.5, 0.02, 16, 100), []);
  const ringGeo2 = useMemo(() => new THREE.TorusGeometry(3.2, 0.01, 16, 100), []);
  const ringGeo3 = useMemo(() => new THREE.TorusGeometry(1.8, 0.08, 16, 100), []);

  useFrame((_state, delta) => {
    if (!isVisible) return; // Completely skip CPU calculations when hidden

    const targets = getTargetValues();
    const t = _state.clock.elapsedTime;

    // Simulated voice amplitude calculated dynamically in the render loop for zero React overhead
    const simAmp = (state === 'speaking' || state === 'listening') 
      ? (Math.sin(t * 15) * 0.5 + 0.5) * (Math.sin(t * 5) * 0.5 + 0.5) 
      : 0;

    // Smooth scaling for breathing/speaking
    const targetScale = new THREE.Vector3(targets.scale + simAmp * 0.1, targets.scale + simAmp * 0.1, targets.scale + simAmp * 0.1);
    
    if (coreRef.current) {
      coreRef.current.scale.lerp(targetScale, delta * 3);
      // Organic tumbling rotation
      coreRef.current.rotation.x = Math.sin(t * 0.2) * 0.1 * targets.speed;
      coreRef.current.rotation.y += delta * 0.1 * targets.speed;
    }

    if (shellRef.current) {
      shellRef.current.scale.lerp(targetScale, delta * 2);
      shellRef.current.rotation.x = Math.cos(t * 0.15) * 0.1 * targets.speed;
      shellRef.current.rotation.y -= delta * 0.08 * targets.speed;
    }

    // Cinematic interlocking ring animation
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.sin(t * 0.3) * 0.8;
      ring1Ref.current.rotation.y += delta * targets.ringSpeed * 0.4;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = Math.cos(t * 0.2) * 1.2;
      ring2Ref.current.rotation.z -= delta * targets.ringSpeed * 0.6;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = Math.sin(t * 0.4) * 0.5;
      ring3Ref.current.rotation.x += delta * targets.ringSpeed * 0.3;
      // Fade/Scale thick ring based on intensity
      const targetRing3Scale = (state === 'speaking' || state === 'success' || state === 'listening') ? 1 : 0.001;
      ring3Ref.current.scale.setScalar(THREE.MathUtils.lerp(ring3Ref.current.scale.x, targetRing3Scale, delta * 2));
    }

    // Dynamic Lighting
    if (lightRef.current) {
      lightRef.current.color.lerp(new THREE.Color(targets.core), delta * 2);
      const targetIntensity = (state === 'speaking' || state === 'listening' || state === 'success') ? 6 + simAmp * 5 : 3;
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, targetIntensity, delta * 3);
    }

    // Soft pulsating aura
    if (auraRef.current) {
      const mat = auraRef.current.material as THREE.MeshBasicMaterial;
      mat.color.lerp(new THREE.Color(targets.core), delta * 1.5);
      mat.opacity = 0.03 + Math.sin(t * targets.speed * 1.5) * 0.02 + (simAmp * 0.04);
      auraRef.current.scale.setScalar(1 + Math.sin(t * targets.speed) * 0.08);
    }
  });

  const tv = getTargetValues();

  return (
    <Float speed={tv.floatSpeed} rotationIntensity={0.2} floatIntensity={tv.floatInt} floatingRange={[-0.3, 0.3]}>
      <group position={[0, 1.2, 0]}>
        
        {/* Soft Volumetric Aura */}
        <mesh ref={auraRef} geometry={auraGeo}>
          <meshBasicMaterial transparent opacity={0.03} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Outer Glass Shell */}
        <mesh ref={shellRef} geometry={shellGeo}>
          <MeshTransmissionMaterial
            color={tv.color}
            roughness={0.1}
            thickness={3.0}
            transmission={0.99}
            ior={1.4}
            clearcoat={1}
            clearcoatRoughness={0.05}
            chromaticAberration={0.08}
            resolution={128} // Restored premium glass resolution
            samples={2}
            backside={false}
          />
        </mesh>

        {/* Inner Solid Core */}
        <mesh ref={coreRef} geometry={coreGeo}>
          <meshStandardMaterial 
            color={tv.core} 
            emissive={tv.core}
            emissiveIntensity={0.9}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Internal Core Light */}
        <pointLight ref={lightRef} distance={15} intensity={3.0} color={tv.core} decay={1.5} />

        {/* Orbiting Energy Rings */}
        <mesh ref={ring1Ref} geometry={ringGeo1}>
          <meshBasicMaterial color={tv.color} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh ref={ring2Ref} geometry={ringGeo2}>
          <meshBasicMaterial color={tv.core} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh ref={ring3Ref} geometry={ringGeo3}>
          <meshBasicMaterial color={tv.core} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* State-specific Particles */}
        <Sparkles
          count={state === 'idle' ? 100 : 150} // Restored premium particle count
          scale={6.0}
          size={state === 'idle' ? 4 : 6}
          speed={0.2}
          opacity={0.4}
          color={tv.color}
        />
        
        {(state === 'speaking' || state === 'listening' || state === 'thinking') && (
          <Sparkles
            count={120} // Restored premium particle count
            scale={8.0}
            size={8}
            speed={0.8}
            opacity={0.7}
            color={tv.core}
          />
        )}

        {state === 'success' && (
           <Sparkles count={250} scale={12} size={12} speed={1.5} opacity={1} color="#D97706" />
        )}
      </group>
    </Float>
  );
};
