// ============================================================
// Synapsa — Games Lobby Page
// ============================================================

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import { DatabaseService } from '../services';
import { staggerContainer, fadeUp } from '../tokens/variants';
import './GamesPage.css';

interface GameDef {
  id: string;
  route: string;
  title: string;
  skill: string;
  description: string;
  time: string;
  difficulty: string;
  color: string;
}

const GAMES: GameDef[] = [
  {
    id: 'MEMORY',
    route: '/memory-game',
    title: 'MEMORY MATCH',
    skill: 'Memory & Recall',
    description: '"Train your ability to remember patterns and locations."',
    time: '5 min',
    difficulty: 'Medium',
    color: '#D97706',
  },
  {
    id: 'PATTERN',
    route: '/pattern-game',
    title: 'SEQUENCE MEMORY',
    skill: 'Focus & Observation',
    description: '"Watch the sequence and recreate it perfectly."',
    time: '5 min',
    difficulty: 'Hard',
    color: '#2A6B57',
  },
  {
    id: 'REACTION',
    route: '/reaction-rush',
    title: 'REACTION RUSH',
    skill: 'Reaction & Attention',
    description: '"Test your reaction speed and reflexes under pressure."',
    time: '3 min',
    difficulty: 'Adaptive',
    color: '#0284C7',
  },
  {
    id: 'FOCUS',
    route: '/focus-flow',
    title: 'FOCUS FLOW',
    skill: 'Attention & Focus',
    description: '"Identify moving targets while ignoring distractions."',
    time: '4 min',
    difficulty: 'Adaptive',
    color: '#9333EA',
  }
];

export const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { currentUser } = useAppStore();

  const userActivities = useMemo(() => {
    return currentUser ? (DatabaseService.getActivities(currentUser.id) || []) : [];
  }, [currentUser]);

  const getBestScore = (gameId: string) => {
    const gameActs = userActivities.filter(a => a.gameId === gameId);
    if (gameActs.length === 0) return null;
    return Math.max(...gameActs.map(a => a.score));
  };

  const renderGameCard = (game: GameDef) => {
    const bestScore = getBestScore(game.id);

    return (
      <motion.div
        key={game.id}
        className="game-card"
        variants={reduced ? {} : fadeUp}
        whileHover={reduced ? {} : { y: -6 }}
        onClick={() => navigate(game.route)}
        style={{ '--game-color': game.color } as React.CSSProperties}
      >
        <div className="game-card-body">
          <h2 className="game-card-title">{game.title}</h2>
          <div className="game-card-skill">{game.skill}</div>
          <p className="game-card-desc">{game.description}</p>
          
          <div className="game-card-info">
            <div className="game-info-item">
              <span className="info-icon">⏱</span>
              <span>{game.time}</span>
            </div>
            <div className="game-info-item">
              <span className="info-icon" style={{ color: game.color }}>●</span>
              <span>{game.difficulty}</span>
            </div>
          </div>
          
          <div className="game-card-bottom-bar">
            <div className="game-card-best">
              <span className="best-label">Best:</span>
              <span className="best-value">{bestScore !== null ? bestScore.toLocaleString() : '---'}</span>
            </div>
            
            <button
              className="game-play-btn"
              onClick={(e) => { e.stopPropagation(); navigate(game.route); }}
              aria-label={`Play ${game.title}`}
            >
              <span>[ PLAY ]</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="games-page" id="games-page">
      <div className="games-header">
        <button className="game-back-btn" onClick={() => navigate('/')} aria-label="Go home">
          ← Home
        </button>
        <div className="games-header-eyebrow">
          <div className="dot"></div>
          COGNITIVE ACTIVITIES
        </div>
      </div>

      <motion.div
        className="games-hero"
        variants={reduced ? {} : staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.h1 className="h-hero games-title" variants={reduced ? {} : fadeUp}>
          Memory & Focus
        </motion.h1>
        <motion.p className="body-lg games-subtitle" variants={reduced ? {} : fadeUp}>
          Engaging exercises designed to challenge your cognitive skills and build mental resilience.
        </motion.p>
      </motion.div>

      <motion.div
        className="games-sections"
        variants={reduced ? {} : staggerContainer}
        initial="hidden"
        animate="show"
      >
        <div className="games-grid">
          {GAMES.map(renderGameCard)}
        </div>
      </motion.div>
    </div>
  );
};
