import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
import { fadeUp, staggerContainer } from '../tokens/variants';
import { DatabaseService } from '../services/DatabaseService';
import './ObjectRecallPage.css'; // Reuse general layout and tile styles

type GameState = 'intro' | 'playing' | 'success' | 'complete';

const CATEGORIES = {
  fruits: ['🍎', '🍊', '🍌', '🍇', '🍓', '🍉', '🍍', '🍒'],
  animals: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨'],
  vehicles: ['🚗', '🚕', '🚙', '🚌', '🏎️', '🚓', '🚑', '🚒'],
  cultural: ['🎋', '🫙', '🍵', '🧺', '🥁', '🧣', '🥻', '🦏'] // Jaapi, Pitcher, Assam Tea, Basket, Dhol, Gamosa, Muga Silk, Rhino
};

export const OddOneOutPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { currentUser, incrementScore, completeGameActivity, locale } = useAppStore();
  const strings = getStrings(locale);

  const [gameState, setGameState] = useState<GameState>('intro');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  const [difficulty, setDifficulty] = useState(1);
  const [startTime, setStartTime] = useState(0);
  
  const [items, setItems] = useState<string[]>([]);
  const [oddItem, setOddItem] = useState<string>('');
  const [feedback, setFeedback] = useState<Record<string, 'correct'|'wrong'>>({});

  useEffect(() => {
    const diff = DatabaseService.getDifficulty(currentUser?.id || 'demo', 'RECOGNITION');
    setDifficulty(diff);
  }, [currentUser]);

  const startGame = () => {
    setRound(1);
    setScore(0);
    setAttempts(0);
    setStartTime(Date.now());
    startRound(1);
  };

  const startRound = (currentRound: number) => {
    // Adaptive: Higher difficulty = more items
    let baseItemCount = 4;
    if (difficulty >= 2) baseItemCount = 6;
    if (difficulty >= 4) baseItemCount = 8;
    
    // As rounds progress, we can also increase items slightly if possible
    const itemCount = Math.min(8, baseItemCount + (currentRound - 1));
    
    // Pick a base category
    const categoryKeys = Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[];
    const baseCatKey = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    
    // Pick an odd category
    let oddCatKey = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    while (oddCatKey === baseCatKey) {
      oddCatKey = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    }

    const baseCat = CATEGORIES[baseCatKey];
    const oddCat = CATEGORIES[oddCatKey];

    // Pick (itemCount - 1) random items from base
    const shuffledBase = [...baseCat].sort(() => 0.5 - Math.random());
    const baseItems = shuffledBase.slice(0, itemCount - 1);
    
    // Pick 1 random item from odd
    const odd = oddCat[Math.floor(Math.random() * oddCat.length)];
    setOddItem(odd);

    const newItems = [...baseItems, odd].sort(() => 0.5 - Math.random());
    setItems(newItems);
    setFeedback({});
    setGameState('playing');
  };

  const handleItemClick = (item: string) => {
    if (gameState !== 'playing') return;

    setAttempts(a => a + 1);

    if (item === oddItem) {
      setFeedback({ [item]: 'correct' });
      const points = 100 * level;
      setScore(s => s + points);
      incrementScore(points);
      
      setTimeout(() => setGameState('success'), 1500);
    } else {
      setFeedback({ [item]: 'wrong' });
      setTimeout(() => {
        setFeedback({});
      }, 800);
    }
  };

  const hasCompleted = useRef(false);

  const nextLevel = () => {
    const maxRounds = difficulty <= 2 ? 3 : 5; // More rounds on higher diff
    if (round === maxRounds) {
      if (hasCompleted.current) return;
      hasCompleted.current = true;
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      const accuracy = Math.round((maxRounds / Math.max(attempts, maxRounds)) * 100);
      
      DatabaseService.updateDifficulty(currentUser?.id || 'demo', 'RECOGNITION', accuracy, durationMs);
      completeGameActivity('RECOGNITION', score, accuracy, Math.round(durationMs / 1000), difficulty);
      
      setGameState('complete');
    } else {
      const nextR = round + 1;
      setRound(nextR);
      startRound(nextR);
    }
  };

  return (
    <div className="odd-one-out-page object-recall-page">
      
      <div className="game-header">
        <button className="game-back-btn" onClick={() => navigate('/games')}>← Exit</button>
        <div className="game-stats">
          <div>Round <span className="stat-value">{round}</span></div>
          <div>Lvl <span className="stat-value">{difficulty}</span></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'intro' && (
          <motion.div 
            key="intro" className="game-screen"
            variants={reduced ? {} : staggerContainer} initial="hidden" animate="show" exit="hidden"
          >
            <motion.h1 className="game-title" variants={fadeUp}>Odd One Out</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>
              Find the object that doesn't belong in the group. 
              <br/>Includes familiar cultural items!
            </motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={startGame}>{strings.start_game || 'Start Game'}</motion.button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div key="playing" className="game-screen" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h2 className="game-instruction">Which one is the Odd One Out?</h2>
            
            <div className={`object-grid ${items.length > 4 ? 'large' : ''}`}>
              {items.map((item, i) => {
                const stat = feedback[item];
                return (
                  <motion.div 
                    key={`item-${i}`} 
                    className={`object-tile ${stat || ''}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                  >
                    {item}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {gameState === 'success' && (
          <motion.div key="success" className="game-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <motion.h1 className="game-title" style={{ color: '#10B981' }} variants={fadeUp}>Great Eye!</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>You spotted the outlier perfectly.</motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={nextLevel}>
              Next Level
            </motion.button>
          </motion.div>
        )}

        {gameState === 'complete' && (
          <motion.div key="complete" className="game-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <motion.h1 className="game-title" style={{ color: 'var(--color-tea-green)' }} variants={fadeUp}>Session Complete</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>Excellent cognitive work! Difficulty is being adapted for next time.</motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={() => navigate('/games')}>
              Return to Games
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
