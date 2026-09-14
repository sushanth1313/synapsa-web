import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks';
import { useAppStore } from '../../store';
import { GamificationService, DatabaseService, AuthService } from '../../services';
import { staggerContainer, fadeUp } from '../../tokens/variants';
import './GameResult.css';

interface GameResultProps {
  gameName: string;
  score: number;
  accuracy: number;
  timeSec?: number;
  levelsCompleted?: number;
  insight: string;
  onPlayAgain: () => void;
}

export const GameResult: React.FC<GameResultProps> = ({
  gameName,
  score,
  accuracy,
  timeSec,
  levelsCompleted,
  insight,
  onPlayAgain
}) => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const [xpGained, setXpGained] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [isPersonalBest, setIsPersonalBest] = useState(false);

  const hasAwarded = useRef(false);

  useEffect(() => {
    if (hasAwarded.current) return;
    hasAwarded.current = true;

    // Calculate XP
    let gained = 20; // base
    if (accuracy >= 90) gained += 30; // perfect bonus
    setXpGained(gained);

    const result = GamificationService.addXP(gained);
    if (result) {
      if (result.leveledUp) {
        setLeveledUp(true);
        setNewLevel(result.newLevel);
      }
    }

    // Check personal best and save activity
    const user = AuthService.getCurrentUser();
    if (user) {
      let gameId = gameName.toUpperCase().replace(/\s+/g, '_');
      if (gameName === 'Memory Match') gameId = 'MEMORY';
      if (gameName === 'Sequence Memory') gameId = 'PATTERN';
      if (gameName === 'Reaction Rush') gameId = 'REACTION';
      if (gameName === 'Focus Flow') gameId = 'FOCUS';

      const history = DatabaseService.getActivities(user.id);
      const gameHistory = history.filter(h => h.gameId === gameId);
      if (gameHistory.length > 0) {
        const bestScore = Math.max(...gameHistory.map(h => h.score));
        if (score > bestScore) {
          setIsPersonalBest(true);
        }
      } else {
        setIsPersonalBest(true); // First time is always a personal best
      }
      
      // Save the new history
      DatabaseService.saveActivity({
        id: crypto.randomUUID(),
        userId: user.id,
        gameId,
        score,
        accuracy,
        timeSec: timeSec || 0,
        level: levelsCompleted || 1,
        timestamp: new Date().toISOString()
      });

      GamificationService.updateStreak();

      // Update the currentUser in the store so the app knows about the new XP and Streak
      useAppStore.getState().setCurrentUser(AuthService.getCurrentUser());
    }

  }, [accuracy, score, gameName, timeSec, levelsCompleted]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="game-result-container"
      variants={reduced ? {} : staggerContainer}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
    >
      <div className="game-result-content">
        <motion.div className="gr-header" variants={reduced ? {} : fadeUp}>
          <div className="gr-eyebrow">ACTIVITY COMPLETE</div>
          <h1 className="gr-title">{gameName}</h1>
          {isPersonalBest && (
            <div style={{ color: 'var(--color-amber)', marginTop: '8px', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.1em' }}>
              🏆 NEW PERSONAL BEST
            </div>
          )}
        </motion.div>

        <div className="gr-stats-grid">
          <motion.div className="gr-stat-card" variants={reduced ? {} : fadeUp} style={{ borderColor: 'var(--color-tea-green)', background: 'rgba(42, 107, 87, 0.1)' }}>
            <span className="gr-stat-label" style={{ color: 'var(--color-tea-green)' }}>XP Gained</span>
            <span className="gr-stat-value" style={{ color: 'var(--color-tea-green)' }}>+{xpGained}</span>
          </motion.div>
          <motion.div className="gr-stat-card" variants={reduced ? {} : fadeUp}>
            <span className="gr-stat-label">Score</span>
            <span className="gr-stat-value">{score}</span>
          </motion.div>
          <motion.div className="gr-stat-card" variants={reduced ? {} : fadeUp}>
            <span className="gr-stat-label">Accuracy</span>
            <span className="gr-stat-value">{Math.round(accuracy)}%</span>
          </motion.div>
          {timeSec !== undefined && (
            <motion.div className="gr-stat-card" variants={reduced ? {} : fadeUp}>
              <span className="gr-stat-label">Time</span>
              <span className="gr-stat-value">{formatTime(timeSec)}</span>
            </motion.div>
          )}
          {levelsCompleted !== undefined && (
            <motion.div className="gr-stat-card" variants={reduced ? {} : fadeUp}>
              <span className="gr-stat-label">Levels</span>
              <span className="gr-stat-value">{levelsCompleted}</span>
            </motion.div>
          )}
        </div>

        <motion.div className="gr-insight-card" variants={reduced ? {} : fadeUp}>
          <div className="gr-insight-header">
            <div className="nova-dot-small"></div>
            NOVA INSIGHT
          </div>
          <p className="gr-insight-text">
            {leveledUp 
              ? `"Amazing work! You've reached Level ${newLevel}! ${insight}"` 
              : `"${insight}"`}
          </p>
        </motion.div>

        <motion.div className="gr-actions" variants={reduced ? {} : fadeUp}>
          <button className="void-btn void-btn--primary" onClick={onPlayAgain}>
            <span>PLAY AGAIN</span><i></i>
          </button>
          <button className="void-btn void-btn--secondary" onClick={() => navigate('/games')}>
            <span>MORE ACTIVITIES</span><i></i>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};
