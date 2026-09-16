// ============================================================
// SYNAPSA — Progress Page
// Visualizes stats, streak, accuracy, and AI insights.
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import { DatabaseService, ACHIEVEMENTS } from '../services';
import { staggerContainer, fadeUp } from '../tokens/variants';
import { getStrings } from '../i18n';
import './ProgressPage.css';

export const ProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { currentUser, locale } = useAppStore();
  const strings = getStrings(locale);

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
    sessions: activities.length,
    accuracy: hasData ? Math.round(activities.reduce((sum, a) => sum + a.accuracy, 0) / activities.length) : 0,
    streak: currentUser?.currentStreak || 0,
    score: currentUser?.totalScore || 0
  };

  // Generate simulated chart data for 6 time points
  const points = 6;
  
  const memoryActs = activities.filter(a => a.gameId === 'MEMORY' || a.gameId.includes('MEMORY'));
  const attentionActs = activities.filter(a => a.gameId === 'ATTENTION' || a.gameId === 'REACTION_RUSH' || a.gameId.includes('ATTENTION'));
  const reactionActs = activities.filter(a => a.gameId === 'RECOGNITION' || a.gameId === 'DAILY_RECALL' || a.gameId.includes('RECOGNITION'));

  // Calculate real data if we have at least 2 points, otherwise fall back to sample
  const getChartData = (acts: typeof activities, sample: number[]) => {
    if (acts.length >= 2) {
      // Get up to last 6 points
      const recent = acts.slice(-6).map(a => a.accuracy);
      // Pad to 6 points if needed to fit chart visually, or just return them
      return recent;
    }
    return sample;
  };

  const isSample = memoryActs.length < 2 && attentionActs.length < 2 && reactionActs.length < 2;

  const memoryData = getChartData(memoryActs, [40, 45, 55, 60, 75, 85]);
  const attentionData = getChartData(attentionActs, [50, 48, 60, 70, 72, 80]);
  const reactionData = getChartData(reactionActs, [30, 40, 50, 65, 70, 88]);

  
  const generatePath = (data: number[]) => {
    const w = 800;
    const h = 300;
    const step = w / (points - 1);
    
    return data.map((val, i) => {
      const x = i * step;
      const y = h - (val / 100) * h;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="progress-page" id="progress-page">
      
      <div className="progress-header">
        <button className="game-back-btn" onClick={() => navigate('/')} aria-label="Go home">
          ← {strings.home}
        </button>
        <div className="progress-header-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="dot"></div>
            {strings.cognitive_analytics}
          </div>
        </div>
      </div>

      <motion.div
        className="progress-content"
        variants={reduced ? {} : staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.h1 className="h-hero progress-title" variants={reduced ? {} : fadeUp}>
          {strings.progress_overview}
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
              <span className="metric-label">{strings.sessions}</span>
              <span className="metric-value">{stats.sessions}</span>
            </div>
            <div className="progress-metric-card">
              <span className="metric-label">{strings.avg_accuracy}</span>
              <span className="metric-value">{stats.accuracy}%</span>
            </div>
            <div className="progress-metric-card">
              <span className="metric-label">{strings.total_score}</span>
              <span className="metric-value">{stats.score.toLocaleString()}</span>
            </div>
            <div className="progress-metric-card streak-card">
              <span className="metric-label">{strings.current_streak}</span>
              <span className="metric-value">🔥 {stats.streak} {strings.days}</span>
            </div>
          </motion.div>
        )}

        {!hasData && !isLoading ? (
          <motion.div className="progress-insight-section" variants={reduced ? {} : fadeUp} style={{ marginTop: '32px' }}>
            <div className="insight-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <p className="insight-text" style={{ fontSize: '24px', color: 'var(--muted)' }}>
                {strings.play_some_activities}
              </p>
              <button className="game-play-btn" onClick={() => navigate('/games')} style={{ marginTop: '24px' }}>
                <span>{strings.explore_activities}</span>
              </button>
            </div>
          </motion.div>
        ) : isLoading ? (
           <div className="progress-chart-section" style={{ marginTop: '32px' }}>
              <div className="skeleton-pulse" style={{ height: '24px', width: '150px', marginBottom: '24px', borderRadius: '4px' }}></div>
              <div className="chart-container" style={{ height: '300px' }}>
                 <div className="skeleton-pulse" style={{ width: '100%', height: '100%', borderRadius: '4px' }}></div>
              </div>
           </div>
        ) : (
          <>
            {/* TIME SERIES CHART */}
            <motion.div className="progress-chart-section" variants={reduced ? {} : fadeUp}>
              <h3 className="section-title">
                {strings.cognitive_progression} 
                {isSample && <span style={{ fontSize: '12px', marginLeft: '12px', backgroundColor: 'var(--color-amber)', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{strings.sample_data}</span>}
              </h3>
              <div className="chart-container">
                <svg viewBox="0 0 800 300" className="svg-chart">
                  {/* Grid Lines */}
                  <line x1="0" y1="300" x2="800" y2="300" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                  <line x1="0" y1="150" x2="800" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="0" y1="0" x2="800" y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="5,5" />
                  
                  {/* Lines */}
                  <motion.path 
                    d={generatePath(memoryData)} 
                    className="chart-line memory"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                  <motion.path 
                    d={generatePath(attentionData)} 
                    className="chart-line attention"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
                  />
                  <motion.path 
                    d={generatePath(reactionData)} 
                    className="chart-line reaction"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
                  />

                  {/* Points */}
                  {memoryData.map((val, i) => (
                    <motion.circle key={`m-${i}`} cx={i * (800/5)} cy={300 - (val/100)*300} r="6" className="chart-point memory" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5 + (i * 0.1) }} />
                  ))}
                  {attentionData.map((val, i) => (
                    <motion.circle key={`a-${i}`} cx={i * (800/5)} cy={300 - (val/100)*300} r="6" className="chart-point attention" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.7 + (i * 0.1) }} />
                  ))}
                  {reactionData.map((val, i) => (
                    <motion.circle key={`r-${i}`} cx={i * (800/5)} cy={300 - (val/100)*300} r="6" className="chart-point reaction" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.9 + (i * 0.1) }} />
                  ))}
                </svg>

                <div className="chart-legend">
                  <div className="legend-item"><div className="legend-color" style={{ background: '#3B82F6' }}></div> {strings.memory_and_recall}</div>
                  <div className="legend-item"><div className="legend-color" style={{ background: '#10B981' }}></div> {strings.attention_and_focus}</div>
                  <div className="legend-item"><div className="legend-color" style={{ background: '#F59E0B' }}></div> {strings.logic_and_reaction}</div>
                </div>
              </div>
            </motion.div>

            {/* AI INSIGHTS */}
            <motion.div className="progress-insight-section" variants={reduced ? {} : fadeUp}>
              <div className="insight-card">
                <div className="insight-header">
                  <span className="ai-dot"></span>
                  {strings.nova_insight}
                </div>
                <p className="insight-text">
                  "Incredible progress, {userName}! Your Memory & Recall score has improved by 45% since your baseline assessment. Keep challenging yourself with the Memory Journey!"
                </p>
              </div>
            </motion.div>
            
            {/* ACHIEVEMENTS */}
            <motion.div className="progress-achievements-section" variants={reduced ? {} : fadeUp} style={{ marginTop: '48px' }}>
              <h3 className="section-title">{strings.unlocked_trophies}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {Object.values(ACHIEVEMENTS).map((ach) => {
                  const isUnlocked = (currentUser?.achievements || []).includes(ach.id);
                  return (
                    <div key={ach.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '24px',
                      background: isUnlocked ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                      border: isUnlocked ? '1px solid rgba(255, 255, 255, 0.1)' : '1px dashed rgba(255, 255, 255, 0.05)',
                      borderRadius: '24px',
                      opacity: isUnlocked ? 1 : 0.4,
                      transition: 'all 0.3s'
                    }}>
                      <div style={{ fontSize: '40px', filter: isUnlocked ? 'none' : 'grayscale(100%)' }}>
                        {ach.icon}
                      </div>
                      <div>
                        <h4 style={{ color: 'var(--bone)', margin: '0 0 8px 0', fontSize: '18px', fontWeight: 500 }}>
                          {ach.title}
                        </h4>
                        <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14px', lineHeight: 1.4 }}>
                          {ach.desc}
                        </p>
                      </div>
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
