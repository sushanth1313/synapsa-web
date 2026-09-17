import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
import { fadeUp, staggerContainer } from '../tokens/variants';
import './ObjectRecallPage.css'; // Reuse general layout
import './FaceMemoryPage.css';

const PERSONS = ['👩‍🦰', '👨‍🦱', '👱‍♀️', '🧔‍♂️', '👵', '👴', '👲', '👳‍♀️'];
const EMOTIONS = ['😊', '😢', '😠', '😲', '😴', '😎', '🤢', '🤔'];

type GameState = 'idle' | 'observing' | 'recalling' | 'success';

interface Pair {
  person: string;
  emotion: string;
}

export const FaceMemoryPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { incrementScore, completeGameActivity, locale } = useAppStore();
  const strings = getStrings(locale);

  const [gameState, setGameState] = useState<GameState>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  
  const [targetPairs, setTargetPairs] = useState<Pair[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  
  // Array of user answers (emotion emoji or null) aligned with targetPairs
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [validation, setValidation] = useState<boolean[]>([]); // true if correct
  
  const [activeSlotIdx, setActiveSlotIdx] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRound = () => {
    const pairCount = level === 1 ? 3 : level === 2 ? 4 : 5;
    
    // Pick unique persons
    const shuffledP = [...PERSONS].sort(() => 0.5 - Math.random());
    const selectedP = shuffledP.slice(0, pairCount);
    
    // Pick unique emotions
    const shuffledE = [...EMOTIONS].sort(() => 0.5 - Math.random());
    const selectedE = shuffledE.slice(0, pairCount);
    
    const pairs = selectedP.map((p, i) => ({ person: p, emotion: selectedE[i] }));
    
    // The options to choose from are the emotions used in this round, plus some decoys
    const decoysE = shuffledE.slice(pairCount, pairCount + 2);
    const opts = [...selectedE, ...decoysE].sort(() => 0.5 - Math.random());
    
    setTargetPairs(pairs);
    setOptions(opts);
    setUserAnswers(new Array(pairCount).fill(null));
    setValidation([]);
    setActiveSlotIdx(null);
    setGameState('observing');

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setGameState('recalling');
    }, pairCount * 1500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const selectOption = (emotion: string) => {
    if (activeSlotIdx !== null) {
      const newAnswers = [...userAnswers];
      newAnswers[activeSlotIdx] = emotion;
      setUserAnswers(newAnswers);
      setActiveSlotIdx(null);
    }
  };

  const checkAnswer = () => {
    let allCorrect = true;
    const newValidation = userAnswers.map((ans, idx) => {
      const isCorrect = ans === targetPairs[idx].emotion;
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
        setUserAnswers(prev => prev.map((item, idx) => newValidation[idx] ? item : null));
        setValidation([]);
      }, 1000);
    }
  };

  const hasCompleted = useRef(false);

  const nextLevel = () => {
    if (level === 3) {
      if (hasCompleted.current) return;
      hasCompleted.current = true;
      completeGameActivity('FACE_MEMORY', score, 100, 180, level);
      navigate('/games');
    } else {
      setLevel(l => l + 1);
      startRound();
    }
  };

  const isFull = !userAnswers.includes(null);

  return (
    <div className="face-memory-page object-recall-page">
      
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
            <motion.h1 className="game-title" variants={fadeUp}>Face & Expression Memory</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>
              Remember the emotion associated with each person.
            </motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={startRound}>{strings.start_game || 'Start Game'}</motion.button>
          </motion.div>
        )}

        {gameState === 'observing' && (
          <motion.div key="observing" className="game-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="game-instruction">Remember their feelings...</h2>
            <div className="timer-bar"><motion.div className="timer-fill" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: targetPairs.length * 1.5, ease: 'linear' }} /></div>
            
            <div className="fm-pair-grid">
              {targetPairs.map((pair, i) => (
                <motion.div key={i} className="fm-pair" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="fm-person">{pair.person}</div>
                  <div className="fm-emotion">{pair.emotion}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {gameState === 'recalling' && (
          <motion.div key="recalling" className="game-screen" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h2 className="game-instruction">Who felt what? (Tap a slot, then tap an emotion below)</h2>
            
            <div className="fm-pair-grid">
              {targetPairs.map((pair, i) => {
                const ans = userAnswers[i];
                const isActive = activeSlotIdx === i;
                const statusClass = validation.length > 0 ? (validation[i] ? 'checking correct' : 'checking wrong') : '';
                
                return (
                  <div key={i} className={`fm-pair ${statusClass}`}>
                    <div className="fm-person">{pair.person}</div>
                    <div 
                      className={`fm-emotion-slot ${ans ? 'filled' : ''}`}
                      style={{ borderColor: isActive ? '#3B82F6' : undefined }}
                      onClick={(e) => { e.stopPropagation(); setActiveSlotIdx(i); }}
                    >
                      {ans ? ans : (isActive ? '?' : '')}
                    </div>
                  </div>
                );
              })}
            </div>

            {activeSlotIdx !== null && (
              <motion.div className="fm-options-bar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {options.map((opt, j) => (
                  <button key={j} className="fm-option-btn" onClick={(e) => { e.stopPropagation(); selectOption(opt); }}>{opt}</button>
                ))}
              </motion.div>
            )}

            <button 
              className={`confirm-btn ${isFull ? 'active' : ''}`}
              style={{ marginTop: '48px' }}
              onClick={checkAnswer}
              disabled={!isFull}
            >
              Verify Answers
            </button>
          </motion.div>
        )}

        {gameState === 'success' && (
          <motion.div key="success" className="game-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <motion.h1 className="game-title" style={{ color: '#10B981' }} variants={fadeUp}>Great Empathy!</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>You remembered everyone's expressions perfectly.</motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={nextLevel}>
              {level === 3 ? 'Complete Game' : 'Next Level'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
