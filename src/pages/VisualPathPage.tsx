import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
import { fadeUp, staggerContainer } from '../tokens/variants';
import './ObjectRecallPage.css'; // Reuse game header and stats CSS
import './VisualPathPage.css';

type GameState = 'idle' | 'showing' | 'tracing' | 'success';

export const VisualPathPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { incrementScore, completeGameActivity, locale } = useAppStore();
  const strings = getStrings(locale);

  const [gameState, setGameState] = useState<GameState>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  
  const [gridSize, setGridSize] = useState(3);
  const [path, setPath] = useState<number[]>([]);
  
  const [currentlyShowingIdx, setCurrentlyShowingIdx] = useState<number>(-1);
  
  const [userTrace, setUserTrace] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<Record<number, 'correct'|'wrong'>>({});
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRound = () => {
    let size = 3;
    let pathLength = 4;
    
    if (level === 2) { size = 4; pathLength = 5; }
    if (level === 3) { size = 4; pathLength = 7; }
    
    setGridSize(size);
    
    // Generate a random path (allow adjacent or non-adjacent, to keep it simple but sequential)
    const newPath: number[] = [];
    const totalNodes = size * size;
    
    let current = Math.floor(Math.random() * totalNodes);
    newPath.push(current);
    
    for (let i = 1; i < pathLength; i++) {
      // Pick next node not recently visited
      let next = Math.floor(Math.random() * totalNodes);
      while (newPath.includes(next)) {
        next = Math.floor(Math.random() * totalNodes);
      }
      newPath.push(next);
    }
    
    setPath(newPath);
    setUserTrace([]);
    setFeedback({});
    setGameState('showing');
    setCurrentlyShowingIdx(-1);

    // Sequence animation
    let step = 0;
    const showInterval = setInterval(() => {
      if (step < newPath.length) {
        setCurrentlyShowingIdx(step);
        step++;
      } else {
        clearInterval(showInterval);
        setCurrentlyShowingIdx(-1);
        setTimeout(() => {
          setGameState('tracing');
        }, 500);
      }
    }, 800);

    timerRef.current = showInterval;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleNodeClick = (index: number) => {
    if (gameState !== 'tracing') return;
    if (userTrace.includes(index)) return; // Don't tap same twice
    
    const nextExpectedIdx = userTrace.length;
    
    if (path[nextExpectedIdx] === index) {
      // Correct step
      const newTrace = [...userTrace, index];
      setUserTrace(newTrace);
      
      if (newTrace.length === path.length) {
        // Finished successfully
        const newFb: Record<number, 'correct'> = {};
        newTrace.forEach(n => newFb[n] = 'correct');
        setFeedback(newFb);
        
        const points = 100 * level;
        setScore(s => s + points);
        incrementScore(points);
        setTimeout(() => setGameState('success'), 1000);
      }
    } else {
      // Wrong step
      setFeedback({ [index]: 'wrong' });
      setTimeout(() => {
        // Reset trace to try again
        setFeedback({});
        setUserTrace([]);
      }, 800);
    }
  };

  const nextLevel = () => {
    if (level === 3) {
      completeGameActivity('VISUAL_PATH', score, 100, 180, level);
      navigate('/games');
    } else {
      setLevel(l => l + 1);
      startRound();
    }
  };

  return (
    <div className="visual-path-page object-recall-page">
      
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
            <motion.h1 className="game-title" variants={fadeUp}>Visual Path</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>
              Watch the path light up. When it fades, retrace it in the exact same order.
            </motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={startRound}>{strings.start_game || 'Start Game'}</motion.button>
          </motion.div>
        )}

        {(gameState === 'showing' || gameState === 'tracing') && (
          <motion.div key="playing" className="game-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="game-instruction">
              {gameState === 'showing' ? 'Watch the path...' : `Retrace the path (${userTrace.length}/${path.length})`}
            </h2>
            
            <div className="vp-grid-wrapper">
              <div className="vp-grid" data-size={gridSize}>
                {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                  const isActivePath = gameState === 'showing' && currentlyShowingIdx !== -1 && path[currentlyShowingIdx] === i;
                  const isTraced = gameState === 'tracing' && userTrace.includes(i);
                  const fb = feedback[i];
                  
                  return (
                    <div 
                      key={i} 
                      className={`vp-node ${isActivePath ? 'active-path' : ''} ${isTraced ? 'traced' : ''} ${fb || ''} ${gameState !== 'tracing' ? 'disabled' : ''}`} 
                      onClick={() => handleNodeClick(i)}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'success' && (
          <motion.div key="success" className="game-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <motion.h1 className="game-title" style={{ color: '#10B981' }} variants={fadeUp}>Perfect Path!</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>You successfully retraced the sequence.</motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={nextLevel}>
              {level === 3 ? 'Complete Game' : 'Next Level'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
