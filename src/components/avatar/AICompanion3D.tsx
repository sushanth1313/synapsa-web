import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import type { AIState } from '../../services';

interface Props {
  state: AIState;
  amplitude?: number;
}

export const AICompanion3D: React.FC<Props> = ({ state, amplitude = 0 }) => {
  const headRef    = useRef<THREE.Mesh>(null);
  const bodyRef    = useRef<THREE.Mesh>(null);
  const shoulderLRef = useRef<THREE.Mesh>(null);
  const shoulderRRef = useRef<THREE.Mesh>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  const coreMeshRef  = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);

  const getTargetValues = () => {
    switch (state) {
      case 'idle':
        return { color: '#c8d8ce', core: '#fef08a', speed: 1.2, scale: 1, floatSpeed: 1.8, floatInt: 0.6 };
      case 'listening':
        return { color: '#fde68a', core: '#f59e0b', speed: 3 + amplitude * 2, scale: 1.05 + amplitude * 0.08, floatSpeed: 1.2, floatInt: 0.4 };
      case 'thinking':
        return { color: '#bfdbfe', core: '#3b82f6', speed: 0.8, scale: 0.97, floatSpeed: 0.6, floatInt: 0.3 };
      case 'searching':
        return { color: '#93c5fd', core: '#2563eb', speed: 1.5, scale: 0.98, floatSpeed: 1.0, floatInt: 0.4 };
      case 'speaking':
        return { color: '#a7f3d0', core: '#10b981', speed: 4 + amplitude * 3, scale: 1.03 + amplitude * 0.12, floatSpeed: 2.5, floatInt: 0.7 };
      case 'success':
        return { color: '#fbcfe8', core: '#ec4899', speed: 2.5, scale: 1.1, floatSpeed: 4, floatInt: 1.0 };
      case 'concern':
        return { color: '#fef08a', core: '#d97706', speed: 0.6, scale: 0.93, floatSpeed: 1, floatInt: 0.3 };
      default:
        return { color: '#c8d8ce', core: '#fef08a', speed: 1.2, scale: 1, floatSpeed: 1.8, floatInt: 0.6 };
    }
  };

  useFrame((_state, delta) => {
    const targets = getTargetValues();
    const t = _state.clock.elapsedTime;

    if (headRef.current && bodyRef.current) {
      const targetScale = new THREE.Vector3(targets.scale, targets.scale, targets.scale);
      headRef.current.scale.lerp(targetScale, delta * 2.5);
      bodyRef.current.scale.lerp(targetScale, delta * 2.5);

      // More pronounced breathing — visually noticeable
      const breathAmp = 0.15 + amplitude * 0.08;
      headRef.current.position.y = 2.4 + Math.sin(t * targets.speed) * breathAmp;
      headRef.current.rotation.x = Math.sin(t * targets.speed * 0.5) * 0.15;
      headRef.current.rotation.y = Math.cos(t * targets.speed * 0.35) * 0.18;
      bodyRef.current.rotation.y = Math.sin(t * targets.speed * 0.2) * 0.08;
    }

    if (shoulderLRef.current && shoulderRRef.current) {
      const t2 = _state.clock.elapsedTime;
      // Gentle sway
      shoulderLRef.current.position.y = -0.1 + Math.sin(t2 * 0.9 + 1) * 0.08;
      shoulderRRef.current.position.y = -0.1 + Math.sin(t2 * 0.9 + 2.5) * 0.08;
    }

    if (coreLightRef.current && coreMeshRef.current) {
      coreLightRef.current.color.lerp(new THREE.Color(targets.core), delta * 2);
      coreLightRef.current.intensity = THREE.MathUtils.lerp(
        coreLightRef.current.intensity,
        (state === 'speaking' || state === 'listening') ? 3 + amplitude * 3 : 2,
        delta * 3
      );

      const coreMat = coreMeshRef.current.material as THREE.MeshBasicMaterial;
      coreMat.color.lerp(new THREE.Color(targets.core), delta * 2);

      // Larger core pulse
      const coreScale = 1 + Math.sin(t * targets.speed * 2) * 0.15 + amplitude * 0.25;
      coreMeshRef.current.scale.setScalar(coreScale);
    }

    if (outerGlowRef.current) {
      const glowMat = outerGlowRef.current.material as THREE.MeshBasicMaterial;
      const targets2 = getTargetValues();
      glowMat.color.lerp(new THREE.Color(targets2.core), delta * 1.5);
      glowMat.opacity = 0.06 + Math.sin(_state.clock.elapsedTime * targets2.speed * 0.5) * 0.03;
    }
  });

  const tv = getTargetValues();

  return (
    <Float speed={tv.floatSpeed} rotationIntensity={0.15} floatIntensity={tv.floatInt}>
      <group position={[0, -1.2, 0]}>

        {/* Outer atmospheric glow shell */}
        <mesh ref={outerGlowRef} position={[0, 0.8, 0]}>
          <sphereGeometry args={[2.2, 32, 32]} />
          <meshBasicMaterial color={tv.core} transparent opacity={0.06} depthWrite={false} />
        </mesh>

        {/* Abstract Head — larger capsule */}
        <mesh ref={headRef} position={[0, 2.4, 0]}>
          <capsuleGeometry args={[0.75, 0.4, 32, 32]} />
          <MeshTransmissionMaterial
            color={tv.color}
            roughness={0.15}
            thickness={1.8}
            transmission={0.88}
            ior={1.25}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Abstract Body / Torso — broader */}
        <mesh ref={bodyRef} position={[0, 0.6, 0]}>
          <capsuleGeometry args={[1.2, 1.8, 32, 32]} />
          <MeshTransmissionMaterial
            color={tv.color}
            roughness={0.25}
            thickness={2.5}
            transmission={0.82}
            ior={1.2}
            clearcoat={1}
            clearcoatRoughness={0.2}
          />
        </mesh>

        {/* Shoulders — suggest humanoid silhouette */}
        <mesh ref={shoulderLRef} position={[-1.5, -0.1, 0]}>
          <capsuleGeometry args={[0.45, 0.7, 16, 16]} />
          <MeshTransmissionMaterial
            color={tv.color}
            roughness={0.3}
            thickness={1.5}
            transmission={0.8}
            ior={1.15}
          />
        </mesh>
        <mesh ref={shoulderRRef} position={[1.5, -0.1, 0]}>
          <capsuleGeometry args={[0.45, 0.7, 16, 16]} />
          <MeshTransmissionMaterial
            color={tv.color}
            roughness={0.3}
            thickness={1.5}
            transmission={0.8}
            ior={1.15}
          />
        </mesh>

        {/* Inner Glowing Soul / Core */}
        <mesh ref={coreMeshRef} position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.38, 32, 32]} />
          <meshBasicMaterial color={tv.core} transparent opacity={0.85} />
          <pointLight ref={coreLightRef} distance={10} intensity={2} color={tv.core} />
        </mesh>

        {/* Floating memory particles around the core */}
        <Sparkles
          position={[0, 0.9, 0]}
          count={state === 'idle' ? 20 : 35}
          scale={4.5}
          size={state === 'idle' ? 2.5 : 4}
          speed={0.25}
          opacity={0.45}
          color={tv.core}
        />

        {/* State-specific sparkles */}
        {(state === 'speaking' || state === 'listening') && (
          <Sparkles
            position={[0, 1.5, 0]}
            count={state === 'speaking' ? 60 : 30}
            scale={5}
            size={state === 'speaking' ? 8 : 5}
            speed={0.6}
            opacity={0.7}
            color={state === 'speaking' ? '#10b981' : '#f59e0b'}
          />
        )}

        {(state === 'thinking' || state === 'searching') && (
          <Sparkles
            position={[0, 2, 0]}
            count={state === 'searching' ? 60 : 40}
            scale={state === 'searching' ? 4 : 3.5}
            size={state === 'searching' ? 4 : 3.5}
            speed={state === 'searching' ? 0.8 : 0.2}
            opacity={0.45}
            color="#3b82f6"
          />
        )}

        {state === 'success' && (
          <Sparkles
            position={[0, 1, 0]}
            count={80}
            scale={6}
            size={10}
            speed={1.2}
            opacity={0.9}
            color="#ec4899"
          />
        )}
      </group>
    </Float>
  );
};
