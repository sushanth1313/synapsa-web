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
import { getStrings } from '../i18n';
import './GamesPage.css';

// ... (skipping interface definitions) ...


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

interface GameCategory {
  name: string;
  games: GameDef[];
}

const MEMORY_JOURNEY: GameDef = {
  id: 'MEMORY_JOURNEY',
  route: '/memory-journey',
  title: 'MEMORY JOURNEY',
  skill: 'Signature Experience',
  description: '"A beautiful interactive memory journey through the SYNAPSA world. Observe, remember, and reflect."',
  time: '10 min',
  difficulty: 'Relaxing',
  color: '#D97706',
};

const CATEGORIES: GameCategory[] = [
  {
    name: 'Memory',
    games: [
      { id: 'MEMORY', route: '/memory-game', title: 'PICTURE MEMORY', skill: 'Memory & Recall', description: '"Short, calm exercises to remember familiar pictures."', time: '5 min', difficulty: 'Adaptive', color: '#D97706' },
      { id: 'OBJECT_RECALL', route: '/object-recall', title: 'REMEMBER THE OBJECTS', skill: 'Visual Memory', description: '"Observe everyday objects and recall them at your own pace."', time: '4 min', difficulty: 'Adaptive', color: '#F59E0B' },
      { id: 'WORD_MEMORY', route: '/word-memory', title: 'DAILY EVENT RECALL', skill: 'Verbal Memory', description: '"Remember simple daily events in a relaxed environment."', time: '5 min', difficulty: 'Adaptive', color: '#10B981' },
      { id: 'FACE_MEMORY', route: '/face-memory', title: 'FACE & NAME MEMORY', skill: 'Social Memory', description: '"Remember friendly faces and their names."', time: '6 min', difficulty: 'Adaptive', color: '#3B82F6' },
    ]
  },
  {
    name: 'Attention',
    games: [
      { id: 'PATTERN_MEMORY', route: '/pattern-memory', title: 'VISUAL ATTENTION', skill: 'Spatial Memory', description: '"Gently focus on beautiful visual patterns."', time: '4 min', difficulty: 'Adaptive', color: '#06B6D4' },
      { id: 'VISUAL_PATH', route: '/visual-path', title: 'FOCUS & FOLLOW', skill: 'Spatial Navigation', description: '"Calmly follow a glowing path at your own pace."', time: '5 min', difficulty: 'Adaptive', color: '#3B82F6' },
      { id: 'FIND_CHANGE', route: '/find-change', title: 'FIND THE DIFFERENT OBJECT', skill: 'Visual Attention', description: '"Identify subtle changes in familiar scenes."', time: '5 min', difficulty: 'Adaptive', color: '#8B5CF6' },
      { id: 'SOUND_MEMORY', route: '/sound-memory', title: 'SOUND ATTENTION', skill: 'Auditory Memory', description: '"Listen to soothing, familiar sounds."', time: '4 min', difficulty: 'Adaptive', color: '#F43F5E' },
    ]
  },
  {
    name: 'Recognition',
    games: [
      { id: 'ODD_ONE_OUT', route: '/odd-one-out', title: 'FAMILIAR OBJECT RECOGNITION', skill: 'Pattern Recognition', description: '"Find the object that stands out in a calm setting."', time: '3 min', difficulty: 'Adaptive', color: '#EC4899' },
      { id: 'PATTERN', route: '/pattern-game', title: 'PATTERN MATCHING', skill: 'Focus & Observation', description: '"Match gentle, familiar sequences."', time: '5 min', difficulty: 'Adaptive', color: '#2A6B57' },
      { id: 'CATEGORY_SORT', route: '/category-sort', title: 'PICTURE MATCHING', skill: 'Categorization', description: '"Sort familiar pictures into groups (e.g., Household, Nature)."', time: '5 min', difficulty: 'Adaptive', color: '#14B8A6' },
    ]
  },
  {
    name: 'Daily Recall',
    games: [
      { id: 'SEQUENCE_ORDER', route: '/sequence-order', title: 'WHAT COMES NEXT?', skill: 'Sequential Recall', description: '"Arrange simple daily activities in order."', time: '4 min', difficulty: 'Adaptive', color: '#059669' },
      { id: 'ROUTINE_ORDER', route: '/routine-order', title: 'REMEMBER TODAY\'S ACTIVITIES', skill: 'Practical Memory', description: '"Place familiar daily activities in a gentle chronological order."', time: '4 min', difficulty: 'Adaptive', color: '#84CC16' },
      { id: 'NUMBER_MEMORY', route: '/number-memory', title: 'WHAT DID I DO THIS MORNING?', skill: 'Working Memory', description: '"Recall recent gentle activities from your day."', time: '3 min', difficulty: 'Adaptive', color: '#6366F1' },
    ]
  },
  {
    name: 'Emotional / Social',
    games: [
       { id: 'MOOD_CHECK', route: '/mood-check', title: 'MOOD CHECK', skill: 'Emotional Wellness', description: '"A simple check-in on how you are feeling today."', time: '2 min', difficulty: 'Relaxing', color: '#F43F5E' },
       { id: 'FAMILY_CONNECT', route: '/family-connect', title: 'FAMILY CONNECTION', skill: 'Social Wellness', description: '"Look at photos and messages from family members."', time: '10 min', difficulty: 'Relaxing', color: '#3B82F6' },
    ]
  }
];

export const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { currentUser, locale } = useAppStore();
  const strings = getStrings(locale);

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
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                navigate(game.route); 
              }}
              aria-label={`Play ${game.title}`}
            >
              <span>[ {strings.play || 'PLAY'} ]</span>
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
          ← {strings.home || 'Home'}
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
        <div style={{ display: 'inline-block', color: 'var(--color-tea-green)', border: '1px solid var(--color-tea-green)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
          Adaptive Cognitive Training - Personalized Difficulty
        </div>
        <motion.h1 className="h-hero games-title" variants={reduced ? {} : fadeUp}>
          Cognitive Care
        </motion.h1>
        <motion.p className="body-lg games-subtitle" variants={reduced ? {} : fadeUp}>
          Short, calm activities designed to help you stay mentally active, remember daily routines, and remain connected.
        </motion.p>
      </motion.div>

      <motion.div
        className="games-sections"
        variants={reduced ? {} : staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Featured Game */}
        <motion.div
          className="featured-game-card"
          variants={reduced ? {} : fadeUp}
          whileHover={reduced ? {} : { y: -4 }}
          onClick={() => navigate(MEMORY_JOURNEY.route)}
        >
          <div className="featured-label">Featured Experience</div>
          <h2 className="featured-title">{MEMORY_JOURNEY.title}</h2>
          <p className="featured-desc">{MEMORY_JOURNEY.description}</p>
          <button 
            className="featured-play-btn"
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation(); 
              navigate(MEMORY_JOURNEY.route); 
            }}
          >
            Begin Journey
          </button>
        </motion.div>

        {CATEGORIES.map(category => (
          <div key={category.name} className="games-category">
            <motion.h3 variants={reduced ? {} : fadeUp}>{category.name}</motion.h3>
            <div className="games-grid">
              {category.games.map(renderGameCard)}
            </div>
          </div>
        ))}

      </motion.div>
    </div>
  );
};
