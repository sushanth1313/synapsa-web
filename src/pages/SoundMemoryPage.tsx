import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
import { fadeUp, staggerContainer } from '../tokens/variants';
import './ObjectRecallPage.css'; // Reuse general layout
import './SoundMemoryPage.css';

const INSTRUMENTS = ['🎹', '🎸', '🥁', '🎺'];

type GameState = 'idle' | 'playing_seq' | 'user_turn' | 'success' | 'failed';

export const SoundMemoryPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { incrementScore, completeGameActivity, locale } = useAppStore();
  const strings = getStrings(locale);

  const [gameState, setGameState] = useState<GameState>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState(0);
  
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [wrongNote, setWrongNote] = useState<number | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRound = () => {
    // Simon says: we build a sequence that grows by 1.
    // Actually, to make it standard round-based, each level generates a fresh sequence of length N.
    const seqLength = level === 1 ? 4 : level === 2 ? 5 : 6;
    
    const newSeq: number[] = [];
    for (let i = 0; i < seqLength; i++) {
      newSeq.push(Math.floor(Math.random() * INSTRUMENTS.length));
    }
    
    setSequence(newSeq);
    setUserStep(0);
    setWrongNote(null);
    setGameState('playing_seq');

    playSequence(newSeq);
  };

  const playSequence = (seq: number[]) => {
    let step = 0;
    
    const playNext = () => {
      if (step < seq.length) {
        setActiveNote(seq[step]);
        // Note is active for 600ms
        timerRef.current = setTimeout(() => {
          setActiveNote(null);
          // Gap between notes is 200ms
          timerRef.current = setTimeout(playNext, 200);
          step++;
        }, 600);
      } else {
        setGameState('user_turn');
      }
    };
    
    // Start after 1s delay
    timerRef.current = setTimeout(playNext, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleInstrumentClick = (index: number) => {
    if (gameState !== 'user_turn') return;
    
    // Light it up briefly
    setActiveNote(index);
    setTimeout(() => setActiveNote(null), 300);

    if (index === sequence[userStep]) {
      // Correct step
      const nextStep = userStep + 1;
      setUserStep(nextStep);
      
      if (nextStep === sequence.length) {
        // Round complete
        const points = 100 * level;
        setScore(s => s + points);
        incrementScore(points);
        setTimeout(() => setGameState('success'), 500);
      }
    } else {
      // Wrong step
      setWrongNote(index);
      setTimeout(() => setGameState('failed'), 500);
    }
  };

  const nextLevel = () => {
    if (level === 3) {
      completeGameActivity('SOUND_MEMORY', score, 100, 180, level);
      navigate('/games');
    } else {
      setLevel(l => l + 1);
      startRound();
    }
  };

  const handleFailFinish = () => {
    completeGameActivity('SOUND_MEMORY', score, 100, 180, level);
    incrementScore(score); // Commit score up to this point
    navigate('/games');
  };

  return (
    <div className="sound-memory-page object-recall-page">
      
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
            <motion.h1 className="game-title" variants={fadeUp}>Sound Memory</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>
              Watch and "listen" to the sequence of instruments. Repeat the exact sequence.
            </motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={startRound}>{strings.start_game || 'Start Game'}</motion.button>
          </motion.div>
        )}

        {(gameState === 'playing_seq' || gameState === 'user_turn') && (
          <motion.div key="playing" className="game-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="game-instruction">
              {gameState === 'playing_seq' ? 'Watch the sequence...' : `Your turn (${userStep}/${sequence.length})`}
            </h2>
            
            <div className="sm-instruments-container">
              {INSTRUMENTS.map((inst, i) => {
                const isActive = activeNote === i;
                const isWrong = wrongNote === i;
                return (
                  <div 
                    key={i} 
                    data-id={i}
                    className={`sm-instrument ${isActive ? 'active' : ''} ${isWrong ? 'wrong' : ''} ${gameState !== 'user_turn' ? 'disabled' : ''}`}
                    onClick={() => handleInstrumentClick(i)}
                  >
                    {inst}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {gameState === 'success' && (
          <motion.div key="success" className="game-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <motion.h1 className="game-title" style={{ color: '#10B981' }} variants={fadeUp}>Great Rhythm!</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>You reproduced the sequence perfectly.</motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={nextLevel}>
              {level === 3 ? 'Complete Game' : 'Next Level'}
            </motion.button>
          </motion.div>
        )}

        {gameState === 'failed' && (
          <motion.div key="failed" className="game-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <motion.h1 className="game-title" style={{ color: '#EF4444' }} variants={fadeUp}>Oops!</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>That was the wrong instrument.</motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={handleFailFinish}>
              Finish Game
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
