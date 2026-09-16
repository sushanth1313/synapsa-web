import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
import { fadeUp, staggerContainer } from '../tokens/variants';
import './ObjectRecallPage.css'; // Reuse game header and stats CSS

type GameState = 'idle' | 'showing' | 'typing' | 'success' | 'failed';

export const NumberMemoryPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { incrementScore, completeGameActivity, locale } = useAppStore();
  const strings = getStrings(locale);

  const [gameState, setGameState] = useState<GameState>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  
  const [targetNumber, setTargetNumber] = useState('');
  const [userInput, setUserInput] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startRound = () => {
    // Length starts at 3, increases by 1 each level
    const length = 2 + level;
    let numStr = '';
    for (let i = 0; i < length; i++) {
      numStr += Math.floor(Math.random() * 10).toString();
    }
    
    setTargetNumber(numStr);
    setUserInput('');
    setGameState('showing');

    // Show for 3 seconds
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setGameState('typing');
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const val = e.target.value.replace(/[^0-9]/g, '');
    setUserInput(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && userInput.length > 0) {
      checkAnswer();
    }
  };

  const checkAnswer = () => {
    if (userInput === targetNumber) {
      const points = 50 * level;
      setScore(s => s + points);
      setGameState('success');
    } else {
      setGameState('failed');
    }
  };

  const nextLevel = () => {
    if (level === 5) { // 5 levels total
      completeGameActivity('NUMBER_MEMORY', score, 100, 180, level);
      navigate('/games');
    } else {
      setLevel(l => l + 1);
      startRound();
    }
  };

  const handleFailFinish = () => {
    completeGameActivity('NUMBER_MEMORY', score, 100, 180, level);
    incrementScore(score); // Commit score up to this point
    navigate('/games');
  };

  return (
    <div className="number-memory-page object-recall-page">
      
      <div className="game-header">
        <button className="game-back-btn" onClick={() => navigate('/games')}>← Exit</button>
        <div className="game-stats">
          <div>Level <span className="stat-value">{level}/5</span></div>
          <div>Score <span className="stat-value">{score}</span></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'idle' && (
          <motion.div 
            key="idle" className="game-screen"
            variants={reduced ? {} : staggerContainer} initial="hidden" animate="show" exit="hidden"
          >
            <motion.h1 className="game-title" variants={fadeUp}>Number Memory</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>
              Remember the sequence of numbers. The sequence grows longer each round.
            </motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={startRound}>{strings.start_game || 'Start Game'}</motion.button>
          </motion.div>
        )}

        {gameState === 'showing' && (
          <motion.div key="showing" className="game-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="game-instruction">Remember this number...</h2>
            <div className="timer-bar" style={{ maxWidth: '400px' }}><motion.div className="timer-fill" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: 3, ease: 'linear' }} /></div>
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ fontSize: 'clamp(64px, 8vw, 120px)', fontWeight: 'bold', color: 'var(--bone)', letterSpacing: '8px', margin: '48px 0' }}
            >
              {targetNumber}
            </motion.div>
          </motion.div>
        )}

        {gameState === 'typing' && (
          <motion.div key="typing" className="game-screen" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h2 className="game-instruction">What was the number?</h2>
            
            <input 
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '16px',
                padding: '24px',
                fontSize: '48px',
                color: 'var(--bone)',
                textAlign: 'center',
                width: '100%',
                maxWidth: '400px',
                marginBottom: '48px',
                letterSpacing: '8px',
                fontFamily: 'monospace'
              }}
              placeholder="?"
              autoFocus
            />

            <button 
              className={`confirm-btn ${userInput.length > 0 ? 'active' : ''}`}
              onClick={checkAnswer}
              disabled={userInput.length === 0}
            >
              Submit Answer
            </button>
          </motion.div>
        )}

        {gameState === 'success' && (
          <motion.div key="success" className="game-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <motion.h1 className="game-title" style={{ color: '#10B981' }} variants={fadeUp}>Correct!</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>You remembered the number perfectly.</motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={nextLevel}>
              {level === 5 ? 'Complete Game' : 'Next Level'}
            </motion.button>
          </motion.div>
        )}

        {gameState === 'failed' && (
          <motion.div key="failed" className="game-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <motion.h1 className="game-title" style={{ color: '#EF4444' }} variants={fadeUp}>Not quite.</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>
              The number was <strong>{targetNumber}</strong>.<br/>You typed <strong>{userInput}</strong>.
            </motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={handleFailFinish}>
              Finish Game
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
