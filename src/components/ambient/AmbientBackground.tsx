// ============================================================
// Smarani NER — Ambient Background Component
// Multi-layer parallax tea garden environment
// ============================================================

import React from 'react';
import { useReducedMotion } from '../../hooks';
import { Environment3D } from './Environment3D';
import './AmbientBackground.css';

interface Props {
  variant?: 'home' | 'calm' | 'game' | 'routine';
}

export const AmbientBackground: React.FC<Props> = ({ variant = 'home' }) => {
  const reduced = useReducedMotion();

  return (
    <div className={`ambient-bg ambient-bg--${variant}`} aria-hidden="true">
      {/* Sky gradient */}
      <div className="ambient-sky" />

      {/* Sun / light source */}
      <div className="ambient-sun" />

      {/* Hill layers */}
      <div className="ambient-hills ambient-hills--far" />
      <div className="ambient-hills ambient-hills--mid" />
      <div className="ambient-hills ambient-hills--near" />

      {/* Mist layer */}
      <div className="ambient-mist" />

      {/* Foreground silhouette */}
      <div className="ambient-foreground" />

      {/* 3D Cinematic Particles */}
      <Environment3D variant={variant} reducedMotion={reduced} />
    </div>
  );
};

