import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
import { fadeUp, staggerContainer } from '../tokens/variants';
import './ObjectRecallPage.css'; // Reuse game header and stats CSS
import './PatternMemoryPage.css';

type GameState = 'idle' | 'observing' | 'recalling' | 'success';

export const PatternMemoryPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { incrementScore, completeGameActivity, locale } = useAppStore();
  const strings = getStrings(locale);

  const [gameState, setGameState] = useState<GameState>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  
  const [gridSize, setGridSize] = useState(3);
  const [pattern, setPattern] = useState<number[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<Record<number, 'correct'|'wrong'>>({});
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRound = () => {
    let size = 3;
    let targetCount = 4;
    
    if (level === 2) { size = 4; targetCount = 6; }
    if (level === 3) { size = 5; targetCount = 8; }
    
    setGridSize(size);
    
    // Generate unique random tiles for the pattern
    const newPattern = new Set<number>();
    const totalTiles = size * size;
    while (newPattern.size < targetCount) {
      newPattern.add(Math.floor(Math.random() * totalTiles));
    }
    
    setPattern(Array.from(newPattern));
    setSelected(new Set());
    setFeedback({});
    setGameState('observing');

    // Show pattern for 3 seconds
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setGameState('recalling');
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleTileClick = (index: number) => {
    if (gameState !== 'recalling') return;
    
    const newSel = new Set(selected);
    if (newSel.has(index)) {
      newSel.delete(index);
    } else {
      if (newSel.size < pattern.length) {
        newSel.add(index);
      }
    }
    setSelected(newSel);
  };

  const checkAnswer = () => {
    let correct = 0;
    let wrong = 0;
    const newFeedback: Record<number, 'correct'|'wrong'> = {};

    selected.forEach(idx => {
      if (pattern.includes(idx)) {
        correct++;
        newFeedback[idx] = 'correct';
      } else {
        wrong++;
        newFeedback[idx] = 'wrong';
      }
    });

    setFeedback(newFeedback);

    if (correct === pattern.length && wrong === 0) {
      const points = 100 * level;
      setScore(s => s + points);
      incrementScore(points);
      setTimeout(() => setGameState('success'), 1000);
    } else {
      // Gentle failure, clear wrongs after 1s
      setTimeout(() => {
        const nextSel = new Set(selected);
        Object.entries(newFeedback).forEach(([idxStr, stat]) => {
          if (stat === 'wrong') nextSel.delete(Number(idxStr));
        });
        setSelected(nextSel);
        setFeedback(prev => {
          const reset = { ...prev };
          Object.keys(reset).forEach(k => {
            if (reset[Number(k)] === 'wrong') delete reset[Number(k)];
          });
          return reset;
        });
      }, 1000);
    }
  };

  const hasCompleted = useRef(false);

  const nextLevel = () => {
    if (level === 3) {
      if (hasCompleted.current) return;
      hasCompleted.current = true;
      completeGameActivity('PATTERN_MEMORY', score, 100, 180, level);
      navigate('/games');
    } else {
      setLevel(l => l + 1);
      startRound();
    }
  };

  return (
    <div className="pattern-memory-page object-recall-page">
      
      <div className="game-header">
        <button className="game-back-btn" onClick={() => navigate('/games')}>← Exit</button>
        <div className="game-stats">
          <div>Level <span className="stat-value">{level}/3</span></div>
          <div>Score <span className="stat-value">{score}</span></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'idle' && (
          <motion.div 
            key="idle" className="game-screen"
            variants={reduced ? {} : staggerContainer}
            initial="hidden" animate="show" exit="hidden"
          >
            <motion.h1 className="game-title" variants={fadeUp}>Pattern Memory</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>
              Memorize the illuminated tiles on the grid. When they disappear, tap the exact same tiles.
            </motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={startRound}>{strings.start_game || 'Start Game'}</motion.button>
          </motion.div>
        )}

        {gameState === 'observing' && (
          <motion.div key="observing" className="game-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="game-instruction">Memorize the pattern...</h2>
            <div className="timer-bar"><motion.div className="timer-fill" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: 3, ease: 'linear' }} /></div>
            
            <div className="pm-grid" data-size={gridSize}>
              {Array.from({ length: gridSize * gridSize }).map((_, i) => (
                <div key={i} className={`pm-tile ${pattern.includes(i) ? 'active-pattern' : ''}`} />
              ))}
            </div>
          </motion.div>
        )}

        {gameState === 'recalling' && (
          <motion.div key="recalling" className="game-screen" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h2 className="game-instruction">Recreate the pattern ({selected.size}/{pattern.length})</h2>
            
            <div className="pm-grid" data-size={gridSize}>
              {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                const isSelected = selected.has(i);
                const fb = feedback[i];
                return (
                  <div 
                    key={i} 
                    className={`pm-tile ${isSelected ? 'selected' : ''} ${fb || ''}`} 
                    onClick={(e) => { e.stopPropagation(); handleTileClick(i); }}
                  />
                );
              })}
            </div>

            <button 
              className={`confirm-btn ${selected.size === pattern.length ? 'active' : ''}`}
              onClick={checkAnswer}
              disabled={selected.size !== pattern.length}
            >
              Verify Pattern
            </button>
          </motion.div>
        )}

        {gameState === 'success' && (
          <motion.div key="success" className="game-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <motion.h1 className="game-title" style={{ color: '#10B981' }} variants={fadeUp}>Perfect Pattern!</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>You successfully remembered the spatial layout.</motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={nextLevel}>
              {level === 3 ? 'Complete Game' : 'Next Level'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
