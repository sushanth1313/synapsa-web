import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp } from '../../tokens/variants';

interface GameIntroProps {
  title: string;
  skill: string;
  description: string;
  duration: string;
  instructions: string[];
  onStart: (difficulty: number) => void;
  onCancel: () => void;
}

export const GameIntro: React.FC<GameIntroProps> = ({ title, skill, description, duration, instructions, onStart, onCancel }) => {
  const [difficulty, setDifficulty] = useState<number>(1);

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}
      >
        <motion.div 
          className="modal-content"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          exit="hidden"
          style={{
            background: 'var(--bg-2)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            position: 'relative'
          }}
        >
          <button 
            onClick={onCancel}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'transparent',
              border: 'none',
              color: 'var(--muted)',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div className="dot" style={{ background: 'var(--color-tea-green)' }}></div>
            <span style={{ fontFamily: 'Space Mono, monospace', color: 'var(--color-tea-green)', letterSpacing: '0.1em' }}>
              HOW TO PLAY
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(24px, 3.2vw, 32px)', color: 'var(--bone)', marginBottom: '4px' }}>{title}</h2>
          <div style={{ fontSize: '18px', color: 'var(--color-tea-green)', marginBottom: '16px' }}>
            {skill}
          </div>
          
          <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: '1.5', marginBottom: '24px' }}>
            {description}
          </p>

          <ul style={{ color: 'var(--bone)', marginBottom: '32px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {instructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ul>

          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '24px' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--bone)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
            ⏱ {duration}
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ color: 'var(--bone)', marginBottom: '12px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Select Difficulty
            </h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { label: 'Easy', level: 1 },
                { label: 'Medium', level: 3 },
                { label: 'Hard', level: 5 }
              ].map(opt => (
                <button
                  key={opt.level}
                  onClick={() => setDifficulty(opt.level)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1px solid ${difficulty === opt.level ? 'var(--color-tea-green)' : 'rgba(255,255,255,0.1)'}`,
                    background: difficulty === opt.level ? 'rgba(42, 107, 87, 0.2)' : 'rgba(255,255,255,0.05)',
                    color: 'var(--bone)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="void-btn void-btn--primary" 
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={(e) => {
              e.stopPropagation();
              onStart(difficulty);
            }}
          >
            <span>START GAME</span><i></i>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
