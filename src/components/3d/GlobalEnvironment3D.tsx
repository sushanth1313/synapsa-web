import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from '../../hooks';
import { AICompanion3D } from '../avatar/AICompanion3D';
import { useAppStore } from '../../store';

// ── Cinematic Camera Rig with mouse parallax ─────────────────────
const CameraRig = ({ path }: { path: string }) => {
  const { camera, pointer } = useThree();
  const targetRef = useRef(new THREE.Vector3(0, 0, 9));

  useFrame((_state, delta) => {
    // Route-based Z depth
    let targetZ = 9;
    let targetY = 0.5;
    let targetX = 0;

    if (path.includes('memory')) {
      targetZ = 6;
      targetY = 1;
    } else if (path.includes('pattern')) {
      targetZ = 6;
      targetY = 0.5;
    } else if (path.includes('calm')) {
      targetZ = 13;
      targetY = -0.5;
    } else if (path.includes('routine')) {
      targetZ = 9;
      targetX = -0.5;
    } else if (path.includes('companion')) {
      targetZ = 5;
      targetY = 0.2;
    }

    // Mouse parallax — larger range for more immersion
    targetRef.current.set(
      targetX + pointer.x * 1.5,
      targetY + pointer.y * 1.0,
      targetZ
    );

    // Very smooth lerp for cinematic feel
    camera.position.lerp(targetRef.current, delta * 0.8);
    camera.lookAt(0, targetY * 0.4, 0);
  });

  return null;
};

// ── Large Foreground Leaf/Flora — partial viewport entry ──────────
const ForegroundFlora = () => {
  const meshRef1 = useRef<THREE.Mesh>(null);
  const meshRef2 = useRef<THREE.Mesh>(null);
  const meshRef3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Gentle swaying in wind
    if (meshRef1.current) {
      meshRef1.current.rotation.z = Math.sin(t * 0.4) * 0.08;
    }
    if (meshRef2.current) {
      meshRef2.current.rotation.z = -Math.sin(t * 0.3 + 1) * 0.06;
    }
    if (meshRef3.current) {
      meshRef3.current.rotation.z = Math.sin(t * 0.5 + 2) * 0.07;
    }
  });

  // Large ellipsoid "leaf" shape
  const leafMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1B4D3E',
    roughness: 0.7,
    metalness: 0.0,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  }), []);

  return (
    <group>
      {/* Large left foreground leaf — partially entering from left edge */}
      <mesh ref={meshRef1} position={[-9, 2, 5]} rotation={[0.3, 0.2, -0.5]} material={leafMat}>
        <sphereGeometry args={[3.5, 12, 7]} />
      </mesh>

      {/* Right foreground branch */}
      <mesh ref={meshRef2} position={[10, -1, 5]} rotation={[0.1, -0.3, 0.6]} material={leafMat}>
        <sphereGeometry args={[3.0, 11, 7]} />
      </mesh>

      {/* Bottom right frond */}
      <mesh ref={meshRef3} position={[8, -5, 6]} rotation={[0.5, -0.2, 0.3]} material={leafMat}>
        <sphereGeometry args={[2.5, 9, 6]} />
      </mesh>

      {/* Smaller accent leaf bottom left */}
      <mesh position={[-7, -5, 5.5]} rotation={[0.4, 0.5, -0.8]} material={leafMat}>
        <sphereGeometry args={[2.0, 8, 6]} />
      </mesh>
    </group>
  );
};

// ── Midground: Northeast Hills/Terrain ───────────────────────────
const BackgroundHills = () => {
  const hillMat1 = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0F2A1E',
    roughness: 0.9,
    fog: true,
  }), []);
  const hillMat2 = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#071810',
    roughness: 1.0,
    fog: true,
  }), []);
  const hillMat3 = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#04100A',
    roughness: 1.0,
    fog: true,
  }), []);

  return (
    <group position={[0, -3, -8]}>
      {/* Far background ridge — wide */}
      <mesh position={[-3, 0, -10]} rotation={[0, 0, 0]} material={hillMat3}>
        <sphereGeometry args={[14, 16, 8]} />
      </mesh>
      <mesh position={[6, -1, -12]} material={hillMat3}>
        <sphereGeometry args={[12, 16, 8]} />
      </mesh>

      {/* Mid hills */}
      <mesh position={[-8, 0, -5]} material={hillMat2}>
        <sphereGeometry args={[8, 12, 8]} />
      </mesh>
      <mesh position={[8, 0.5, -6]} material={hillMat2}>
        <sphereGeometry args={[9, 12, 8]} />
      </mesh>
      <mesh position={[0, -0.5, -4]} material={hillMat2}>
        <sphereGeometry args={[7, 12, 8]} />
      </mesh>

      {/* Near ground plane */}
      <mesh position={[0, -4, 2]} rotation={[-Math.PI / 2, 0, 0]} material={hillMat1}>
        <planeGeometry args={[60, 30]} />
      </mesh>
    </group>
  );
};

// ── Atmospheric Mist & Fireflies ──────────────────────────────────
const CinematicMistParticles = () => {
  const particlesCount = 1800;

  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 50; // X — wide spread
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30; // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 2; // Z — mostly behind camera
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const cols = new Float32Array(particlesCount * 3);
    const colorPalette = [
      new THREE.Color('#2A6B57'),
      new THREE.Color('#1B4D3E'),
      new THREE.Color('#F59E0B'), // firefly gold
      new THREE.Color('#8aab9a'), // mist cool
    ];
    for (let i = 0; i < particlesCount; i++) {
      const isFirefly = Math.random() > 0.85;
      const mistIndices = [0, 1, 3];
      const c = isFirefly ? colorPalette[2] : colorPalette[mistIndices[Math.floor(Math.random() * mistIndices.length)]];
      cols[i * 3]     = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    return cols;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      const t = state.clock.elapsedTime;
      // Very gentle drifting
      pointsRef.current.position.x = Math.sin(t * 0.07) * 2;
      pointsRef.current.position.y = Math.cos(t * 0.06) * 0.8;
      pointsRef.current.rotation.y = t * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particlesCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={particlesCount} array={colors}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.35}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// ── Light Rays (atmospheric volumetric look) ──────────────────────
const LightRays = () => {
  const rayRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (rayRef.current) {
      const t = state.clock.elapsedTime;
      (rayRef.current.material as THREE.MeshBasicMaterial).opacity = 0.03 + Math.sin(t * 0.3) * 0.01;
    }
  });

  return (
    <mesh ref={rayRef} position={[4, 6, -5]} rotation={[0, 0, -0.4]}>
      <cylinderGeometry args={[0.2, 8, 30, 8, 1, true]} />
      <meshBasicMaterial
        color="#F59E0B"
        transparent
        opacity={0.04}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

// ── Main Environment ──────────────────────────────────────────────
export const GlobalEnvironment3D: React.FC = () => {
  const location = useLocation();
  const reduced = useReducedMotion();
  const { aiState } = useAppStore();

  const stateLabel: Record<string, string> = {
    idle:      'Ready',
    listening: 'Listening…',
    thinking:  'Thinking…',
    searching: 'Searching the web…',
    speaking:  'Speaking…',
    success:   'Great job!',
    concern:   "I'm here",
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0.5, 9], fov: 85 }}
        gl={{ alpha: false, antialias: true }}
        dpr={[1, 1.5]}
        style={{ background: '#05070a' }}
        eventSource={document.getElementById('root') as HTMLElement}
        eventPrefix="client"
      >
        <color attach="background" args={['#05070a']} />

        {/* Graduated depth fog — starts farther for more visible scene */}
        <fog attach="fog" args={['#05070a', 14, 40]} />

        {!reduced && <CameraRig path={location.pathname} />}

        {/* Cinematic warm lighting */}
        <ambientLight intensity={0.8} color="#0d2018" />
        <directionalLight position={[10, 18, 10]} intensity={2.5} color="#F59E0B" />
        <directionalLight position={[-12, -4, 6]} intensity={0.9} color="#2A6B57" />
        <pointLight position={[0, 3, 6]} intensity={2.0} color="#D97706" distance={20} />
        {/* Rim light from behind */}
        <pointLight position={[-5, 5, -8]} intensity={1.2} color="#1B4D3E" distance={25} />

        {/* BACKGROUND: Northeast hills */}
        <BackgroundHills />

        {/* MIDGROUND: Atmospheric particles & rays */}
        <CinematicMistParticles />
        {!reduced && <LightRays />}

        {/* MIDGROUND: AI Companion — placed prominently */}
        <group position={[0, -0.2, 2.5]} scale={[3.2, 3.2, 3.2]}>
          <AICompanion3D state={aiState} />
        </group>

        {/* FOREGROUND: Flora entering from viewport edges */}
        {!reduced && <ForegroundFlora />}

        {/* Ambient sparkles for depth */}
        <Sparkles count={120} scale={25} size={2.5} speed={0.2} opacity={0.4} color="#2A6B57" />
      </Canvas>

      {/* Companion state label */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(var(--nav-h) + 56px)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        pointerEvents: 'none',
        zIndex: 5,
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 500,
          letterSpacing: '.3em',
          textTransform: 'uppercase',
          color: 'rgba(223,231,224,0.35)',
          fontFamily: 'var(--font-family)',
        }}>
          SYNAPSA
        </div>
        <div style={{
          fontSize: '16px',
          fontWeight: 400,
          letterSpacing: '.1em',
          color: 'rgba(223,231,224,0.2)',
          fontFamily: 'var(--font-family)',
          textTransform: 'uppercase',
        }}>
          {stateLabel[aiState] ?? 'AI Memory Companion'}
        </div>
      </div>
    </div>
  );
};
