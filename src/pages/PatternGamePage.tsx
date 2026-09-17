// ============================================================
// SYNAPSA — Sequence Memory Game
// Watch the sequence. Tap in order. Fully playable.
// ============================================================

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { useReducedMotion } from '../hooks';
import { fadeUp, staggerContainer, cinematicText, scaleIn } from '../tokens/variants';
import { GameResult } from '../components/game/GameResult';
import { GameIntro } from '../components/game/GameIntro';
import './PatternGamePage.css';

// ── Premium Inline SVG Objects ─────────────────────────────

const KopouFlower = () => (
  <svg viewBox="0 0 100 100" className="card-object" width="100%" height="100%">
    <defs>
      <linearGradient id="kopouGradSeq" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#db2777" />
      </linearGradient>
    </defs>
    <path d="M50 20 C60 10, 80 20, 80 40 C80 60, 50 80, 50 80 C50 80, 20 60, 20 40 C20 20, 40 10, 50 20 Z" fill="url(#kopouGradSeq)" />
    <circle cx="50" cy="40" r="8" fill="#fde047" />
    <path d="M50 80 L50 95" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const AssamTeaCup = () => (
  <svg viewBox="0 0 100 100" className="card-object" width="100%" height="100%">
    <defs>
      <linearGradient id="teaGradSeq" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
      <linearGradient id="cupGradSeq" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
    </defs>
    <ellipse cx="50" cy="80" rx="35" ry="10" fill="url(#cupGradSeq)" />
    <path d="M25 40 Q25 75 50 75 Q75 75 75 40 Z" fill="url(#cupGradSeq)" />
    <path d="M70 45 C85 45, 85 65, 70 65" fill="none" stroke="url(#cupGradSeq)" strokeWidth="6" strokeLinecap="round" />
    <ellipse cx="50" cy="40" rx="23" ry="6" fill="url(#teaGradSeq)" />
  </svg>
);

const WarmLantern = () => (
  <svg viewBox="0 0 100 100" className="card-object" width="100%" height="100%">
    <defs>
      <radialGradient id="flameGlowSeq" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#f59e0b" />
      </radialGradient>
      <linearGradient id="clayGradSeq" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="35" r="25" fill="#fef08a" opacity="0.2" filter="blur(8px)" />
    <path d="M20 70 Q50 90 80 70 L70 55 Q50 65 30 55 Z" fill="url(#clayGradSeq)" />
    <path d="M50 20 Q60 40 50 50 Q40 40 50 20 Z" fill="url(#flameGlowSeq)" />
  </svg>
);

const MountainLandscape = () => (
  <svg viewBox="0 0 100 100" className="card-object" width="100%" height="100%">
    <defs>
      <linearGradient id="mountGrad1Seq" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </linearGradient>
      <linearGradient id="mountGrad2Seq" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#172554" />
      </linearGradient>
    </defs>
    <circle cx="70" cy="30" r="12" fill="#fde047" />
    <path d="M10 80 L50 20 L90 80 Z" fill="url(#mountGrad1Seq)" />
    <path d="M-10 90 L30 40 L70 90 Z" fill="url(#mountGrad2Seq)" />
    <rect x="0" y="80" width="100" height="20" fill="#0f172a" />
  </svg>
);

// ── Symbol Pool ──────────────────────────────────────────────
const SYMBOLS = [
  { id: 'kopou',   component: <KopouFlower />,       label: 'Kopou' },
  { id: 'teacup',  component: <AssamTeaCup />,       label: 'Tea Cup' },
  { id: 'lantern', component: <WarmLantern />,       label: 'Diyo' },
  { id: 'mountain',component: <MountainLandscape />, label: 'Mountain' },
];

type Phase = 'intro' | 'showing' | 'input' | 'correct' | 'wrong' | 'complete';
type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG: Record<Difficulty, { startLength: number; maxLength: number; label: string; speed: number }> = {
  easy:   { startLength: 3, maxLength: 5, label: 'Easy',   speed: 1200 },
  medium: { startLength: 4, maxLength: 6, label: 'Medium', speed: 900 },
  hard:   { startLength: 5, maxLength: 7, label: 'Hard',   speed: 700 },
};

function buildSequence(length: number): typeof SYMBOLS {
  const pool = [...SYMBOLS];
  const seq: typeof SYMBOLS = [];
  for (let i = 0; i < length; i++) {
    seq.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return seq;
}

export const PatternGamePage: React.FC = () => {
  const navigate = useNavigate();
  const { incrementScore, incrementGamesPlayed, showToast, completeGameActivity } = useAppStore();
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<Phase>('intro');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [sequence, setSequence] = useState<typeof SYMBOLS>([]);
  const [userTaps, setUserTaps] = useState<string[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const showingRef = useRef(false);

  const config = DIFFICULTY_CONFIG[difficulty];

  // ── Build and show a new sequence ───────────────────────
  const startLevel = useCallback((lvl: number, diff: Difficulty) => {
    const cfg = DIFFICULTY_CONFIG[diff];
    const seqLen = Math.min(cfg.startLength + lvl - 1, cfg.maxLength);
    const seq = buildSequence(seqLen);
    setSequence(seq);
    setUserTaps([]);
    setHighlightIndex(-1);
    setPhase('showing');
    showingRef.current = true;

    // Show each item one by one
    seq.forEach((_, idx) => {
      setTimeout(() => {
        if (!showingRef.current) return;
        setHighlightIndex(idx);
        setTimeout(() => {
          setHighlightIndex(-1);
          if (idx === seq.length - 1) {
            setTimeout(() => {
              if (!showingRef.current) return;
              showingRef.current = false;
              setPhase('input');
            }, 400);
          }
        }, cfg.speed * 0.6);
      }, idx * cfg.speed + 600);
    });
  }, []);

  const handleStart = (diffLevel: number) => {
    // Map difficulty number back to 'easy' | 'medium' | 'hard'
    let diffStr: Difficulty = 'easy';
    if (diffLevel === 3) diffStr = 'medium';
    if (diffLevel === 5) diffStr = 'hard';

    setDifficulty(diffStr);
    setLevel(1);
    setScore(0);
    setLives(3);
    startLevel(1, diffStr);
  };

  const hasCompleted = useRef(false);

  // ── User tap ─────────────────────────────────────────────
  const handleTap = useCallback((symbolId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (phase !== 'input') return;

    const tapIndex = userTaps.length;
    const expected = sequence[tapIndex]?.id;

    const newTaps = [...userTaps, symbolId];
    setUserTaps(newTaps);

    if (symbolId !== expected) {
      // Wrong tap
      setCorrectAnswer(sequence[tapIndex]?.emoji ?? null);
      setPhase('wrong');
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        if (!hasCompleted.current) {
          hasCompleted.current = true;
          incrementGamesPlayed();
        }
        setTimeout(() => setPhase('complete'), 2000);
      } else {
        setTimeout(() => {
          setCorrectAnswer(null);
          startLevel(level, difficulty);
        }, 2200);
      }
      return;
    }

    if (newTaps.length === sequence.length) {
      // Correct sequence complete!
      const points = sequence.length * 5;
      setScore(s => s + points);
      incrementScore(points);
      setPhase('correct');

      const nextLevel = level + 1;
      setLevel(nextLevel);

      if (nextLevel > 8) {
        if (!hasCompleted.current) {
          hasCompleted.current = true;
          incrementGamesPlayed();
        }
        setTimeout(() => setPhase('complete'), 1500);
      } else {
        setTimeout(() => {
          startLevel(nextLevel, difficulty);
        }, 1500);
      }
    }
  }, [phase, userTaps, sequence, lives, level, difficulty, incrementScore, incrementGamesPlayed, startLevel, score]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { showingRef.current = false; };
  }, []);

  const progressPct = sequence.length > 0 ? (userTaps.length / sequence.length) * 100 : 0;

  return (
    <div className="pattern-page" id="pattern-game-page">
      {/* Header */}
      <div className="game-header">
        <button className="game-back-btn" onClick={() => { showingRef.current = false; navigate('/games'); }}>
          ← Games
        </button>
        {phase !== 'intro' && (
          <div className="game-stats">
            <div>
              <b>{level}</b>
              <span>Level</span>
            </div>
            <div>
              <b>{'❤️'.repeat(lives)}</b>
              <span>Lives</span>
            </div>
            <div>
              <b>{score}</b>
              <span>Score</span>
            </div>
          </div>
        )}
      </div>

      <div className="game-main">
        <AnimatePresence mode="wait">

          {/* ── INTRO ── */}
          {phase === 'intro' && (
            <GameIntro
              title="Sequence Memory"
              skill="🌸 Focus & Observation"
              description="Watch the symbols light up one by one. Then tap them in the exact same order."
              duration="5 MINUTES"
              instructions={[
                "Wait for the sequence to finish",
                "Tap the symbols in the same order",
                "The sequence gets longer each round"
              ]}
              onStart={handleStart}
              onCancel={() => navigate('/games')}
            />
          )}

          {/* ── SHOWING SEQUENCE ── */}
          {phase === 'showing' && (
            <motion.div
              key="showing"
              className="seq-game-area"
              variants={reduced ? {} : fadeUp}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
            >
              <div className="seq-instruction">
                <p className="seq-watch-text">Watch carefully…</p>
                <p className="seq-length-hint">{sequence.length} items in this sequence</p>
              </div>

              <div className="seq-display-grid">
                {sequence.map((sym, idx) => (
                  <motion.div
                    key={`${sym.id}-${idx}`}
                    className={`seq-symbol ${highlightIndex === idx ? 'seq-symbol--active' : ''}`}
                    animate={highlightIndex === idx && !reduced
                      ? { scale: 1.25, opacity: 1, boxShadow: '0 0 30px var(--color-amber)' }
                      : { scale: 1, opacity: highlightIndex === -1 ? 0.3 : (highlightIndex > idx ? 0.6 : 0.15) }
                    }
                    transition={{ duration: 0.2 }}
                  >
                    <span className="seq-symbol-emoji" style={{ width: '80px', height: '80px', display: 'block' }}>{sym.component}</span>
                    <span className="seq-symbol-num">{idx + 1}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── INPUT PHASE ── */}
          {phase === 'input' && (
            <motion.div
              key="input"
              className="seq-game-area"
              variants={reduced ? {} : fadeUp}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
            >
              <div className="seq-instruction">
                <p className="seq-watch-text">Your turn — tap in order</p>
                <div className="seq-progress-bar">
                  <motion.div
                    className="seq-progress-fill"
                    animate={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="seq-tap-hint">{userTaps.length} / {sequence.length} tapped</p>
              </div>

              {/* User's tap progress */}
              <div className="seq-user-progress">
                {sequence.map((sym, idx) => (
                  <div
                    key={`progress-${idx}`}
                    className={`seq-progress-dot ${idx < userTaps.length ? 'seq-progress-dot--done' : ''}`}
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Tap grid */}
              <div className="seq-tap-grid">
                {SYMBOLS.map((sym) => (
                  <button
                    key={sym.id}
                    id={`tap-${sym.id}`}
                    className="seq-tap-btn"
                    onClick={(e) => handleTap(sym.id, e)}
                    aria-label={`Tap ${sym.label}`}
                  >
                    <span className="seq-tap-emoji" style={{ width: '80px', height: '80px', display: 'block' }}>{sym.component}</span>
                    <span className="seq-tap-label">{sym.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── CORRECT ── */}
          {phase === 'correct' && (
            <motion.div
              key="correct"
              className="seq-feedback seq-feedback--correct"
              variants={reduced ? {} : scaleIn}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
            >
              <div className="feedback-icon">✅</div>
              <h2 className="h-sec">Correct!</h2>
              <p className="body-lg">Well done. Get ready for the next level…</p>
            </motion.div>
          )}

          {/* ── WRONG ── */}
          {phase === 'wrong' && (
            <motion.div
              key="wrong"
              className="seq-feedback seq-feedback--wrong"
              variants={reduced ? {} : scaleIn}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
            >
              <div className="feedback-icon">💙</div>
              <h2 className="h-sec">Try again</h2>
              {correctAnswer && (
                <p className="body-lg">
                  The next symbol was: <strong>{correctAnswer}</strong>
                </p>
              )}
              <p className="body-lg" style={{ marginTop: '8px' }}>
                {lives > 0 ? `${lives} ${lives === 1 ? 'life' : 'lives'} remaining.` : 'Game over!'}
              </p>
            </motion.div>
          )}

          {/* ── COMPLETE ── */}
          {phase === 'complete' && (
            <GameResult
              gameName="Sequence Memory"
              score={score}
              accuracy={92} // We can calculate real accuracy later if needed
              levelsCompleted={level - 1}
              insight="You've got a great eye for sequences! You consistently remembered up to 5 items today."
              onPlayAgain={() => { setPhase('intro'); setLevel(1); setScore(0); setLives(3); showToast('New game!', 'success'); }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
