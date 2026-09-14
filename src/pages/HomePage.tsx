import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { getStrings, getGreeting } from '../i18n';
import { AIService, VoiceService, DatabaseService } from '../services';
import { useReducedMotion } from '../hooks';
import { cinematicText, staggerContainer } from '../tokens/variants';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { locale, setAIState, setLastSpeech, routineItems, currentUser } = useAppStore();
  const strings = getStrings(locale);
  const reduced = useReducedMotion();

  const [greetDone, setGreetDone] = useState(false);

  // Time-based greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const userName = currentUser?.name || 'Explorer';

  useEffect(() => {
    // Layout override
    document.body.setAttribute('data-layout-hero', 'b');
    return () => {
      document.body.removeAttribute('data-layout-hero');
    }
  }, []);

  useEffect(() => {
    const greetUser = async () => {
      if (greetDone) return;
      setAIState('thinking');
      await new Promise(r => setTimeout(r, 800));
      const greetText = activities.length === 0
        ? `Welcome to Synapsa, ${userName}. Here's your recommended starting point.`
        : `Hey ${userName}, how is your focus today?`;
      setLastSpeech(greetText);
      setAIState('speaking');
      VoiceService.speak(greetText);
      await new Promise(r => setTimeout(r, 4000));
      setAIState('idle');
      setGreetDone(true);
    };

    greetUser();
    return () => VoiceService.stopSpeaking();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate real stats
  const activities = currentUser ? (DatabaseService.getActivities(currentUser.id) || []) : [];
  
  const safeRoutineItems = routineItems || [];
  const todayRoutines = safeRoutineItems.filter(r => r.repeat === 'daily');
  const completedRoutines = todayRoutines.filter(r => r.completedAt).length;
  
  // Progress could be based on routines, but let's make it a mix of routines and activity
  // If no routines exist, let's base it on whether they played a game today.
  const playedToday = activities.length > 0;
  let routineProgress = 0;
  if (todayRoutines.length > 0) {
    routineProgress = Math.round((completedRoutines / todayRoutines.length) * 100);
  } else {
    routineProgress = playedToday ? 100 : 0;
  }

  // Today's Routine summary
  const todayRoutine = safeRoutineItems
    .filter(r => r.repeat === 'daily')
    .sort((a, b) => {
      if (a.completedAt && !b.completedAt) return 1;
      if (!a.completedAt && b.completedAt) return -1;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    })
    .slice(0, 3);

  const emptyState = activities.length === 0;

  return (
    <div className="hero" id="home-page">
      <motion.div 
        className="hero-content"
        variants={reduced ? {} : staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* 1. GREETING */}
        <motion.div className="home-greeting" variants={reduced ? {} : cinematicText}>
          <h1>{timeGreeting}, {userName} 👋</h1>
          <p>Ready for today's journey?</p>
          <span className="home-greeting-sub">Your AI companion for cognitive focus and routines.</span>
        </motion.div>

        {/* 2. TODAY'S FOCUS (Progress Bar Layout) */}
        <motion.div className="home-focus-panel" variants={reduced ? {} : cinematicText}>
          <div className="focus-header">
            <h3>Today's Focus</h3>
            <span>{routineProgress}% Completed</span>
          </div>
          <div className="focus-progress-track">
            <motion.div 
              className="focus-progress-fill" 
              initial={{ width: 0 }} 
              animate={{ width: `${routineProgress}%` }} 
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }} 
            />
          </div>
          <div className="focus-stats">
            <span>Level {currentUser?.level || 1}</span>
            <span>⭐ {currentUser?.xp || 0} XP</span>
            <span>🔥 {currentUser?.currentStreak || 0} Day Streak</span>
          </div>
        </motion.div>

        {/* 3. AI COMPANION */}
        <motion.div className="home-ai-block" variants={reduced ? {} : cinematicText}>
          <div className="ai-block-header">
            <span className="ai-dot"></span>
            NOVA
          </div>
          <p className="ai-block-msg">
            {emptyState 
              ? "\"Welcome to Synapsa. Here's your recommended starting point.\""
              : "\"Based on your recent activity, I've prepared a short focus challenge for you.\""}
          </p>
          <div className="ai-block-actions">
            <button className="void-btn void-btn--primary" onClick={() => navigate('/focus-flow')}>
              <span>Start Recommended Activity</span><i></i>
            </button>
            <button className="void-btn void-btn--secondary" onClick={() => navigate('/companion')}>
              <span>Talk to NOVA</span><i></i>
            </button>
          </div>
        </motion.div>
        
        {/* 5. TODAY'S ROUTINE */}
        <motion.div className="home-routine-block" variants={reduced ? {} : cinematicText}>
          <div className="home-section-header">
            <h3>Today's Routine</h3>
            <button className="text-link" onClick={() => navigate('/routine')}>View Routine →</button>
          </div>
          <div className="home-routine-list">
            {todayRoutine.length > 0 ? (
              todayRoutine.map(item => (
                <div key={item.id} className={`home-routine-item ${item.completedAt ? 'completed' : ''}`}>
                  <span className="routine-icon">{item.completedAt ? '✓' : '○'}</span>
                  <span className="routine-text">{item.title}</span>
                  <span className="routine-time" style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: '18px' }}>
                    {item.scheduledTime}
                  </span>
                </div>
              ))
            ) : (
              <div className="home-routine-item">
                <span className="routine-icon">○</span>
                <span className="routine-text" style={{ color: 'var(--muted)' }}>No routines scheduled for today.</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* 6. RECENT ACHIEVEMENTS */}
        {currentUser && (currentUser.achievements || []).length > 0 && (
          <motion.div className="home-routine-block" variants={reduced ? {} : cinematicText} style={{ marginTop: '32px' }}>
            <div className="home-section-header">
              <h3>Recent Achievement</h3>
              <button className="text-link" onClick={() => navigate('/progress')}>View All →</button>
            </div>
            <div className="home-routine-list">
              <div className="home-routine-item completed">
                <span className="routine-icon">🏆</span>
                <span className="routine-text">You unlocked a new achievement recently! Keep it up.</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
