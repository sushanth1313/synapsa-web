import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from '../../hooks';
import { AICompanion3D } from '../avatar/AICompanion3D';
import { useAppStore } from '../../store';

// ── Cinematic Camera Rig with smooth parallax ─────────────────────
const CameraRig = ({ path }: { path: string }) => {
  const { camera, pointer } = useThree();
  const targetRef = useRef(new THREE.Vector3(0, 0, 9));
  const lookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    let targetZ = 9;
    let targetY = 0.5;
    let targetX = 0;

    if (path.includes('memory')) {
      targetZ = 6.5; targetY = 1.2; targetX = 0;
    } else if (path.includes('pattern')) {
      targetZ = 7; targetY = 0.8; targetX = 0;
    } else if (path.includes('calm')) {
      targetZ = 12; targetY = -0.5; targetX = 0;
    } else if (path.includes('routine')) {
      targetZ = 8.5; targetY = 0.5; targetX = -1.0;
    } else if (path.includes('companion')) {
      targetZ = 5.5; targetY = 0.6; targetX = 0;
    } else if (path.includes('progress')) {
      targetZ = 8; targetY = -0.2; targetX = 1.0;
    }

    const t = state.clock.elapsedTime;
    // Ultra-smooth, slow cinematic drift
    const driftX = Math.sin(t * 0.08) * 0.5;
    const driftY = Math.cos(t * 0.05) * 0.3;

    // Smooth mouse parallax (damped for elderly users)
    const parallaxX = THREE.MathUtils.lerp(0, pointer.x * 1.5, 0.1);
    const parallaxY = THREE.MathUtils.lerp(0, pointer.y * 1.2, 0.1);

    targetRef.current.set(
      targetX + driftX + parallaxX,
      targetY + driftY + parallaxY,
      targetZ
    );

    // Damped camera movement for zero motion sickness
    camera.position.lerp(targetRef.current, delta * 1.5);
    
    // Smooth lookAt target
    const targetLookAt = new THREE.Vector3(driftX * 0.2, targetY * 0.2 + driftY * 0.1, 0);
    lookAtRef.current.lerp(targetLookAt, delta * 1.5);
    camera.lookAt(lookAtRef.current);
  });

  return null;
};

// ── Cinematic Flora (Foreground Depth) ──────────────────────────
const ForegroundFlora = () => {
  const groupRef = useRef<THREE.Group>(null);
  const leafMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#0d2b1f', // Deep dark green
    roughness: 0.8,
    transmission: 0.1,
    thickness: 0.5,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95
  }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.rotation.z = Math.sin(t * 0.2 + i) * 0.03;
        child.rotation.x = Math.cos(t * 0.15 + i) * 0.02;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Massive blurred foreground leaves to create immediate depth */}
      <mesh position={[-12, 4, 7]} rotation={[0.4, 0.2, -0.6]} material={leafMat}>
        <sphereGeometry args={[6, 16, 12]} />
      </mesh>
      <mesh position={[14, -2, 6]} rotation={[0.2, -0.4, 0.8]} material={leafMat}>
        <sphereGeometry args={[5, 16, 12]} />
      </mesh>
      <mesh position={[10, -7, 6.5]} rotation={[0.6, -0.1, 0.4]} material={leafMat}>
        <sphereGeometry args={[4.5, 16, 12]} />
      </mesh>
    </group>
  );
};

// ── Atmospheric Background Hills ────────────────────────────────
const BackgroundHills = () => {
  const hillMatFar = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#020805', roughness: 1.0, fog: true
  }), []);
  const hillMatMid = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#041209', roughness: 0.9, fog: true
  }), []);
  const hillMatNear = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0a2114', roughness: 0.8, fog: true
  }), []);

  return (
    <group position={[0, -4, -12]}>
      {/* Far Silhouettes */}
      <mesh position={[-15, 2, -18]} material={hillMatFar}>
        <sphereGeometry args={[25, 32, 16]} />
      </mesh>
      <mesh position={[18, 0, -20]} material={hillMatFar}>
        <sphereGeometry args={[28, 32, 16]} />
      </mesh>
      
      {/* Mid Hills */}
      <mesh position={[-8, 1, -8]} material={hillMatMid}>
        <sphereGeometry args={[14, 24, 12]} />
      </mesh>
      <mesh position={[12, 1.5, -10]} material={hillMatMid}>
        <sphereGeometry args={[16, 24, 12]} />
      </mesh>

      {/* Near Ground */}
      <mesh position={[0, -2, 4]} rotation={[-Math.PI / 2, 0, 0]} material={hillMatNear}>
        <planeGeometry args={[100, 40]} />
      </mesh>
    </group>
  );
};

// ── Organic Ambient Particles ───────────────────────────────────
const CinematicMistParticles = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 3000;
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const c1 = new THREE.Color('#2A6B57');
    const c2 = new THREE.Color('#F59E0B'); // firefly
    const c3 = new THREE.Color('#1B4D3E');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50 - 5;

      const rand = Math.random();
      const color = rand > 0.9 ? c2 : (rand > 0.4 ? c1 : c3);
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    }
    return [pos, cols];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const t = state.clock.elapsedTime;
      pointsRef.current.position.x = Math.sin(t * 0.05) * 1.5;
      pointsRef.current.position.y = Math.cos(t * 0.04) * 0.5;
      pointsRef.current.rotation.y = t * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.25}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// ── Volumetric Light Rays Approximation ─────────────────────────
const LightRays = () => {
  const rayRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (rayRef.current) {
      const t = state.clock.elapsedTime;
      rayRef.current.children.forEach((child, i) => {
        (child as THREE.Mesh).material.opacity = 0.02 + Math.sin(t * 0.2 + i) * 0.015;
      });
    }
  });

  return (
    <group ref={rayRef} position={[6, 8, -8]} rotation={[0, 0, -0.5]}>
      <mesh>
        <cylinderGeometry args={[0.5, 12, 40, 16, 1, true]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.03} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.2, 8, 40, 16, 1, true]} />
        <meshBasicMaterial color="#fef08a" transparent opacity={0.02} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

// ── Main Environment Component ──────────────────────────────────
export const GlobalEnvironment3D: React.FC = () => {
  const location = useLocation();
  const reduced = useReducedMotion();
  const { aiState } = useAppStore();

  const stateLabel: Record<string, string> = {
    idle:      'Ready',
    listening: 'Listening…',
    thinking:  'Thinking…',
    searching: 'Searching…',
    speaking:  'Speaking…',
    success:   'Excellent!',
    concern:   "I'm here",
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        camera={{ position: [0, 0.5, 9], fov: 75 }}
        gl={{ alpha: false, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        dpr={[1, 2]} // High quality rendering
        style={{ background: '#020406' }}
      >
        <color attach="background" args={['#020406']} />
        
        {/* Cinematic Fog for atmospheric depth */}
        <fog attach="fog" args={['#020406', 8, 35]} />
        <fogExp2 attach="fog" args={['#020406', 0.03]} />

        {!reduced && <CameraRig path={location.pathname} />}

        {/* Premium Lighting Setup */}
        <ambientLight intensity={0.4} color="#0a1a12" />
        <directionalLight position={[15, 20, 10]} intensity={2.0} color="#F59E0B" castShadow />
        <directionalLight position={[-15, -5, 5]} intensity={1.5} color="#2A6B57" />
        <pointLight position={[0, 4, 8]} intensity={1.5} color="#D97706" distance={25} />
        
        {/* Environment map for realistic reflections on the companion */}
        <Environment preset="night" />
        
        <Stars radius={50} depth={20} count={1000} factor={2} saturation={0} fade speed={1} />

        {/* Layers of the World */}
        <BackgroundHills />
        <CinematicMistParticles />
        {!reduced && <LightRays />}

        {/* The Heart of SYNAPSA */}
        <group position={[0, -0.2, 2.5]} scale={[4.5, 4.5, 4.5]}>
          <AICompanion3D state={aiState} />
        </group>

        {/* Framing the shot */}
        {!reduced && <ForegroundFlora />}

        <Sparkles count={150} scale={30} size={3} speed={0.1} opacity={0.3} color="#2A6B57" />
      </Canvas>

      {/* Integrated Companion Label (Moved out of React Three Fiber tree to HTML) */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(84px, 12vh, 140px)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
        zIndex: 5,
        opacity: location.pathname === '/companion' || location.pathname === '/' ? 1 : 0,
        transition: 'opacity 0.5s ease'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          fontFamily: 'var(--font-family)',
          textShadow: '0 2px 10px rgba(0,0,0,0.8)'
        }}>
          SYNAPSA
        </div>
        <div style={{
          fontSize: '18px',
          fontWeight: 300,
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.8)',
          fontFamily: 'var(--font-family)',
          textTransform: 'uppercase',
          textShadow: '0 2px 16px rgba(0,0,0,0.8)'
        }}>
          {stateLabel[aiState] ?? 'Companion'}
        </div>
      </div>
    </div>
  );
};
