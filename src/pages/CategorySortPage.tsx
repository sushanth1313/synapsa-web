import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
import { fadeUp, staggerContainer } from '../tokens/variants';
import './ObjectRecallPage.css';
import './CategorySortPage.css';

type GameState = 'idle' | 'playing' | 'success';

const CATEGORIES = {
  Nature: ['🌲', '🌻', '🍄', '🍁', '☁️', '☀️', '🐚'],
  Home: ['🛏️', '🛋️', '🪑', '🚪', '🚽', '🛁', '🧹'],
  Food: ['🍔', '🍕', '🍣', '🥗', '🍎', '🍩', '🥖'],
  Clothes: ['👕', '👖', '👗', '👟', '🧥', '🧦', '🧣']
};

export const CategorySortPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { incrementScore, completeGameActivity, locale } = useAppStore();
  const strings = getStrings(locale);

  const [gameState, setGameState] = useState<GameState>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  
  const [catA, setCatA] = useState<string>('');
  const [catB, setCatB] = useState<string>('');
  
  // The queue of items to sort
  const [queue, setQueue] = useState<{item: string, cat: string}[]>([]);
  // The current item to sort
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [feedbackBucket, setFeedbackBucket] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<'correct'|'wrong'|null>(null);

  const startRound = () => {
    const queueLength = level === 1 ? 6 : level === 2 ? 8 : 10;
    
    // Pick 2 random categories
    const allKeys = Object.keys(CATEGORIES);
    const shuffledKeys = [...allKeys].sort(() => 0.5 - Math.random());
    const cA = shuffledKeys[0];
    const cB = shuffledKeys[1];
    
    setCatA(cA);
    setCatB(cB);
    
    // Build queue
    const itemsA = CATEGORIES[cA as keyof typeof CATEGORIES].map(i => ({ item: i, cat: cA }));
    const itemsB = CATEGORIES[cB as keyof typeof CATEGORIES].map(i => ({ item: i, cat: cB }));
    
    const combined = [...itemsA, ...itemsB].sort(() => 0.5 - Math.random()).slice(0, queueLength);
    
    setQueue(combined);
    setCurrentIndex(0);
    setFeedbackBucket(null);
    setFeedbackStatus(null);
    setGameState('playing');
  };

  const handleBucketClick = (bucketName: string) => {
    if (gameState !== 'playing' || feedbackStatus) return; // Prevent double click while showing feedback
    
    const currentItem = queue[currentIndex];
    
    setFeedbackBucket(bucketName);
    
    if (currentItem.cat === bucketName) {
      setFeedbackStatus('correct');
      const points = 20 * level;
      setScore(s => s + points);
      
      setTimeout(() => {
        setFeedbackBucket(null);
        setFeedbackStatus(null);
        if (currentIndex + 1 < queue.length) {
          setCurrentIndex(i => i + 1);
        } else {
          // Round complete
          incrementScore(score + points); // Commit score
          setTimeout(() => setGameState('success'), 500);
        }
      }, 500);
      
    } else {
      setFeedbackStatus('wrong');
      setTimeout(() => {
        setFeedbackBucket(null);
        setFeedbackStatus(null);
      }, 800);
    }
  };

  const nextLevel = () => {
    if (level === 3) {
      completeGameActivity('CATEGORY_SORT', score, 100, 180, level);
      navigate('/games');
    } else {
      setLevel(l => l + 1);
      startRound();
    }
  };

  return (
    <div className="category-sort-page object-recall-page">
      
      <div className="game-header">
        <button className="game-back-btn" onClick={() => navigate('/games')}>← Exit</button>
        <div className="game-stats">
          <div>Level <span className="stat-value">{level}/3</span></div>
          <div>Score <span className="stat-value">{score}</span></div>
          {gameState === 'playing' && (
            <div>Item <span className="stat-value">{currentIndex + 1}/{queue.length}</span></div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'idle' && (
          <motion.div 
            key="idle" className="game-screen"
            variants={reduced ? {} : staggerContainer} initial="hidden" animate="show" exit="hidden"
          >
            <motion.h1 className="game-title" variants={fadeUp}>Category Sort</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>
              Sort the items into the correct categories. Take your time.
            </motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={startRound}>{strings.start_game || 'Start Game'}</motion.button>
          </motion.div>
        )}

        {gameState === 'playing' && queue.length > 0 && (
          <motion.div key="playing" className="game-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="game-instruction">Where does this belong?</h2>
            
            <div className="cs-active-item-container">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentIndex}
                  className="cs-active-item"
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {queue[currentIndex].item}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="cs-buckets">
              <div 
                className={`cs-bucket ${feedbackBucket === catA ? feedbackStatus : ''}`}
                onClick={() => handleBucketClick(catA)}
              >
                <div className="cs-bucket-title">{catA}</div>
                <div className="cs-bucket-desc">Tap here if it belongs to {catA}</div>
              </div>
              <div 
                className={`cs-bucket ${feedbackBucket === catB ? feedbackStatus : ''}`}
                onClick={() => handleBucketClick(catB)}
              >
                <div className="cs-bucket-title">{catB}</div>
                <div className="cs-bucket-desc">Tap here if it belongs to {catB}</div>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'success' && (
          <motion.div key="success" className="game-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <motion.h1 className="game-title" style={{ color: '#10B981' }} variants={fadeUp}>Excellent Sorting!</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>You categorized everything correctly.</motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={nextLevel}>
              {level === 3 ? 'Complete Game' : 'Next Level'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
