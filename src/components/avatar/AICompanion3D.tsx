import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshTransmissionMaterial, Trail } from '@react-three/drei';
import * as THREE from 'three';
import type { AIState } from '../../services';

interface Props {
  state: AIState;
  amplitude?: number;
}

export const AICompanion3D: React.FC<Props> = ({ state, amplitude = 0 }) => {
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
        return { color: '#fef08a', core: '#F59E0B', speed: 2.5 + amplitude * 2, scale: 1.1 + amplitude * 0.1, floatSpeed: 1.2, floatInt: 0.4, ringSpeed: 1.5 };
      case 'thinking':
        return { color: '#bfdbfe', core: '#1B4D3E', speed: 0.8, scale: 0.95, floatSpeed: 0.8, floatInt: 0.3, ringSpeed: 3.0 };
      case 'searching':
        return { color: '#93c5fd', core: '#1A365D', speed: 1.5, scale: 0.98, floatSpeed: 1.0, floatInt: 0.5, ringSpeed: 4.0 };
      case 'speaking':
        return { color: '#a7f3d0', core: '#15803D', speed: 3.0 + amplitude * 3, scale: 1.05 + amplitude * 0.15, floatSpeed: 2.5, floatInt: 0.8, ringSpeed: 2.0 };
      case 'success':
        return { color: '#fbcfe8', core: '#D97706', speed: 2.0, scale: 1.15, floatSpeed: 3.5, floatInt: 1.2, ringSpeed: 5.0 };
      case 'concern':
        return { color: '#fef08a', core: '#DC2626', speed: 0.5, scale: 0.9, floatSpeed: 1.0, floatInt: 0.2, ringSpeed: 0.2 };
      default:
        return { color: '#ffffff', core: '#2A6B57', speed: 1.0, scale: 1.0, floatSpeed: 1.5, floatInt: 0.6, ringSpeed: 0.5 };
    }
  };

  // Pre-calculate geometry to save memory
  const icosahedronGeo = useMemo(() => new THREE.IcosahedronGeometry(1.2, 0), []);
  const shellGeo = useMemo(() => new THREE.IcosahedronGeometry(1.3, 1), []);
  const auraGeo = useMemo(() => new THREE.SphereGeometry(2.5, 32, 32), []);
  const ringGeo1 = useMemo(() => new THREE.TorusGeometry(2.0, 0.03, 16, 100), []);
  const ringGeo2 = useMemo(() => new THREE.TorusGeometry(2.4, 0.015, 16, 100), []);
  const ringGeo3 = useMemo(() => new THREE.TorusGeometry(1.7, 0.05, 16, 100), []);

  useFrame((_state, delta) => {
    const targets = getTargetValues();
    const t = _state.clock.elapsedTime;

    // Smooth scaling for breathing/speaking
    const targetScale = new THREE.Vector3(targets.scale, targets.scale, targets.scale);
    
    if (coreRef.current) {
      coreRef.current.scale.lerp(targetScale, delta * 3);
      // Organic tumbling rotation
      coreRef.current.rotation.x += delta * 0.2 * targets.speed;
      coreRef.current.rotation.y += delta * 0.3 * targets.speed;
    }

    if (shellRef.current) {
      shellRef.current.scale.lerp(targetScale, delta * 2);
      shellRef.current.rotation.x -= delta * 0.15 * targets.speed;
      shellRef.current.rotation.y -= delta * 0.25 * targets.speed;
    }

    // Rings rotating on different axes
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.sin(t * 0.5) * 0.5;
      ring1Ref.current.rotation.y += delta * targets.ringSpeed * 0.8;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = Math.cos(t * 0.4) * 0.8;
      ring2Ref.current.rotation.z -= delta * targets.ringSpeed * 1.2;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = Math.sin(t * 0.6) * 0.6;
      ring3Ref.current.rotation.x += delta * targets.ringSpeed * 0.5;
      // Only show inner thick ring during intense states
      ring3Ref.current.scale.setScalar(state === 'speaking' || state === 'success' || state === 'listening' ? 1 : 0.001);
    }

    // Dynamic Lighting
    if (lightRef.current) {
      lightRef.current.color.lerp(new THREE.Color(targets.core), delta * 2);
      const targetIntensity = (state === 'speaking' || state === 'listening' || state === 'success') ? 4 + amplitude * 4 : 2;
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, targetIntensity, delta * 3);
    }

    // Soft pulsating aura
    if (auraRef.current) {
      const mat = auraRef.current.material as THREE.MeshBasicMaterial;
      mat.color.lerp(new THREE.Color(targets.core), delta * 1.5);
      mat.opacity = 0.04 + Math.sin(t * targets.speed * 2) * 0.02 + (amplitude * 0.05);
      auraRef.current.scale.setScalar(1 + Math.sin(t * targets.speed) * 0.05);
    }
  });

  const tv = getTargetValues();

  return (
    <Float speed={tv.floatSpeed} rotationIntensity={0.5} floatIntensity={tv.floatInt} floatingRange={[-0.2, 0.2]}>
      <group position={[0, 1.0, 0]}>
        
        {/* Soft Volumetric Aura */}
        <mesh ref={auraRef} geometry={auraGeo}>
          <meshBasicMaterial transparent opacity={0.05} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Outer Glass Shell */}
        <mesh ref={shellRef} geometry={shellGeo}>
          <MeshTransmissionMaterial
            color={tv.color}
            roughness={0.15}
            thickness={2.5}
            transmission={0.98}
            ior={1.3}
            clearcoat={1}
            clearcoatRoughness={0.1}
            chromaticAberration={0.06}
          />
        </mesh>

        {/* Inner Solid Core */}
        <mesh ref={coreRef} geometry={icosahedronGeo}>
          <meshStandardMaterial 
            color={tv.core} 
            emissive={tv.core}
            emissiveIntensity={0.8}
            roughness={0.4}
            metalness={0.8}
          />
        </mesh>

        {/* Internal Core Light */}
        <pointLight ref={lightRef} distance={12} intensity={2.5} color={tv.core} decay={2} />

        {/* Orbiting Energy Rings */}
        <mesh ref={ring1Ref} geometry={ringGeo1}>
          <meshBasicMaterial color={tv.color} transparent opacity={0.5} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh ref={ring2Ref} geometry={ringGeo2}>
          <meshBasicMaterial color={tv.core} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh ref={ring3Ref} geometry={ringGeo3}>
          <meshBasicMaterial color={tv.core} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* State-specific Particles */}
        <Sparkles
          count={state === 'idle' ? 40 : 60}
          scale={5.0}
          size={state === 'idle' ? 4 : 6}
          speed={0.3}
          opacity={0.6}
          color={tv.color}
        />
        
        {(state === 'speaking' || state === 'listening' || state === 'thinking') && (
          <Sparkles
            count={60}
            scale={7.0}
            size={8}
            speed={1.0}
            opacity={0.8}
            color={tv.core}
          />
        )}

        {state === 'success' && (
           <Sparkles count={150} scale={10} size={12} speed={2} opacity={1} color="#D97706" />
        )}
      </group>
    </Float>
  );
};
