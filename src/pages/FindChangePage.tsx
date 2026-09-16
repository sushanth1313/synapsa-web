import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
import { fadeUp, staggerContainer } from '../tokens/variants';
import './ObjectRecallPage.css'; // Reuse general layout
import './FindChangePage.css';

type GameState = 'idle' | 'observing' | 'transitioning' | 'guessing' | 'success';

const OBJECT_IDS = ['window', 'painting', 'plant', 'lamp', 'rug'];

export const FindChangePage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { incrementScore, completeGameActivity, locale } = useAppStore();
  const strings = getStrings(locale);

  const [gameState, setGameState] = useState<GameState>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  
  const [changedObjectId, setChangedObjectId] = useState<string>('');
  const [showVariantB, setShowVariantB] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRound = () => {
    // Pick one random object to change
    const target = OBJECT_IDS[Math.floor(Math.random() * OBJECT_IDS.length)];
    setChangedObjectId(target);
    setShowVariantB(false);
    setFeedback(null);
    setGameState('observing');

    // Observe for 4 seconds
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setGameState('transitioning');
      
      // Blank out for 1 second
      timerRef.current = setTimeout(() => {
        setShowVariantB(true);
        setGameState('guessing');
      }, 1000);
      
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleObjectClick = (objId: string) => {
    if (gameState !== 'guessing') return;

    if (objId === changedObjectId) {
      setFeedback('correct');
      const points = 100 * level;
      setScore(s => s + points);
      incrementScore(points);
      
      setTimeout(() => {
        setGameState('success');
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null); // let them try again
      }, 1000);
    }
  };

  const nextLevel = () => {
    if (level === 3) {
      completeGameActivity('FIND_CHANGE', score, 100, 180, level);
      navigate('/games');
    } else {
      setLevel(l => l + 1);
      startRound();
    }
  };

  const renderScene = () => (
    <div className={`fc-scene-container ${gameState === 'guessing' ? 'guessing' : ''}`}>
      <div className="fc-wall" />
      <div className="fc-floor" />
      
      {/* Rug */}
      <div 
        className={`fc-object fc-rug ${(showVariantB && changedObjectId === 'rug') ? 'variant-B' : ''}`}
        onClick={() => handleObjectClick('rug')}
      />

      {/* Window */}
      <div 
        className={`fc-object fc-window ${(showVariantB && changedObjectId === 'window') ? 'variant-B' : ''}`}
        onClick={() => handleObjectClick('window')}
      />

      {/* Painting */}
      <div 
        className={`fc-object fc-painting ${(showVariantB && changedObjectId === 'painting') ? 'variant-B' : ''}`}
        onClick={() => handleObjectClick('painting')}
      >
        <div className="fc-painting-art" />
      </div>

      {/* Plant */}
      <div 
        className={`fc-object fc-plant ${(showVariantB && changedObjectId === 'plant') ? 'variant-B' : ''}`}
        onClick={() => handleObjectClick('plant')}
      >
        <div className="fc-plant-leaves" />
        <div className="fc-plant-pot" />
      </div>

      {/* Lamp */}
      <div 
        className={`fc-object fc-lamp ${(showVariantB && changedObjectId === 'lamp') ? 'variant-B' : ''}`}
        onClick={() => handleObjectClick('lamp')}
      >
        <div className="fc-lamp-shade" />
        <div className="fc-lamp-stand" />
        <div className="fc-lamp-base" />
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div 
            className="fc-feedback-overlay"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={`fc-feedback-icon ${feedback}`}>
              {feedback === 'correct' ? '✓' : '✕'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="find-change-page object-recall-page">
      
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
            key="idle"
            className="game-screen"
            variants={reduced ? {} : staggerContainer}
            initial="hidden" animate="show" exit="hidden"
          >
            <motion.h1 className="game-title" variants={fadeUp}>Find the Change</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>
              Observe the scene. It will disappear briefly, and when it returns, ONE thing will be different. Tap the object that changed.
            </motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={startRound}>{strings.start_game || 'Start Game'}</motion.button>
          </motion.div>
        )}

        {gameState === 'observing' && (
          <motion.div 
            key="observing"
            className="game-screen"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <h2 className="game-instruction">Observe carefully...</h2>
            <div className="timer-bar"><motion.div className="timer-fill" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: 4, ease: 'linear' }} /></div>
            {renderScene()}
          </motion.div>
        )}

        {gameState === 'transitioning' && (
          <motion.div 
            key="transitioning"
            className="game-screen"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <h2 className="game-instruction">Get ready...</h2>
          </motion.div>
        )}

        {gameState === 'guessing' && (
          <motion.div 
            key="guessing"
            className="game-screen"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <h2 className="game-instruction">What changed? Tap it.</h2>
            {renderScene()}
          </motion.div>
        )}

        {gameState === 'success' && (
          <motion.div 
            key="success"
            className="game-screen"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          >
            <motion.h1 className="game-title" style={{ color: '#10B981' }} variants={fadeUp}>Excellent!</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>You spotted the change perfectly.</motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={nextLevel}>
              {level === 3 ? 'Complete Game' : 'Next Level'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
