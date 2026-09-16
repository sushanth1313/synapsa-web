import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
import { fadeUp, staggerContainer } from '../tokens/variants';
import { DatabaseService } from '../services/DatabaseService';
import './ObjectRecallPage.css'; // Reuse general layout
import './RoutineOrderPage.css';

const ROUTINES = [
  {
    title: 'Morning Preparation',
    steps: ['Wake up and stretch', 'Brush teeth', 'Take morning medicine', 'Have breakfast', 'Go for a short walk']
  },
  {
    title: 'Making a Cup of Tea',
    steps: ['Boil water in the kettle', 'Put a teabag in the cup', 'Pour hot water', 'Add sugar or milk', 'Stir and enjoy']
  },
  {
    title: 'Evening Wind-down',
    steps: ['Have a light dinner', 'Take evening medicine', 'Lock the doors', 'Listen to calm music', 'Go to sleep']
  }
];

type GameState = 'intro' | 'playing' | 'success' | 'complete';

export const RoutineOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { currentUser, incrementScore, completeGameActivity, locale } = useAppStore();
  const strings = getStrings(locale);

  const [gameState, setGameState] = useState<GameState>('intro');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);        // mirrors score; readable inside closures without stale state
  const attemptsRef = useRef(0);     // mirrors attempts; readable inside closures without stale state

  const [difficulty, setDifficulty] = useState(1);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const [currentRoutine, setCurrentRoutine] = useState<typeof ROUTINES[0] | null>(null);
  const [pool, setPool] = useState<string[]>([]);
  
  // Array of placed steps (null if empty slot)
  const [userSequence, setUserSequence] = useState<(string | null)[]>([]);
  const [validation, setValidation] = useState<boolean[]>([]); // true if correct, false if wrong

  React.useEffect(() => {
    const diff = DatabaseService.getDifficulty(currentUser?.id || 'demo', 'DAILY_RECALL');
    setDifficulty(diff);
  }, [currentUser]);

  const startGame = () => {
    setRound(1);
    setScore(0);
    scoreRef.current = 0;
    setAttempts(0);
    attemptsRef.current = 0;
    setStartTime(Date.now());
    startRound(1);
  };

  const startRound = (currentRound: number) => {
    const routineBase = ROUTINES[(currentRound - 1) % ROUTINES.length];
    
    // Adapt complexity: Easy = 3 steps, Medium = 4 steps, Hard = 5 steps
    const stepCount = difficulty <= 2 ? 3 : difficulty === 3 ? 4 : 5;
    const adaptedSteps = routineBase.steps.slice(0, stepCount);
    
    const routine = {
      title: routineBase.title,
      steps: adaptedSteps
    };

    setCurrentRoutine(routine);
    
    setUserSequence(new Array(routine.steps.length).fill(null));
    setPool([...routine.steps].sort(() => 0.5 - Math.random()));
    setValidation([]);
    setGameState('playing');
  };

  const handlePoolClick = (item: string) => {
    if (gameState !== 'playing') return;
    
    // Find first empty slot
    const emptyIdx = userSequence.findIndex(s => s === null);
    if (emptyIdx !== -1) {
      const newSeq = [...userSequence];
      newSeq[emptyIdx] = item;
      setUserSequence(newSeq);
    }
  };

  const handleSlotClick = (index: number) => {
    if (gameState !== 'playing') return;
    if (userSequence[index] !== null) {
      const newSeq = [...userSequence];
      newSeq[index] = null;
      setUserSequence(newSeq);
    }
  };

  const checkAnswer = () => {
    if (!currentRoutine) return;

    let allCorrect = true;
    const newValidation = userSequence.map((item, idx) => {
      const isCorrect = item === currentRoutine.steps[idx];
      if (!isCorrect) allCorrect = false;
      return isCorrect;
    });

    setValidation(newValidation);
    attemptsRef.current += 1;
    setAttempts(attemptsRef.current);

    if (allCorrect) {
      const points = 100 * round;
      scoreRef.current += points;
      setScore(scoreRef.current);
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

  const nextLevel = () => {
    const maxRounds = 3;
    if (round === maxRounds) {
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      // Use refs so we read the real accumulated values, not stale React state
      const finalScore = scoreRef.current;
      const finalAttempts = attemptsRef.current;
      const accuracy = Math.round((maxRounds / Math.max(finalAttempts, maxRounds)) * 100);
      
      DatabaseService.updateDifficulty(currentUser?.id || 'demo', 'DAILY_RECALL', accuracy, durationMs);
      completeGameActivity('DAILY_RECALL', finalScore, accuracy, Math.round(durationMs / 1000), difficulty);
      
      setGameState('complete');
    } else {
      const nextR = round + 1;
      setRound(nextR);
      startRound(nextR);
    }
  };

  const isFull = !userSequence.includes(null);

  return (
    <div className="routine-order-page object-recall-page">
      
      <div className="game-header">
        <button className="game-back-btn" onClick={() => navigate('/games')}>← Exit</button>
        <div className="game-stats">
          <div>Round <span className="stat-value">{round}/3</span></div>
          <div>Lvl <span className="stat-value">{difficulty}</span></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'intro' && (
          <motion.div 
            key="intro" className="game-screen"
            variants={reduced ? {} : staggerContainer} initial="hidden" animate="show" exit="hidden"
          >
            <motion.h1 className="game-title" variants={fadeUp}>Daily Routine Recall</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>
              Reconstruct familiar daily activities in the correct chronological order.
            </motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={startGame}>{strings.start_game || 'Start Game'}</motion.button>
          </motion.div>
        )}

        {gameState === 'playing' && currentRoutine && (
          <motion.div key="playing" className="game-screen" style={{ maxWidth: '1200px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h2 className="game-instruction">Routine: <strong>{currentRoutine.title}</strong></h2>
            
            <div className="ro-container">
              
              {/* Slots Column */}
              <div className={`ro-column ${validation.length > 0 ? 'checking' : ''}`}>
                <div className="ro-column-title">Correct Order</div>
                {userSequence.map((item, i) => (
                  <div 
                    key={`slot-${i}`}
                    className={`ro-slot ${item ? 'filled' : ''} ${validation[i] ? 'correct' : ''}`}
                    onClick={() => handleSlotClick(i)}
                  >
                    <div className="ro-slot-num">{i + 1}</div>
                    {item}
                  </div>
                ))}
              </div>

              {/* Pool Column */}
              <div className="ro-column">
                <div className="ro-column-title">Available Steps</div>
                {pool.map((item, i) => {
                  const isUsed = userSequence.includes(item);
                  return (
                    <div 
                      key={`pool-${i}`}
                      className={`ro-pool-item ${isUsed ? 'used' : ''}`}
                      onClick={() => !isUsed && handlePoolClick(item)}
                    >
                      {item}
                    </div>
                  );
                })}
              </div>

            </div>

            <button 
              className={`confirm-btn ${isFull ? 'active' : ''}`}
              onClick={checkAnswer}
              disabled={!isFull}
            >
              Verify Order
            </button>
          </motion.div>
        )}

        {gameState === 'success' && (
          <motion.div key="success" className="game-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <motion.h1 className="game-title" style={{ color: '#10B981' }} variants={fadeUp}>Perfect Logic!</motion.h1>
            <motion.p className="game-instruction" variants={fadeUp}>You ordered the steps flawlessly.</motion.p>
            <motion.button className="start-btn" variants={fadeUp} onClick={nextLevel}>
              Next Round
            </motion.button>
          </motion.div>
        )}

        {gameState === 'complete' && (
          <motion.div key="complete" className="game-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <motion.h1 className="game-title" style={{ color: 'var(--color-tea-green)' }} variants={fadeUp}>Routine Complete</motion.h1>
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
