import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
import { AnalyticsService } from '../services';
import './MoodCheckPage.css';

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: '#10B981', desc: 'Feeling good and positive' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: '#3B82F6', desc: 'Relaxed and peaceful' },
  { id: 'anxious', emoji: '😟', label: 'Anxious', color: '#F59E0B', desc: 'A bit worried or nervous' },
  { id: 'sad', emoji: '😔', label: 'Sad', color: '#6366F1', desc: 'Feeling down today' },
  { id: 'tired', emoji: '🥱', label: 'Tired', color: '#8B5CF6', desc: 'Lacking energy' },
  { id: 'pain', emoji: '🤕', label: 'In Pain', color: '#EF4444', desc: 'Physical discomfort' },
];

export const MoodCheckPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, locale } = useAppStore();
  const strings = getStrings(locale);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    setTimeout(() => {
      AnalyticsService.recordGameResult({
        gameType: 'PATTERN', // Mock
        level: 1,
        score: 100,
        totalQuestions: 1,
        correctAnswers: 1,
        avgResponseTimeMs: 1000,
        timestamp: Date.now(),
      });
      setSubmitted(true);
      setTimeout(() => navigate('/games'), 2500);
    }, 1000);
  };

  const activeColor = selectedMood ? MOODS.find(m => m.id === selectedMood)?.color : '#F43F5E';

  return (
    <div className="mood-check-page">
      {/* Ambient color overlay that reacts to mood selection */}
      <div
        className="mood-ambient-bg"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 30%, ${activeColor}22 0%, transparent 70%)`,
          transition: 'background 0.8s ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="mood-content">
        <div className="game-header-top">
          <button className="game-back-btn" onClick={() => navigate('/games')}>← {strings.back || 'Back'}</button>
        </div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div 
              key="selection"
              className="mood-selection-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="mood-title">How are you feeling today?</h1>
              <p className="mood-subtitle">Your feelings are important. Let us know how you are doing.</p>
              
              <div className="mood-grid">
                {MOODS.map(mood => (
                  <button
                    key={mood.id}
                    className={`mood-card ${selectedMood === mood.id ? 'selected' : ''}`}
                    onClick={() => handleMoodSelect(mood.id)}
                    style={{ '--mood-color': mood.color } as React.CSSProperties}
                  >
                    <span className="mood-emoji">{mood.emoji}</span>
                    <span className="mood-label">{mood.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              className="mood-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="success-icon">💖</div>
              <h2>Thank you for sharing</h2>
              <p>We have noted your feeling for today. Returning to activities...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
