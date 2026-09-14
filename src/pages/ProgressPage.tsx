// ============================================================
// Smarani NER — Progress Page
// Visualizes stats, streak, accuracy, and AI insights.
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import { DatabaseService, GamificationService, ACHIEVEMENTS } from '../services';
import { staggerContainer, fadeUp } from '../tokens/variants';
import './ProgressPage.css';

export const ProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { currentUser } = useAppStore();

  const userName = currentUser?.name || 'Explorer';
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading to show polished skeleton
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const activities = currentUser ? (DatabaseService.getActivities(currentUser.id) || []) : [];
  
  const hasData = activities.length > 0;

  const stats = {
    sessions: activities.filter(a => a.gameId === 'MEMORY' || a.gameId === 'PATTERN').length,
    accuracy: hasData ? Math.round(activities.reduce((sum, a) => sum + a.accuracy, 0) / activities.length) : 0,
    streak: currentUser?.currentStreak || 0,
    activities: activities.length
  };

  // Generate real chart data (last 7 days of XP/Activities)
  // Simple heuristic: just count activities per day for the last 7 days
  const chartData = [0, 0, 0, 0, 0, 0, 0];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; // We can keep static labels or dynamic
  
  if (hasData) {
    const today = new Date();
    // Dynamically set labels to last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' })[0];
      days[i] = dayStr;
      
      const dayActivities = activities.filter(a => {
        const actDate = new Date(a.timestamp);
        return actDate.toDateString() === d.toDateString();
      });
      // Cap at 100% (say, 5 activities = 100%)
      chartData[i] = Math.min(100, (dayActivities.length / 5) * 100);
    }
  }

  return (
    <div className="progress-page" id="progress-page">
      <div className="progress-header">
        <button className="game-back-btn" onClick={() => navigate('/')} aria-label="Go home">
          ← Home
        </button>
        <div className="progress-header-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="dot"></div>
            YOUR PROGRESS
          </div>
          <button 
            onClick={() => navigate('/settings')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--bone)',
              cursor: 'pointer'
            }}
            aria-label="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      <motion.div
        className="progress-content"
        variants={reduced ? {} : staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.h1 className="h-hero progress-title" variants={reduced ? {} : fadeUp}>
          Progress Overview
        </motion.h1>
        
        {/* TOP METRICS */}
        {isLoading ? (
          <div className="progress-metrics-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="progress-metric-card skeleton-card">
                <div className="skeleton-pulse skeleton-text-sm"></div>
                <div className="skeleton-pulse skeleton-text-lg mt-2"></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div className="progress-metrics-grid" variants={reduced ? {} : fadeUp}>
            <div className="progress-metric-card">
              <span className="metric-label">Game Sessions</span>
              <span className="metric-value">{stats.sessions}</span>
            </div>
            <div className="progress-metric-card">
              <span className="metric-label">Avg. Accuracy</span>
              <span className="metric-value">{stats.accuracy}%</span>
            </div>
            <div className="progress-metric-card">
              <span className="metric-label">Activities Done</span>
              <span className="metric-value">{stats.activities}</span>
            </div>
            <div className="progress-metric-card streak-card">
              <span className="metric-label">Current Streak</span>
              <span className="metric-value">🔥 {stats.streak} Days</span>
            </div>
          </motion.div>
        )}

        {!hasData && !isLoading ? (
          <motion.div className="progress-insight-section" variants={reduced ? {} : fadeUp} style={{ marginTop: '32px' }}>
            <div className="insight-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <p className="insight-text" style={{ fontSize: '24px', color: 'var(--muted)' }}>
                Play some activities to see your progress here!
              </p>
              <button className="void-btn void-btn--primary" onClick={() => navigate('/games')} style={{ marginTop: '24px' }}>
                <span>EXPLORE ACTIVITIES</span><i></i>
              </button>
            </div>
          </motion.div>
        ) : isLoading ? (
           <div className="progress-chart-section" style={{ marginTop: '32px' }}>
              <div className="skeleton-pulse" style={{ height: '24px', width: '150px', marginBottom: '24px', borderRadius: '4px' }}></div>
              <div className="chart-container" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '200px' }}>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                   <div key={i} className="skeleton-pulse" style={{ flex: 1, height: `${Math.random() * 60 + 20}%`, borderRadius: '4px' }}></div>
                ))}
              </div>
           </div>
        ) : (
          <>
            {/* WEEKLY CHART */}
        <motion.div className="progress-chart-section" variants={reduced ? {} : fadeUp}>
          <h3 className="section-title">Weekly Activity</h3>
          <div className="chart-container">
            <div className="chart-bars">
              {chartData.map((val, i) => (
                <div key={i} className="chart-bar-wrap">
                  <div className="chart-bar-bg">
                    <motion.div 
                      className="chart-bar-fill"
                      initial={{ height: 0 }}
                      animate={{ height: `${val}%` }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                    />
                  </div>
                  <span className="chart-day">{days[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* AI INSIGHTS */}
        <motion.div className="progress-insight-section" variants={reduced ? {} : fadeUp}>
          <div className="insight-card">
            <div className="insight-header">
              <span className="ai-dot"></span>
              NOVA Insight
            </div>
            <p className="insight-text">
              "Great start, {userName}! You've completed {stats.activities} activities so far with an average accuracy of {stats.accuracy}%. Keep playing to unlock deeper insights."
            </p>
          </div>
        </motion.div>
        
        {/* ACHIEVEMENTS */}
        <motion.div className="progress-achievements-section" variants={reduced ? {} : fadeUp} style={{ marginTop: '48px' }}>
          <h3 className="section-title">Achievements</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
            {Object.values(ACHIEVEMENTS).map((ach) => {
              const isUnlocked = (currentUser?.achievements || []).includes(ach.id);
              return (
                <div key={ach.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: isUnlocked ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  border: isUnlocked ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  opacity: isUnlocked ? 1 : 0.5,
                  transition: 'all 0.3s'
                }}>
                  <div style={{ fontSize: '32px', filter: isUnlocked ? 'none' : 'grayscale(100%)' }}>
                    {ach.icon}
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--bone)', margin: '0 0 4px 0', fontSize: '18px' }}>
                      {ach.title}
                    </h4>
                    <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14px' }}>
                      {ach.desc}
                    </p>
                  </div>
                  {isUnlocked && (
                    <div style={{ marginLeft: 'auto', color: 'var(--color-tea-green)', fontSize: '24px' }}>
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        </>
        )}

      </motion.div>
    </div>
  );
};
