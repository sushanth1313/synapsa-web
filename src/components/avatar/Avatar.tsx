// ============================================================
// SYNAPSA — SYNAPSA Avatar Component
// AI companion with expressive states and animations
// ============================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AIState } from '../../services';
import { useReducedMotion } from '../../hooks';
import './Avatar.css';

interface Props {
  state: AIState;
  size?: 'sm' | 'md' | 'lg';
  speech?: string;
  amplitude?: number;
}

const stateConfig: Record<AIState, {
  ringColor: string;
  ringOpacity: number;
  glowColor: string;
  label: string;
}> = {
  idle:      { ringColor: '#1B4D3E', ringOpacity: 0.15, glowColor: 'rgba(27,77,62,0.2)',  label: '' },
  listening: { ringColor: '#D97706', ringOpacity: 0.6,  glowColor: 'rgba(217,119,6,0.4)', label: 'Listening…' },
  thinking:  { ringColor: '#1A365D', ringOpacity: 0.4,  glowColor: 'rgba(26,54,93,0.3)',  label: 'Thinking…' },
  searching: { ringColor: '#2563EB', ringOpacity: 0.45, glowColor: 'rgba(37,99,235,0.3)', label: 'Searching…' },
  speaking:  { ringColor: '#2A6B57', ringOpacity: 0.5,  glowColor: 'rgba(42,107,87,0.4)', label: 'Speaking…' },
  success:   { ringColor: '#15803D', ringOpacity: 0.6,  glowColor: 'rgba(21,128,61,0.5)', label: '✓' },
  concern:   { ringColor: '#D97706', ringOpacity: 0.4,  glowColor: 'rgba(217,119,6,0.3)', label: '' },
};

const sizeMap = { sm: 80, md: 120, lg: 180 };

export const Avatar: React.FC<Props> = ({
  state,
  size = 'md',
  speech,
  amplitude = 0,
}) => {
  const reduced = useReducedMotion();
  const config = stateConfig[state];
  const px = sizeMap[size];

  // Breathing animation varies by state
  const breathScale = state === 'idle' ? [1, 1.025, 1] : [1, 1.04, 1];
  const breathDuration = state === 'idle' ? 4 : 2.5;

  // Ring animation scales with amplitude during listening/speaking
  const ringScale = 1 + (state === 'listening' || state === 'speaking' ? amplitude * 0.4 : 0);

  return (
    <div
      className={`avatar avatar--${size} avatar--${state}`}
      style={{ width: px, height: px }}
      role="img"
      aria-label={`NOVA companion: ${state}`}
    >
      {/* Outer ambient rings */}
      {!reduced && (
        <>
          <motion.div
            className="avatar-ring avatar-ring--outer"
            style={{ borderColor: config.ringColor }}
            animate={{
              scale: [1, 1.12 + amplitude * 0.3, 1],
              opacity: [config.ringOpacity * 0.5, config.ringOpacity * 0.2, config.ringOpacity * 0.5],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="avatar-ring avatar-ring--mid"
            style={{ borderColor: config.ringColor }}
            animate={{
              scale: [ringScale, ringScale * 1.08, ringScale],
              opacity: [config.ringOpacity * 0.7, config.ringOpacity * 0.4, config.ringOpacity * 0.7],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
        </>
      )}

      {/* Main avatar body (DOM fallback only, 3D handled globally) */}
      {!reduced ? (
        <div className="avatar-body avatar-body--3d" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 2 }}>
          {/* State indicator glow */}
          <div
            className="avatar-glow"
            style={{
              background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
              opacity: config.ringOpacity,
              position: 'absolute',
              inset: -20,
              zIndex: -1
            }}
          />
        </div>
      ) : (
        <motion.div
          className="avatar-body"
          style={{ boxShadow: `0 0 ${32 + amplitude * 20}px ${config.glowColor}` }}
          animate={{ scale: breathScale }}
          transition={{
            duration: breathDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Face container */}
          <div className="avatar-face">
            <div className="avatar-eyes">
              <AvatarEye state={state} side="left" reduced={reduced} />
              <AvatarEye state={state} side="right" reduced={reduced} />
            </div>
            <div className="avatar-nose" />
            <AvatarMouth state={state} amplitude={amplitude} />
          </div>
          <div
            className="avatar-glow"
            style={{
              background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
              opacity: config.ringOpacity,
            }}
          />
        </motion.div>
      )}

      {/* Thinking dots */}
      <AnimatePresence>
        {state === 'thinking' && !reduced && (
          <motion.div
            className="avatar-thinking"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="thinking-dot"
                animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listening ring */}
      <AnimatePresence>
        {state === 'listening' && !reduced && (
          <motion.div
            className="avatar-listen-ring"
            style={{ borderColor: config.ringColor }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            exit={{ scale: 0.8, opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Speech bubble */}
      <AnimatePresence>
        {speech && (
          <motion.div
            className="avatar-speech"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {speech}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Eye Component ────────────────────────────────────────────

const AvatarEye: React.FC<{
  state: AIState;
  side: 'left' | 'right';
  reduced: boolean;
}> = ({ state, reduced }) => {
  const isSuccess = state === 'success';
  const isConcern = state === 'concern';

  return (
    <motion.div
      className={`avatar-eye ${isSuccess ? 'avatar-eye--happy' : ''} ${isConcern ? 'avatar-eye--concern' : ''}`}
      animate={reduced ? {} : {
        scaleY: [1, 1, 0.1, 1, 1],
      }}
      transition={{
        duration: 4.5,
        repeat: Infinity,
        times: [0, 0.45, 0.5, 0.55, 1],
        ease: 'easeInOut',
        delay: Math.random() * 2,
      }}
    >
      <div className="avatar-pupil" />
      {isSuccess && <div className="avatar-eye-shine" />}
    </motion.div>
  );
};

// ── Mouth Component ──────────────────────────────────────────

const AvatarMouth: React.FC<{ state: AIState; amplitude: number }> = ({ state, amplitude }) => {
  const isSpeaking = state === 'speaking';
  const isSuccess = state === 'success';
  const isConcern = state === 'concern';

  if (isSpeaking) {
    return (
      <motion.div
        className="avatar-mouth avatar-mouth--speaking"
        animate={{
          scaleY: [1, 1 + amplitude * 1.5, 1],
        }}
        transition={{ duration: 0.12, repeat: Infinity }}
      />
    );
  }

  if (isSuccess) return <div className="avatar-mouth avatar-mouth--smile" />;
  if (isConcern) return <div className="avatar-mouth avatar-mouth--concern" />;
  return <div className="avatar-mouth avatar-mouth--neutral" />;
};
