import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { useReducedMotion } from '../hooks';
import { fadeUp } from '../tokens/variants';
import { GameResult } from '../components/game/GameResult';
import { GameIntro } from '../components/game/GameIntro';
import './FocusFlowPage.css';

type Phase = 'intro' | 'playing' | 'complete';
type Difficulty = 'easy' | 'medium' | 'hard';

const SYMBOLS = ['🌸', '🌺', '🌼', '🌻', '🌞', '🌙', '⭐', '☁️', '❄️', '🔥'];

const DIFFICULTY_CONFIG: Record<Difficulty, { targetSpawns: number, distractorSpawns: number, spawnInterval: number, lifetime: number }> = {
  easy: { targetSpawns: 15, distractorSpawns: 20, spawnInterval: 1200, lifetime: 2500 },
  medium: { targetSpawns: 20, distractorSpawns: 40, spawnInterval: 800, lifetime: 1800 },
  hard: { targetSpawns: 25, distractorSpawns: 60, spawnInterval: 500, lifetime: 1200 },
};

interface ActiveItem {
  id: string;
  symbol: string;
  isTarget: boolean;
  x: number; // percentage 0-90
  y: number; // percentage 0-90
  createdAt: number;
}

export const FocusFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const { incrementScore, incrementGamesPlayed } = useAppStore();
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<Phase>('intro');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [targetSymbol, setTargetSymbol] = useState<string>('🌸');
  
  const [score, setScore] = useState(0);
  const [correctTaps, setCorrectTaps] = useState(0);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const [items, setItems] = useState<ActiveItem[]>([]);
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);

  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const stateRef = useRef({
    spawnedTargets: 0,
    spawnedDistractors: 0,
    totalTargets: 0,
    totalDistractors: 0,
    startTime: 0,
    activeItems: [] as ActiveItem[]
  });

  const stopGame = useCallback(() => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
  }, []);

  const finishGame = useCallback(() => {
    stopGame();
    incrementGamesPlayed();
    setPhase('complete');
  }, [stopGame, incrementGamesPlayed]);

  const handleStart = (diffLevel: number) => {
    let diffStr: Difficulty = 'easy';
    if (diffLevel === 3) diffStr = 'medium';
    if (diffLevel === 5) diffStr = 'hard';

    const cfg = DIFFICULTY_CONFIG[diffStr];
    
    setDifficulty(diffStr);
    setScore(0);
    setCorrectTaps(0);
    setWrongTaps(0);
    setTimeElapsed(0);
    setItems([]);
    setFeedback(null);
    
    const target = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    setTargetSymbol(target);

    stateRef.current = {
      spawnedTargets: 0,
      spawnedDistractors: 0,
      totalTargets: cfg.targetSpawns,
      totalDistractors: cfg.distractorSpawns,
      startTime: Date.now(),
      activeItems: []
    };

    setPhase('playing');

    // Spawn interval
    spawnTimerRef.current = setInterval(() => {
      const state = stateRef.current;
      const targetsLeft = state.totalTargets - state.spawnedTargets;
      const distractorsLeft = state.totalDistractors - state.spawnedDistractors;
      
      if (targetsLeft <= 0 && distractorsLeft <= 0) {
        if (state.activeItems.length === 0) {
          finishGame();
        }
        return;
      }

      // Decide what to spawn
      const totalLeft = targetsLeft + distractorsLeft;
      const spawnTarget = Math.random() < (targetsLeft / totalLeft);
      
      let symbolToSpawn = target;
      if (!spawnTarget) {
        // Pick a distractor symbol
        let distractor = target;
        while (distractor === target) {
          distractor = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        }
        symbolToSpawn = distractor;
        state.spawnedDistractors++;
      } else {
        state.spawnedTargets++;
      }

      const newItem: ActiveItem = {
        id: crypto.randomUUID(),
        symbol: symbolToSpawn,
        isTarget: spawnTarget,
        x: Math.random() * 80 + 10, // 10% to 90%
        y: Math.random() * 70 + 15, // 15% to 85%
        createdAt: Date.now()
      };

      state.activeItems.push(newItem);
      setItems([...state.activeItems]);

    }, cfg.spawnInterval);

    // Game loop for cleanup and time
    gameLoopRef.current = setInterval(() => {
      const now = Date.now();
      setTimeElapsed(Math.floor((now - stateRef.current.startTime) / 1000));
      
      let changed = false;
      stateRef.current.activeItems = stateRef.current.activeItems.filter(item => {
        const isAlive = (now - item.createdAt) < cfg.lifetime;
        if (!isAlive) changed = true;
        return isAlive;
      });

      if (changed) {
        setItems([...stateRef.current.activeItems]);
      }
      
      // Auto-finish if everything spawned and cleared
      const state = stateRef.current;
      if (state.spawnedTargets >= state.totalTargets && 
          state.spawnedDistractors >= state.totalDistractors && 
          state.activeItems.length === 0) {
        finishGame();
      }
    }, 100);

  };

  const handleItemTap = (item: ActiveItem) => {
    // Remove it
    stateRef.current.activeItems = stateRef.current.activeItems.filter(i => i.id !== item.id);
    setItems([...stateRef.current.activeItems]);

    if (item.isTarget) {
      setCorrectTaps(c => c + 1);
      const points = 50;
      setScore(s => s + points);
      incrementScore(points);
      
      setFeedback('correct');
      setTimeout(() => setFeedback(null), 300);
    } else {
      setWrongTaps(w => w + 1);
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 300);
    }
  };

  useEffect(() => {
    return stopGame;
  }, [stopGame]);

  const cfg = DIFFICULTY_CONFIG[difficulty];
  const accuracy = Math.round((correctTaps / Math.max(correctTaps + wrongTaps, 1)) * 100);

  return (
    <div className="focus-page" id="focus-flow-page">
      <div className="game-header" style={{ zIndex: 100 }}>
        <button className="game-back-btn" onClick={() => { stopGame(); navigate('/games'); }}>
          ← Games
        </button>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <GameIntro
            title="Focus Flow"
            skill="🎯 Attention & Focus"
            description="Identify moving targets while ignoring distractions. Find the matching symbol."
            duration="4 MINUTES"
            instructions={[
              "Look at the target symbol at the top.",
              "Tap the objects that match the target.",
              "Ignore everything else!"
            ]}
            onStart={handleStart}
            onCancel={() => navigate('/games')}
          />
        )}

        {phase === 'playing' && (
          <motion.div 
            key="game"
            className="focus-game-area"
            variants={reduced ? {} : fadeUp}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
          >
            <div className="focus-hud">
              <div className="focus-hud-stat">
                <b>{score}</b>
                <span>Score</span>
              </div>
              <div className="focus-hud-stat">
                <b>{timeElapsed}s</b>
                <span>Time</span>
              </div>
            </div>

            <div className="focus-target-indicator">
              <span>TARGET:</span>
              <span style={{ fontSize: '32px' }}>{targetSymbol}</span>
            </div>

            {items.map(item => (
              <motion.div
                key={item.id}
                className="focus-item"
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onMouseDown={() => handleItemTap(item)}
                onTouchStart={() => handleItemTap(item)}
              >
                {item.symbol}
              </motion.div>
            ))}
            
            <AnimatePresence>
              {feedback && (
                <motion.div
                  className={`focus-feedback focus-feedback--${feedback}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {feedback === 'correct' ? '✓' : '✗'}
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {phase === 'complete' && (
          <GameResult
            gameName="Focus Flow"
            score={score}
            accuracy={accuracy}
            timeSec={timeElapsed}
            insight={`Great concentration! You successfully identified ${correctTaps} out of ${cfg.targetSpawns} targets.`}
            onPlayAgain={() => handleStart(difficulty === 'easy' ? 1 : difficulty === 'medium' ? 3 : 5)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
