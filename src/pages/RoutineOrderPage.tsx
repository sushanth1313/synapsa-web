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

export const RoutineOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { currentUser, incrementScore, completeGameActivity, locale, routineItems } = useAppStore();
  const strings = getStrings(locale);

  const [gameState, setGameState] = useState<GameState>('intro');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const attemptsRef = useRef(0);

  const [difficulty, setDifficulty] = useState(1);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(0);

  // We map the actual user routines to an array of titles for them to order
  const [currentRoutineSteps, setCurrentRoutineSteps] = useState<string[]>([]);
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
    // Only daily routines
    const dailyRoutines = (routineItems || []).filter(r => r.repeat === 'daily');
    
    // Sort them chronologically by time
    const sortedByTime = [...dailyRoutines].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    
    // Take up to `stepCount` routines for this round
    const stepCount = difficulty <= 2 ? 3 : difficulty === 3 ? 4 : 5;
    
    // If we have fewer than 3 routines, just use what we have (or they shouldn't even be able to start)
    const adaptedSteps = sortedByTime.slice(0, stepCount).map(r => r.title);
    
    setCurrentRoutineSteps(adaptedSteps);
    
    setUserSequence(new Array(adaptedSteps.length).fill(null));
    setPool([...adaptedSteps].sort(() => 0.5 - Math.random()));
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

  const [isProcessing, setIsProcessing] = useState(false);

  const checkAnswer = () => {
    if (currentRoutineSteps.length === 0 || isProcessing) return;
    setIsProcessing(true);

    let allCorrect = true;
    const newValidation = userSequence.map((item, idx) => {
      const isCorrect = item === currentRoutineSteps[idx];
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
      setTimeout(() => {
        setGameState('success');
        setIsProcessing(false);
      }, 1000);
    } else {
      setTimeout(() => {
        // Clear wrong ones
        setUserSequence(prev => prev.map((item, idx) => newValidation[idx] ? item : null));
        setValidation([]);
        setIsProcessing(false);
      }, 1000);
    }
  };

  const hasCompleted = useRef(false);

  const nextLevel = () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const maxRounds = 3;
    if (round === maxRounds) {
      if (hasCompleted.current) return;
      hasCompleted.current = true;
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      const finalScore = scoreRef.current;
      const finalAttempts = attemptsRef.current;
      const accuracy = Math.round((maxRounds / Math.max(finalAttempts, maxRounds)) * 100);
      
      DatabaseService.updateDifficulty(currentUser?.id || 'demo', 'DAILY_RECALL', accuracy, durationMs);
      completeGameActivity('DAILY_RECALL', finalScore, accuracy, Math.round(durationMs / 1000), difficulty);
      
      setGameState('complete');
      setIsProcessing(false);
    } else {
      const nextR = round + 1;
      setRound(nextR);
      startRound(nextR);
      setIsProcessing(false);
    }
  };

  const isFull = !userSequence.includes(null);

  const dailyRoutines = (routineItems || []).filter(r => r.repeat === 'daily');
  const hasEnoughRoutines = dailyRoutines.length >= 3;

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
              {hasEnoughRoutines 
                ? "Reconstruct your actual daily routines in the correct chronological order."
                : "You need at least 3 daily routines scheduled in the Routine tab to play this game."}
            </motion.p>
            {hasEnoughRoutines && (
              <motion.button className="start-btn" variants={fadeUp} onClick={startGame}>{strings.start_game || 'Start Game'}</motion.button>
            )}
            {!hasEnoughRoutines && (
              <motion.button className="start-btn" variants={fadeUp} onClick={() => navigate('/routine')}>Go to Routines</motion.button>
            )}
          </motion.div>
        )}

        {gameState === 'playing' && currentRoutineSteps.length > 0 && (
          <motion.div key="playing" className="game-screen" style={{ maxWidth: '1200px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h2 className="game-instruction">Arrange your routines chronologically:</h2>
            
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
