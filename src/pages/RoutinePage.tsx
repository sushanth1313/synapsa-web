// ============================================================
// Smarani NER — Daily Routine Page
// Visual routine cards with completion tracking (SIH Integrated)
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
import { ProgressRing } from '../components/ui/UI';
import { Avatar } from '../components/avatar/Avatar';
import { ReminderService, DatabaseService } from '../services';
import { useReducedMotion } from '../hooks';
import { Canvas } from '@react-three/fiber';
import { MemoryGarden3D } from '../components/3d/MemoryGarden3D';
import { staggerContainer, fadeUp, modalVariants, buttonHover } from '../tokens/variants';
import { RoutineModal } from '../components/routine/RoutineModal';
import './RoutinePage.css';

export const RoutinePage: React.FC = () => {
  const navigate = useNavigate();
  const { locale, routineItems, completeRoutineItem, aiState, setAIState, gamesPlayed, totalScore, currentUser, fetchRoutines, showToast } = useAppStore();
  const strings = getStrings(locale);
  const reduced = useReducedMotion();

  const [confirming, setConfirming] = useState<string | null>(null);
  const [completedAnimation, setCompletedAnimation] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const adherence = routineItems.length > 0 
    ? Math.round((routineItems.filter(r => r.completedAt).length / routineItems.length) * 100) 
    : 0;
  const completed = routineItems.filter(r => r.completedAt).length;
  const total = routineItems.length;

  const firstUncompletedId = [...routineItems]
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
    .find(r => !r.completedAt)?.id;

  const handleComplete = (id: string) => {
    setConfirming(id);
  };

  const confirmComplete = (id: string) => {
    completeRoutineItem(id);
    setCompletedAnimation(id);
    setConfirming(null);
    setAIState('success');
    setTimeout(() => {
      setAIState('idle');
      setCompletedAnimation(null);
    }, 1500);
  };

  const typeColor: Record<string, string> = {
    hydration: '#2A6B57',
    medication: '#D97706',
    activity: '#1A365D',
    meal: '#8B5E3C',
  };

  const typeBg: Record<string, string> = {
    hydration: '#E8F5EE',
    medication: '#FEF3E2',
    activity: '#EEF2FF',
    meal: '#F5F0E8',
  };

  return (
    <div className="routine-page" id="routine-page">
      {/* Header */}
      <div className="routine-header">
        <button className="game-back-btn" onClick={() => navigate('/')} aria-label="Go back">
          ← {strings.back}
        </button>
        <h1 className="routine-title">{strings.dailyRoutine}</h1>
        <div className="routine-progress-summary">
          <ProgressRing
            value={adherence}
            size={56}
            strokeWidth={5}
            color="var(--color-tea-green)"
            label={`${completed} of ${total} tasks done`}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-tea-green)' }}>
              {completed}/{total}
            </span>
          </ProgressRing>
        </div>
      </div>

      {/* Avatar greeting */}
      <motion.div 
        className="routine-avatar-section"
        variants={reduced ? {} : fadeUp}
        initial="hidden"
        animate="show"
      >
        <Avatar state={aiState} size="sm" />
        <div className="routine-avatar-msg">
          <p className="routine-avatar-text">
            {completed === 0
              ? 'Let us start your day gently.'
              : completed === total
              ? `You completed everything today! Well done.`
              : `You have ${total - completed} items remaining.`}
          </p>
        </div>
      </motion.div>

      {/* Overall progress bar */}
      <motion.div 
        className="routine-progress-bar-wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="routine-progress-track">
          <motion.div
            className="routine-progress-fill"
            initial={{ width: '0%' }}
            animate={{ width: `${adherence}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          />
        </div>
        <span className="routine-progress-label">{Math.round(adherence)}%</span>
      </motion.div>

      {/* Visual 3D Journey */}
      {!reduced && (
        <motion.div 
          className="routine-journey-container" 
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ height: '240px', width: '100%', marginBottom: '2rem', position: 'relative' }}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ alpha: true }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={1} color="#fdfbf7" />
            <MemoryGarden3D gamesPlayed={gamesPlayed} score={totalScore} routineAdherence={adherence} />
          </Canvas>
        </motion.div>
      )}

      {/* Routine list grouped by time of day */}
      <motion.div 
        className="routine-list-container"
        variants={reduced ? {} : staggerContainer}
        initial="hidden"
        animate="show"
      >
        <div className="routine-actions-top">
          <button className="void-btn void-btn--primary" onClick={() => setIsModalOpen(true)}>
            <span>+ Add Routine</span><i></i>
          </button>
        </div>

        {['Morning', 'Afternoon', 'Evening'].map((period) => {
          const itemsInPeriod = routineItems.filter(item => {
            const hour = parseInt(item.scheduledTime.split(':')[0], 10);
            if (period === 'Morning') return hour < 12;
            if (period === 'Afternoon') return hour >= 12 && hour < 17;
            return hour >= 17;
          });

          if (itemsInPeriod.length === 0) return null;

          return (
            <div key={period} className="routine-period-group">
              <h3 className="routine-period-title">{period}</h3>
              <div className="routine-list">
                {itemsInPeriod.map((item) => {
                  const color = typeColor[item.type] ?? '#1B4D3E';
                  const bg = typeBg[item.type] ?? '#E8F5EE';
                  const isNextUp = item.id === firstUncompletedId;
                  return (
                    <motion.div
                      key={item.id}
                      id={`routine-item-${item.id}`}
                      className={`routine-card ${item.completedAt ? 'routine-card--done' : ''}`}
                      style={{ '--routine-color': color, '--routine-bg': bg } as React.CSSProperties}
                      variants={reduced ? {} : fadeUp}
                    >
                      {/* Left: icon */}
                      <div className="routine-card-icon-wrap">
                        <span className="routine-card-icon">{item.icon || '📌'}</span>
                        {item.completedAt && (
                          <motion.div
                            className="routine-card-check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                          >
                            ✓
                          </motion.div>
                        )}
                      </div>

                      {/* Center: info */}
                      <div className="routine-card-info">
                        <div className="routine-card-header">
                          <span className="routine-card-label">
                            {item.title}
                          </span>
                          {isNextUp && (
                            <span className="routine-next-badge">NEXT UP</span>
                          )}
                        </div>
                        <span className="routine-card-time" style={{ textTransform: 'capitalize' }}>
                          {item.scheduledTime} • {item.type}
                        </span>
                        <span className={`routine-card-status ${item.completedAt ? 'routine-card-status--done' : ''}`}>
                          {item.completedAt ? '✓ Completed' : 'Pending'}
                        </span>
                      </div>

                      {/* Right: action */}
                      {!item.completedAt && (
                        <motion.button
                          className="routine-complete-btn"
                          onClick={() => handleComplete(item.id)}
                          aria-label={`Mark ${item.label} as done`}
                          whileHover={reduced ? {} : buttonHover.hover}
                          whileTap={reduced ? {} : buttonHover.tap}
                        >
                          ✓ {strings.done}
                        </motion.button>
                      )}

                      {item.completedAt && (
                        <motion.div
                          className="routine-done-badge"
                          initial={completedAnimation === item.id ? { scale: 0, rotate: -10 } : { scale: 1 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          ✅
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Completion message */}
      <AnimatePresence>
        {completed === total && (
          <motion.div
            className="routine-complete-banner"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            <span className="routine-complete-icon">🌟</span>
            <div>
              <p className="routine-complete-title">Excellent day!</p>
              <p className="routine-complete-sub">You completed all your activities. Well done.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm modal overlay */}
      <AnimatePresence>
        {confirming && (
          <>
            <motion.div className="modal-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirming(null)} />
            <motion.div className="routine-confirm-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <p className="confirm-title">
                {routineItems.find(r => r.id === confirming)?.icon || '📌'}{' '}
                Did you complete this?
              </p>
              <p className="confirm-sub">
                {routineItems.find(r => r.id === confirming)?.title}
              </p>
              <div className="confirm-actions">
                <motion.button 
                  className="confirm-btn confirm-btn--yes" 
                  onClick={() => confirmComplete(confirming!)}
                  whileHover={reduced ? {} : buttonHover.hover}
                  whileTap={reduced ? {} : buttonHover.tap}
                >
                  ✓ Yes, done!
                </motion.button>
                <motion.button 
                  className="confirm-btn confirm-btn--no" 
                  onClick={() => setConfirming(null)}
                  whileHover={reduced ? {} : buttonHover.hover}
                  whileTap={reduced ? {} : buttonHover.tap}
                >
                  Not yet
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <RoutineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(routine) => {
          if (currentUser) {
            DatabaseService.saveRoutine({ ...routine, userId: currentUser.id });
            fetchRoutines();
            setIsModalOpen(false);
            showToast('Routine added!', 'success');
          }
        }}
      />
    </div>
  );
};
