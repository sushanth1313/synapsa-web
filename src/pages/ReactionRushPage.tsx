import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { useReducedMotion } from '../hooks';
import { GameResult } from '../components/game/GameResult';
import { GameIntro } from '../components/game/GameIntro';
import { DatabaseService } from '../services/DatabaseService';
import './ReactionRushPage.css';

type Phase = 'intro' | 'waiting' | 'ready' | 'early' | 'complete';
type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG: Record<Difficulty, { rounds: number }> = {
  easy: { rounds: 5 },
  medium: { rounds: 8 },
  hard: { rounds: 12 },
};

export const ReactionRushPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, incrementScore, incrementGamesPlayed, completeGameActivity } = useAppStore();
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<Phase>('intro');
  const [difficulty, setDifficulty] = useState<number>(1);
  const [round, setRound] = useState(1);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);

  React.useEffect(() => {
    const diff = DatabaseService.getDifficulty(currentUser?.id || 'demo', 'ATTENTION');
    setDifficulty(diff);
  }, [currentUser]);

  const totalRounds = difficulty <= 2 ? 5 : difficulty === 3 ? 8 : 12;

  const startWaiting = useCallback(() => {
    setPhase('waiting');
    
    // Adaptive: Higher difficulty means shorter or more unpredictable wait time
    const minWait = difficulty >= 4 ? 1000 : 2000;
    const maxWait = difficulty >= 4 ? 2000 : 3000;
    const waitTime = Math.random() * maxWait + minWait;
    
    timerRef.current = setTimeout(() => {
      setPhase('ready');
      startTimeRef.current = performance.now();
    }, waitTime);
  }, [difficulty]);

  const handleStart = () => {
    setRound(1);
    setReactionTimes([]);
    startWaiting();
  };

  const handleTap = () => {
    if (phase === 'waiting') {
      // Early tap
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase('early');
      setTimeout(() => {
        startWaiting();
      }, 2000);
      return;
    }

    if (phase === 'ready') {
      const endTime = performance.now();
      const rt = endTime - startTimeRef.current;
      
      const newTimes = [...reactionTimes, rt];
      setReactionTimes(newTimes);

      if (round < totalRounds) {
        setRound(r => r + 1);
        startWaiting();
      } else {
        const accuracy = rt === 0 ? 0 : Math.max(0, Math.min(100, Math.round(100 - ((rt - 400) / 6))));
        DatabaseService.updateDifficulty(currentUser?.id || 'demo', 'ATTENTION', accuracy, rt);
        
        incrementGamesPlayed();
        completeGameActivity('ATTENTION', 15, accuracy, Math.round(rt / 1000), difficulty);
        setPhase('complete');
      }
    }
  };

  const handlePlayAgain = () => {
    const newDiff = DatabaseService.getDifficulty(currentUser?.id || 'demo', 'ATTENTION');
    setDifficulty(newDiff);
    handleStart();
  };

  // Calculate final score
  const avgRt = reactionTimes.length > 0 
    ? reactionTimes.reduce((a,b) => a+b, 0) / reactionTimes.length 
    : 0;
  const bestRt = reactionTimes.length > 0 
    ? Math.min(...reactionTimes) 
    : 0;
  
  // Scoring formula: 1000 - avgRt (floor at 0) per round
  const baseScorePerRound = Math.max(1000 - avgRt, 0);
  const finalScore = Math.round(baseScorePerRound * reactionTimes.length);
  
  // Accuracy: if early taps were tracked we could use them. For now let's just base it on speed.
  // Less than 400ms is 100%. More than 1000ms is 0%.
  const accuracy = avgRt === 0 ? 0 : Math.max(0, Math.min(100, Math.round(100 - ((avgRt - 400) / 6))));

  return (
    <div className="reaction-page" id="reaction-rush-page">
      <div className="game-header">
        <button className="game-back-btn" onClick={() => navigate('/games')}>
          ← Games
        </button>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <GameIntro
            title="Reaction Rush"
            skill="⚡ Reaction & Attention"
            description="Test your reflexes and focus. Wait for the signal and react as fast as possible."
            duration="3 MINUTES"
            instructions={[
              "Wait while the circle is gray.",
              "Tap immediately when it turns green.",
              "Don't tap too early!"
            ]}
            onStart={handleStart}
            onCancel={() => navigate('/games')}
          />
        )}

        {(phase === 'waiting' || phase === 'ready' || phase === 'early') && (
          <motion.div 
            key="game"
            className="reaction-game-area"
            variants={reduced ? {} : fadeUp}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
          >
            <div className="reaction-hud">
              <div className="reaction-hud-stat">
                <b>{round} / {totalRounds}</b>
                <span>Round</span>
              </div>
              <div className="reaction-hud-stat">
                <b>Lvl {difficulty}</b>
                <span>Difficulty</span>
              </div>
              <div className="reaction-hud-stat">
                <b>{reactionTimes.length > 0 ? (reactionTimes[reactionTimes.length-1]/1000).toFixed(3) + 's' : '---'}</b>
                <span>Last</span>
              </div>
            </div>

            <motion.div
              className={`reaction-target reaction-target--${phase}`}
              onMouseDown={handleTap}
              onTouchStart={handleTap}
              whileTap={{ scale: 0.95 }}
            >
              {phase === 'waiting' && 'Wait for green...'}
              {phase === 'ready' && 'TAP!'}
              {phase === 'early' && 'Too early!'}
            </motion.div>
          </motion.div>
        )}

        {phase === 'complete' && (
          <GameResult
            gameName="Reaction Rush"
            score={finalScore}
            accuracy={accuracy}
            levelsCompleted={totalRounds}
            insight={`Impressive speed! Your best reaction was ${(bestRt/1000).toFixed(3)}s. Fast reflexes help with daily awareness and coordination.`}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
