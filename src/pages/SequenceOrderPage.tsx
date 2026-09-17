import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
import { fadeUp, staggerContainer } from '../tokens/variants';
import './ObjectRecallPage.css'; // Reuse general layout
import './SequenceOrderPage.css';

const ICONS = ['🌸', '🍎', '🚗', '🐱', '⚽', '🎸', '✈️', '🍔', '🎁', '💎', '🔑', '🕰️'];

type GameState = 'idle' | 'observing' | 'arranging' | 'success';

export const SequenceOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { incrementScore, completeGameActivity, locale } = useAppStore();
  const strings = getStrings(locale);

  const [gameState, setGameState] = useState<GameState>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  
  const [sequence, setSequence] = useState<string[]>([]);
  const [pool, setPool] = useState<string[]>([]);
  
  // Array of placed items (null if empty slot)
  const [userSequence, setUserSequence] = useState<(string | null)[]>([]);
  const [validation, setValidation] = useState<boolean[]>([]); // true if correct, false if wrong
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRound = () => {
    const seqLength = level === 1 ? 4 : level === 2 ? 5 : 6;
    
    const shuffled = [...ICONS].sort(() => 0.5 - Math.random());
    const seq = shuffled.slice(0, seqLength);
    
    setSequence(seq);
    setUserSequence(new Array(seqLength).fill(null));
    setPool([...seq].sort(() => 0.5 - Math.random()));
    setValidation([]);
    setGameState('observing');

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setGameState('arranging');
    }, seqLength * 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handlePoolClick = (item: string) => {
    if (gameState !== 'arranging') return;
    
    // Find first empty slot
    const emptyIdx = userSequence.findIndex(s => s === null);
    if (emptyIdx !== -1) {
      const newSeq = [...userSequence];
      newSeq[emptyIdx] = item;
      setUserSequence(newSeq);
    }
  };

  const handleSlotClick = (index: number) => {
    if (gameState !== 'arranging') return;
    if (userSequence[index] !== null) {
      const newSeq = [...userSequence];
      newSeq[index] = null;
      setUserSequence(newSeq);
    }
  };

  const checkAnswer = () => {
    let allCorrect = true;
    const newValidation = userSequence.map((item, idx) => {
      const isCorrect = item === sequence[idx];
      if (!isCorrect) allCorrect = false;
      return isCorrect;
    });

    setValidation(newValidation);

    if (allCorrect) {
      const points = 100 * level;
      setScore(s => s + points);
      incrementScore(points);
      setTimeout(() => setGameState('success'), 1000);
    } else {
      setTimeout(() => {
        // Clear wrong ones
        setUserSequence(prev => prev.map((item, idx) => newValidation[idx] ? item : null));
        setValidation([]);
      }, 1000);
    }
  };

  const hasCompleted = useRef(false);

  const nextLevel = () => {
    if (level === 3) {
      if (hasCompleted.current) return;
      hasCompleted.current = true;
      completeGameActivity('SEQUENCE_ORDER', score, 100, 180, level);
      navigate('/games');
    } else {
      setLevel(l => l + 1);
      startRound();
    }
  };

  const isFull = !userSequence.includes(null);

  return (
    <div className="sequence-order-page object-recall-page">
      
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
            variants={reduced ? {} : staggerContainer} initial="hidden" animate="show" exit="hidden"
          >
            <motion.h1 className="game-title" variants={fadeUp}>Sequence Order</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>
              Observe the chronological order of the objects. When they shuffle, put them back in the exact same order.
            </motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={startRound}>{strings.start_game || 'Start Game'}</motion.button>
          </motion.div>
        )}

        {gameState === 'observing' && (
          <motion.div key="observing" className="game-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="game-instruction">Remember the exact order...</h2>
            <div className="timer-bar"><motion.div className="timer-fill" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: sequence.length, ease: 'linear' }} /></div>
            
            <div className="so-slots-container">
              {sequence.map((item, i) => (
                <React.Fragment key={`seq-${i}`}>
                  <motion.div className="so-slot filled" style={{ borderStyle: 'solid' }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }}>
                    {item}
                  </motion.div>
                  {i < sequence.length - 1 && <div className="so-arrow">→</div>}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        )}

        {gameState === 'arranging' && (
          <motion.div key="arranging" className="game-screen" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h2 className="game-instruction">Reconstruct the sequence (Tap to place or remove)</h2>
            
            <div className={`so-slots-container ${validation.length > 0 ? 'checking' : ''}`}>
              {userSequence.map((item, i) => (
                <React.Fragment key={`uslot-${i}`}>
                  <div 
                    className={`so-slot ${item ? 'filled' : ''} ${validation[i] ? 'correct' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleSlotClick(i); }}
                  >
                    {item}
                  </div>
                  {i < sequence.length - 1 && <div className="so-arrow">→</div>}
                </React.Fragment>
              ))}
            </div>

            <div className="so-pool-container">
              {pool.map((item, i) => {
                const isUsed = userSequence.includes(item);
                return (
                  <div 
                    key={`pool-${i}`} 
                    className={`so-pool-item ${isUsed ? 'used' : ''}`}
                    onClick={(e) => { e.stopPropagation(); if (!isUsed) handlePoolClick(item); }}
                  >
                    {item}
                  </div>
                );
              })}
            </div>

            <button 
              className={`confirm-btn ${isFull ? 'active' : ''}`}
              onClick={checkAnswer}
              disabled={!isFull}
            >
              Check Sequence
            </button>
          </motion.div>
        )}

        {gameState === 'success' && (
          <motion.div key="success" className="game-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <motion.h1 className="game-title" style={{ color: '#10B981' }} variants={fadeUp}>Perfect Order!</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>You restored the timeline flawlessly.</motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={nextLevel}>
              {level === 3 ? 'Complete Game' : 'Next Level'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
