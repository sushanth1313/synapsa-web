// ============================================================
// SYNAPSA — Memory Match Game (Premium Redesign)
// ============================================================

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { useReducedMotion } from '../hooks';
import { fadeUp, staggerContainer, cinematicText } from '../tokens/variants';
import { GameResult } from '../components/game/GameResult';
import { GameIntro } from '../components/game/GameIntro';
import { DatabaseService } from '../services/DatabaseService';
import './MemoryGamePage.css';

// ── Premium Inline SVG Objects ─────────────────────────────

const KopouFlower = () => (
  <svg viewBox="0 0 100 100" className="card-object">
    <defs>
      <linearGradient id="kopouGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#db2777" />
      </linearGradient>
    </defs>
    <path d="M50 20 C60 10, 80 20, 80 40 C80 60, 50 80, 50 80 C50 80, 20 60, 20 40 C20 20, 40 10, 50 20 Z" fill="url(#kopouGrad)" />
    <circle cx="50" cy="40" r="8" fill="#fde047" />
    <path d="M50 80 L50 95" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const AssamTeaCup = () => (
  <svg viewBox="0 0 100 100" className="card-object">
    <defs>
      <linearGradient id="teaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
      <linearGradient id="cupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
    </defs>
    {/* Saucer */}
    <ellipse cx="50" cy="80" rx="35" ry="10" fill="url(#cupGrad)" />
    {/* Cup body */}
    <path d="M25 40 Q25 75 50 75 Q75 75 75 40 Z" fill="url(#cupGrad)" />
    {/* Handle */}
    <path d="M70 45 C85 45, 85 65, 70 65" fill="none" stroke="url(#cupGrad)" strokeWidth="6" strokeLinecap="round" />
    {/* Tea Liquid */}
    <ellipse cx="50" cy="40" rx="23" ry="6" fill="url(#teaGrad)" />
    {/* Steam */}
    <path d="M40 30 Q35 20 45 10" fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    <path d="M55 25 Q50 15 60 5" fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const WarmLantern = () => (
  <svg viewBox="0 0 100 100" className="card-object">
    <defs>
      <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#f59e0b" />
      </radialGradient>
      <linearGradient id="clayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
    </defs>
    {/* Glow background */}
    <circle cx="50" cy="35" r="25" fill="#fef08a" opacity="0.2" filter="blur(8px)" />
    {/* Base */}
    <path d="M20 70 Q50 90 80 70 L70 55 Q50 65 30 55 Z" fill="url(#clayGrad)" />
    {/* Flame */}
    <path d="M50 20 Q60 40 50 50 Q40 40 50 20 Z" fill="url(#flameGlow)" />
  </svg>
);

const MountainLandscape = () => (
  <svg viewBox="0 0 100 100" className="card-object">
    <defs>
      <linearGradient id="mountGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </linearGradient>
      <linearGradient id="mountGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#172554" />
      </linearGradient>
    </defs>
    {/* Sun */}
    <circle cx="70" cy="30" r="12" fill="#fde047" />
    {/* Back Mountain */}
    <path d="M10 80 L50 20 L90 80 Z" fill="url(#mountGrad1)" />
    {/* Front Mountain */}
    <path d="M-10 90 L30 40 L70 90 Z" fill="url(#mountGrad2)" />
    {/* Ground */}
    <rect x="0" y="80" width="100" height="20" fill="#0f172a" />
  </svg>
);

// ── Card data (4 Pairs for larger, elegant display) ────────

const Dhol = () => (
  <svg viewBox="0 0 100 100" className="card-object">
    <rect x="20" y="30" width="60" height="40" rx="10" fill="#8B5E3C" />
    <path d="M20 30 Q10 50 20 70 Z" fill="#D4A373" />
    <path d="M80 30 Q90 50 80 70 Z" fill="#D4A373" />
    <line x1="20" y1="35" x2="80" y2="65" stroke="#FBBF24" strokeWidth="2" />
    <line x1="20" y1="65" x2="80" y2="35" stroke="#FBBF24" strokeWidth="2" />
  </svg>
);

const Jaapi = () => (
  <svg viewBox="0 0 100 100" className="card-object">
    <path d="M10 70 Q50 20 90 70 Z" fill="#C8960C" />
    <path d="M30 70 Q50 30 70 70 Z" fill="#EF4444" />
    <circle cx="50" cy="50" r="5" fill="#FBBF24" />
  </svg>
);

const CARD_POOL = [
  { pairId: 'kopou',   component: <KopouFlower />,       label: 'Kopou' },
  { pairId: 'teacup',  component: <AssamTeaCup />,       label: 'Tea Cup' },
  { pairId: 'lantern', component: <WarmLantern />,       label: 'Diyo' },
  { pairId: 'mountain',component: <MountainLandscape />, label: 'Mountain' },
  { pairId: 'dhol',    component: <Dhol />,              label: 'Bihu Dhol' },
  { pairId: 'jaapi',   component: <Jaapi />,             label: 'Jaapi' },
];

interface CardState {
  id: string;       
  pairId: string;   
  component: React.ReactNode;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
  isWrong: boolean; // For shaking animation
}

type GamePhase = 'intro' | 'playing' | 'complete';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(pairsCount: number): CardState[] {
  const activePool = shuffle([...CARD_POOL]).slice(0, pairsCount);
  const pairs = activePool.flatMap((c) => [
    { id: `${c.pairId}-a`, pairId: c.pairId, component: c.component, label: c.label, isFlipped: false, isMatched: false, isWrong: false },
    { id: `${c.pairId}-b`, pairId: c.pairId, component: c.component, label: c.label, isFlipped: false, isMatched: false, isWrong: false },
  ]);
  return shuffle(pairs);
}

export const MemoryGamePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, incrementScore, incrementGamesPlayed, completeGameActivity } = useAppStore();
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<GamePhase>('intro');
  const [cards, setCards] = useState<CardState[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const [difficulty, setDifficulty] = useState(1);
  const [totalPairs, setTotalPairs] = useState(4);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    const diff = DatabaseService.getDifficulty(currentUser?.id || 'demo', 'MEMORY');
    setDifficulty(diff);
  }, [currentUser]);

  // ── Start game ───────────────────────────────────────────
  const handleStart = useCallback(() => {
    // Diff 1/2 = 3 pairs, Diff 3 = 4 pairs, Diff 4/5 = 6 pairs
    const pairsCount = difficulty <= 2 ? 3 : difficulty === 3 ? 4 : 6;
    setTotalPairs(pairsCount);
    setCards(buildDeck(pairsCount));
    setFlippedIds([]);
    setMatchedPairs(0);
    setAttempts(0);
    setFeedback(null);
    setIsChecking(false);
    setPhase('playing');
    setStartTime(Date.now());
  }, [difficulty]);

  // ── Card click ───────────────────────────────────────────
  const hasCompleted = useRef(false);

  const handleCardClick = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isChecking) return;

    setCards(prev => {
      const card = prev.find(c => c.id === id);
      if (!card || card.isFlipped || card.isMatched) return prev;
      return prev.map(c => c.id === id ? { ...c, isFlipped: true, isWrong: false } : c);
    });

    setFlippedIds(prev => {
      const next = [...prev, id];

      if (next.length === 2) {
        setAttempts(a => a + 1);
        setIsChecking(true);

        // Check match after slight delay to allow flip animation
        setTimeout(() => {
          setCards(currentCards => {
            const [aId, bId] = next;
            const a = currentCards.find(c => c.id === aId);
            const b = currentCards.find(c => c.id === bId);

            if (!a || !b) return currentCards;

            if (a.pairId === b.pairId) {
              // Match!
              setFeedback('correct');
              setTimeout(() => setFeedback(null), 1200); // Wait for match particles
              const updated = currentCards.map(c =>
                c.id === aId || c.id === bId ? { ...c, isMatched: true, isFlipped: true } : c
              );
              const newMatched = updated.filter(c => c.isMatched).length / 2;
              setMatchedPairs(newMatched);
              incrementScore(15);

              if (newMatched === totalPairs) {
                if (!hasCompleted.current) {
                  hasCompleted.current = true;
                  const endTime = Date.now();
                  const durationMs = endTime - startTime;
                  const accuracy = Math.round((totalPairs / Math.max(attempts + 1, totalPairs)) * 100);
                  
                  // Real adaptive difficulty update
                  DatabaseService.updateDifficulty(currentUser?.id || 'demo', 'MEMORY', accuracy, durationMs);
                  
                  incrementGamesPlayed();
                }
                setTimeout(() => setPhase('complete'), 1500);
              }
              setIsChecking(false);
              return updated;
            } else {
              // No match — trigger wrong shake state
              setFeedback('wrong');
              
              const markWrong = currentCards.map(c => 
                c.id === aId || c.id === bId ? { ...c, isWrong: true } : c
              );
              
              // Flip back after delay
              setTimeout(() => {
                setFeedback(null);
                setCards(cc => cc.map(c =>
                  c.id === aId || c.id === bId ? { ...c, isFlipped: false, isWrong: false } : c
                ));
                setIsChecking(false);
              }, 1200);
              
              return markWrong;
            }
          });

          setFlippedIds([]);
        }, 500); // 500ms allows the card flip reveal to finish before checking

        return [];
      }

      return next;
    });
  }, [isChecking, incrementScore, incrementGamesPlayed, totalPairs]);

  const handlePlayAgain = () => {
    const newDiff = DatabaseService.getDifficulty(currentUser?.id || 'demo', 'MEMORY');
    setDifficulty(newDiff);
    handleStart(); 
  };

  return (
    <div className="memory-page" id="memory-game-page">
      
      {/* HUD Header */}
      <div className="game-header">
        <div className="game-title-hud">
          Memory Match 
          <span style={{ fontSize: '12px', marginLeft: '10px', color: 'var(--color-tea-green)' }}>
            [LVL {difficulty}]
          </span>
        </div>
        {phase === 'playing' && (
          <div className="game-stats">
            <div>
              <b>{matchedPairs} / {totalPairs}</b>
              <span>Pairs</span>
            </div>
            <div>
              <b>{attempts}</b>
              <span>Attempts</span>
            </div>
          </div>
        )}
      </div>

      {/* Feedback banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            className={`match-feedback match-feedback--${feedback}`}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {feedback === 'correct' ? 'Beautiful match.' : 'Almost! Try another pair.'}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="game-main">
        <AnimatePresence mode="wait">

          {/* ── INTRO ── */}
          {phase === 'intro' && (
            <GameIntro
              title="Memory Match"
              skill="🧠 Memory & Recall"
              description="Can you remember where each memory is hidden? Find all the matching pairs."
              duration="5 MINUTES"
              instructions={[
                "Tap a card to flip it over",
                "Find its matching pair",
                "Match all pairs to complete the level"
              ]}
              onStart={handleStart}
              onCancel={() => navigate('/games')}
            />
          )}

          {/* ── PLAYING ── */}
          {phase === 'playing' && (
            <motion.div
              key="playing"
              className="memory-board-wrapper"
              variants={reduced ? {} : fadeUp}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
            >
              <div className="memory-board" role="grid" aria-label="Memory match game board">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    id={`card-${card.id}`}
                    className={`memory-card ${card.isFlipped || card.isMatched ? 'memory-card--flipped' : ''} ${card.isMatched ? 'memory-card--matched' : ''} ${card.isWrong ? 'memory-card--wrong' : ''}`}
                    onClick={(e) => handleCardClick(card.id, e)}
                    disabled={card.isFlipped || card.isMatched || isChecking}
                    aria-label={card.isFlipped || card.isMatched ? card.label : 'Hidden memory'}
                    aria-pressed={card.isFlipped}
                  >
                    <div className="memory-card-inner">
                      <div className="memory-card-back">
                        {/* NOVA Subtle Symbol */}
                        <svg viewBox="0 0 24 24" className="card-back-symbol">
                          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
                        </svg>
                      </div>
                      <div className="memory-card-front">
                        {card.component}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="memory-board-hint">
                {matchedPairs === 0 ? 'Find the two memories that belong together.' :
                 matchedPairs < totalPairs ? 'Keep going, you are doing wonderfully.' :
                 ''}
              </p>
            </motion.div>
          )}

          {/* ── COMPLETE ── */}
          {phase === 'complete' && (
            <GameResult
              gameName="Memory Match"
              score={15} // Simplified mock
              accuracy={Math.round((totalPairs / Math.max(attempts, totalPairs)) * 100)}
              timeSec={72} // Mock 1m 12s
              insight="Excellent focus today! Your spatial recall was quick and accurate."
              onPlayAgain={handlePlayAgain}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
