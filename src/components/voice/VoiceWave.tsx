// ============================================================
// Smarani NER — Voice Visualization
// Organic waveform ribbon around the avatar
// ============================================================

import React from 'react';
import type { AIState } from '../../services';
import { useReducedMotion } from '../../hooks';
import { Canvas } from '@react-three/fiber';
import { VoiceOrb3D } from './VoiceOrb3D';
import './VoiceWave.css';

interface Props {
  state: AIState;
  amplitude?: number;
  size?: number;
}

export const VoiceWave: React.FC<Props> = ({ state, amplitude = 0, size = 200 }) => {
  const reduced = useReducedMotion();
  const isActive = state === 'listening' || state === 'speaking';

  if (!isActive) return null;

  if (reduced) {
    return <VoiceBars state={state} amplitude={amplitude} />;
  }

  return (
    <div className="voice-wave" style={{ width: size, height: size }} aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 5, 2]} intensity={1} color="#ffffff" />
        <VoiceOrb3D state={state} amplitude={amplitude} />
      </Canvas>
    </div>
  );
};

// ── Simple bar visualizer for non-canvas fallback ─────────────

export const VoiceBars: React.FC<{ state: AIState; amplitude?: number }> = ({
  state,
  amplitude = 0,
}) => {
  const isActive = state === 'listening' || state === 'speaking';
  const BAR_COUNT = 9;

  if (!isActive) return null;

  return (
    <div className="voice-bars" role="presentation" aria-hidden="true">
      {Array.from({ length: BAR_COUNT }, (_, i) => {
        const center = Math.floor(BAR_COUNT / 2);
        const distFromCenter = Math.abs(i - center);
        const baseHeight = 12 - distFromCenter * 2;
        const animDelay = `${i * 80}ms`;
        return (
          <span
            key={i}
            className={`voice-bar voice-bar--${state}`}
            style={{
              height: `${baseHeight + amplitude * 20}px`,
              animationDelay: animDelay,
            }}
          />
        );
      })}
    </div>
  );
};
