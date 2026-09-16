import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
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
        ? `Welcome to Synapsa, ${userName}. Let's keep your mind active today.`
        : `Hello ${userName}, ready for your cognitive exercises today?`;
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
        <motion.div className="home-greeting" variants={reduced ? {} : cinematicText} style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-tea-green)', background: 'rgba(21, 60, 45, 0.3)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(21, 60, 45, 0.6)' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-tea-green)' }}></span> {strings.offline_ready}
          </div>
          <h1>{timeGreeting}, {userName} 👋</h1>
          <p>Ready for today's activities?</p>
          <span className="home-greeting-sub">Your AI companion for cognitive care and daily routines.</span>
        </motion.div>

        {/* 2. TODAY'S FOCUS (Progress Bar Layout) */}
        <motion.div className="home-focus-panel" variants={reduced ? {} : cinematicText}>
          <div className="focus-header">
            <h3>{strings.todays_focus}</h3>
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
              ? `"Welcome to Synapsa. I'm here to help you stay mentally active and remember your daily routines."`
              : `"Based on your recent activity, I've prepared a personalized cognitive session for you."`}
          </p>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', color: 'var(--muted)', fontSize: '14px', alignItems: 'center' }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>🔊 Listen</span>
             <span style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>🎤 Speak</span>
          </div>
          <div className="ai-block-actions">
            <button className="void-btn void-btn--primary" onClick={() => navigate('/focus-flow')}>
              <span>{strings.start_activity}</span><i></i>
            </button>
            <button className="void-btn void-btn--secondary" onClick={() => navigate('/companion')}>
              <span>{strings.talk_to_nova}</span><i></i>
            </button>
          </div>
        </motion.div>
        
        {/* 5. TODAY'S ROUTINE */}
        <motion.div className="home-routine-block" variants={reduced ? {} : cinematicText}>
          <div className="home-section-header">
            <h3>{strings.routine}</h3>
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
              <h3>{strings.recent_achievement}</h3>
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
