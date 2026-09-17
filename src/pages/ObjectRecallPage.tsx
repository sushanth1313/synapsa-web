import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
import { fadeUp, staggerContainer } from '../tokens/variants';
import './ObjectRecallPage.css';

const ALL_OBJECTS = ['🍎', '☂️', '🚲', '🎸', '🌻', '🧸', '🧩', '🎈', '🎨', '📚', '🕰️', '☕', '🪴', '📷', '🗝️', '🔭', '🧭', '🧲', '🪄', '💎'];

type GameState = 'idle' | 'observing' | 'recalling' | 'success';

export const ObjectRecallPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { incrementScore, completeGameActivity, locale } = useAppStore();
  const strings = getStrings(locale);

  const [gameState, setGameState] = useState<GameState>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  
  // Game data
  const [targetObjects, setTargetObjects] = useState<string[]>([]);
  const [poolObjects, setPoolObjects] = useState<string[]>([]);
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [validationState, setValidationState] = useState<Record<string, 'correct'|'wrong'>>({});
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup a new round based on level
  const startRound = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const targetCount = Math.min(3 + level, 8); // Start with 4, max 8
    const poolCount = Math.min(targetCount * 2 + 2, 16); // Total pool to pick from

    // Shuffle and pick targets
    const shuffledAll = [...ALL_OBJECTS].sort(() => 0.5 - Math.random());
    const targets = shuffledAll.slice(0, targetCount);
    
    // Pick decoys
    const decoys = shuffledAll.slice(targetCount, poolCount);
    
    // Create final pool and shuffle
    const pool = [...targets, ...decoys].sort(() => 0.5 - Math.random());

    setTargetObjects(targets);
    setPoolObjects(pool);
    setSelectedObjects(new Set());
    setValidationState({});
    setGameState('observing');

    // Observation time: 1.5s per object
    const obsTime = targetCount * 1500;
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setGameState('recalling');
    }, obsTime);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const toggleSelection = (obj: string) => {
    if (gameState !== 'recalling') return;
    
    const newSel = new Set(selectedObjects);
    if (newSel.has(obj)) {
      newSel.delete(obj);
    } else {
      // Don't allow selecting more than the target count to prevent spamming
      if (newSel.size < targetObjects.length) {
        newSel.add(obj);
      }
    }
    setSelectedObjects(newSel);
  };

  const checkAnswer = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    let correct = 0;
    let wrong = 0;
    const newValidation: Record<string, 'correct'|'wrong'> = {};

    selectedObjects.forEach(obj => {
      if (targetObjects.includes(obj)) {
        correct++;
        newValidation[obj] = 'correct';
      } else {
        wrong++;
        newValidation[obj] = 'wrong';
      }
    });

    setValidationState(newValidation);

    if (correct === targetObjects.length && wrong === 0) {
      // Perfect match
      const points = 100 * level;
      setScore(s => s + points);
      incrementScore(points);
      
      setTimeout(() => {
        setGameState('success');
      }, 1500);
    } else {
      // Gentle failure, let them try again by unselecting the wrong ones
      setTimeout(() => {
        const nextSel = new Set(selectedObjects);
        Object.entries(newValidation).forEach(([obj, stat]) => {
          if (stat === 'wrong') {
            nextSel.delete(obj);
          }
        });
        setSelectedObjects(nextSel);
        setValidationState(prev => {
          const reset = { ...prev };
          Object.keys(reset).forEach(k => {
            if (reset[k] === 'wrong') delete reset[k];
          });
          return reset;
        });
      }, 1500);
    }
  };

  const hasCompleted = useRef(false);

  const nextLevel = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (level === 3) {
      if (hasCompleted.current) return;
      hasCompleted.current = true;
      // Game complete
      completeGameActivity('OBJECT_RECALL', score, 100, 180, level);
      navigate('/games');
    } else {
      setLevel(l => l + 1);
      startRound();
    }
  };

  const observationTime = targetObjects.length * 1.5;

  return (
    <div className="object-recall-page">
      
      <div className="game-header">
        <button className="game-back-btn" onClick={(e) => { e.stopPropagation(); navigate('/games'); }}>← Exit</button>
        <div className="game-stats">
          <div>Level <span className="stat-value">{level}/3</span></div>
          <div>Score <span className="stat-value">{score}</span></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'idle' && (
          <motion.div 
            key="idle"
            className="game-screen"
            variants={reduced ? {} : staggerContainer}
            initial="hidden" animate="show" exit="hidden"
          >
            <motion.h1 className="game-title" variants={fadeUp}>Object Recall</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>
              Observe the objects carefully. When they disappear, select the ones you remember seeing.
            </motion.p>
            <motion.button 
              className="start-btn" 
              variants={fadeUp}
              onClick={startRound}
            >{strings.start_game || 'Start Game'}</motion.button>
          </motion.div>
        )}

        {gameState === 'observing' && (
          <motion.div 
            key="observing"
            className="game-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="game-instruction">Remember these objects...</h2>
            
            <div className="timer-bar">
              <motion.div 
                className="timer-fill"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: observationTime, ease: 'linear' }}
              />
            </div>

            <div className="object-grid">
              {targetObjects.map((obj, i) => (
                <motion.div 
                  key={`target-${i}`} 
                  className="object-tile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {obj}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {gameState === 'recalling' && (
          <motion.div 
            key="recalling"
            className="game-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="game-instruction">Which ones did you see? ({selectedObjects.size}/{targetObjects.length})</h2>
            
            <div className="object-grid large">
              {poolObjects.map((obj, i) => {
                const isSelected = selectedObjects.has(obj);
                const valState = validationState[obj];
                
                return (
                  <motion.div 
                    key={`pool-${i}`} 
                    className={`object-tile ${isSelected ? 'selected' : ''} ${valState || ''}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={(e) => { e.stopPropagation(); toggleSelection(obj); }}
                  >
                    {obj}
                  </motion.div>
                );
              })}
            </div>

            <button 
              className={`confirm-btn ${selectedObjects.size === targetObjects.length ? 'active' : ''}`}
              onClick={checkAnswer}
              disabled={selectedObjects.size !== targetObjects.length}
            >
              Confirm Selection
            </button>
          </motion.div>
        )}

        {gameState === 'success' && (
          <motion.div 
            key="success"
            className="game-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.h1 className="game-title" style={{ color: '#10B981' }} variants={fadeUp}>
              Brilliant!
            </motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>
              You remembered all {targetObjects.length} objects perfectly.
            </motion.p>
            <motion.button 
              className="start-btn" 
              variants={fadeUp}
              onClick={nextLevel}
            >
              {level === 3 ? 'Complete Game' : 'Next Level'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
