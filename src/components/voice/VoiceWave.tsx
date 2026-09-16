// ============================================================
// SYNAPSA — Voice Visualization
// Organic waveform ribbon around the avatar
// ============================================================

import React from 'react';
import type { AIState } from '../../services';
import { useReducedMotion } from '../../hooks';
import './VoiceWave.css';

interface Props {
  state: AIState;
  size?: number;
}

export const VoiceWave: React.FC<Props> = ({ state, size = 200 }) => {
  const reduced = useReducedMotion();
  const isActive = state === 'listening' || state === 'speaking';

  if (!isActive) return null;

  if (reduced) {
    return <VoiceBars state={state} />;
  }

  return (
    <div className="voice-wave" style={{ width: size, height: size }} aria-hidden="true">
      {/* 3D VoiceOrb is rendered globally by GlobalEnvironment3D to prevent WebGL context bugs */}
    </div>
  );
};

// ── Simple bar visualizer for non-canvas fallback ─────────────

export const VoiceBars: React.FC<{ state: AIState }> = ({
  state,
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
            className={`voice-bar voice-bar--${state} voice-bar--animated`}
            style={{
              height: `${baseHeight}px`,
              animationDelay: animDelay,
            }}
          />
        );
      })}
    </div>
  );
};
