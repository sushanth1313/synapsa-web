import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
import { fadeUp, staggerContainer } from '../tokens/variants';
import './ObjectRecallPage.css';

const WORDS = [
  'APPLE', 'HOUSE', 'WATER', 'BREAD', 'CHAIR', 
  'TABLE', 'CLOUD', 'RIVER', 'GRASS', 'PAPER', 
  'PHONE', 'CLOCK', 'LIGHT', 'SMILE', 'DREAM', 
  'MUSIC', 'HEART', 'OCEAN', 'TRAIN', 'PLANT'
];

type GameState = 'idle' | 'playing' | 'success';

export const WordMemoryPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { incrementScore, completeGameActivity, locale } = useAppStore();
  const strings = getStrings(locale);

  const [gameState, setGameState] = useState<GameState>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  
  const [sequence, setSequence] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seenWords, setSeenWords] = useState<Set<string>>(new Set());
  
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);

  const startRound = () => {
    const turns = level === 1 ? 10 : level === 2 ? 15 : 20;
    
    // Generate sequence with ~30% repeats
    const seq: string[] = [];
    const localSeen = new Set<string>();
    
    for (let i = 0; i < turns; i++) {
      if (localSeen.size > 0 && Math.random() < 0.35) {
        // Pick a seen word
        const seenArr = Array.from(localSeen);
        seq.push(seenArr[Math.floor(Math.random() * seenArr.length)]);
      } else {
        // Pick a new word
        let w = WORDS[Math.floor(Math.random() * WORDS.length)];
        while (localSeen.has(w) && localSeen.size < WORDS.length) {
          w = WORDS[Math.floor(Math.random() * WORDS.length)];
        }
        seq.push(w);
        localSeen.add(w);
      }
    }
    
    setSequence(seq);
    setCurrentIndex(0);
    setSeenWords(new Set());
    setFeedback(null);
    setGameState('playing');
  };

  const handleChoice = (choice: 'new' | 'seen') => {
    if (gameState !== 'playing' || feedback !== null) return;
    
    const word = sequence[currentIndex];
    const isActuallySeen = seenWords.has(word);
    
    const isCorrect = (choice === 'seen' && isActuallySeen) || (choice === 'new' && !isActuallySeen);
    
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
      const points = 20 * level;
      setScore(s => s + points);
    }
    
    setTimeout(() => {
      setFeedback(null);
      const nextSeen = new Set(seenWords);
      nextSeen.add(word);
      setSeenWords(nextSeen);
      
      if (currentIndex + 1 < sequence.length) {
        setCurrentIndex(i => i + 1);
      } else {
        incrementScore(score); // Save score
        setGameState('success');
      }
    }, 800);
  };

  const hasCompleted = useRef(false);

  const nextLevel = () => {
    if (level === 3) {
      if (hasCompleted.current) return;
      hasCompleted.current = true;
      completeGameActivity('WORD_MEMORY', score, 100, 180, level);
      navigate('/games');
    } else {
      setLevel(l => l + 1);
      startRound();
    }
  };

  const currentWord = sequence[currentIndex];

  return (
    <div className="word-memory-page object-recall-page">
      
      <div className="game-header">
        <button className="game-back-btn" onClick={() => navigate('/games')}>← Exit</button>
        <div className="game-stats">
          <div>Level <span className="stat-value">{level}/3</span></div>
          <div>Score <span className="stat-value">{score}</span></div>
          {gameState === 'playing' && (
            <div>Word <span className="stat-value">{currentIndex + 1}/{sequence.length}</span></div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'idle' && (
          <motion.div 
            key="idle" className="game-screen"
            variants={reduced ? {} : staggerContainer} initial="hidden" animate="show" exit="hidden"
          >
            <motion.h1 className="game-title" variants={fadeUp}>Word Memory</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>
              Words will appear one by one. If you have seen the word ALREADY in this round, tap "SEEN". If it's the first time, tap "NEW".
            </motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={startRound}>{strings.start_game || 'Start Game'}</motion.button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div key="playing" className="game-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                transition={{ duration: 0.3 }}
                style={{
                  fontSize: 'clamp(48px, 8vw, 96px)',
                  fontWeight: 'bold',
                  color: feedback === 'correct' ? '#10B981' : feedback === 'wrong' ? '#EF4444' : 'var(--bone)',
                  margin: '64px 0',
                  letterSpacing: '4px'
                }}
              >
                {currentWord}
              </motion.div>
            </AnimatePresence>

            <div style={{ display: 'flex', gap: '32px', justifyContent: 'center' }}>
              <button 
                onClick={() => handleChoice('new')}
                style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '2px solid #3B82F6',
                  color: '#60A5FA',
                  padding: '24px 64px',
                  borderRadius: '24px',
                  fontSize: '32px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                disabled={feedback !== null}
              >
                NEW
              </button>
              
              <button 
                onClick={() => handleChoice('seen')}
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '2px solid #F59E0B',
                  color: '#FBBF24',
                  padding: '24px 64px',
                  borderRadius: '24px',
                  fontSize: '32px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 8px 32px rgba(245, 158, 11, 0.2)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                disabled={feedback !== null}
              >
                SEEN
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'success' && (
          <motion.div key="success" className="game-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <motion.h1 className="game-title" style={{ color: '#10B981' }} variants={fadeUp}>{strings.round_complete || 'Round Complete!'}</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>Your verbal memory is sharp.</motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={nextLevel}>
              {level === 3 ? 'Complete Game' : 'Next Level'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
