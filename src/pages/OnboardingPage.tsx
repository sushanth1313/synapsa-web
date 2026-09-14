import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { DatabaseService } from '../services';
import { fadeUp, staggerContainer } from '../tokens/variants';
import type { RoutineItem } from '../types';
import './OnboardingPage.css';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const [step, setStep] = useState(0);

  // Questionnaire state
  const [goal, setGoal] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [focusArea, setFocusArea] = useState<string>('');

  useEffect(() => {
    document.body.setAttribute('data-hide-nav', 'true');
    return () => {
      document.body.removeAttribute('data-hide-nav');
    }
  }, []);

  const generateRoutines = () => {
    if (!currentUser) return;
    
    const routines: Omit<RoutineItem, 'id'>[] = [];
    const baseTime = 8; // 8 AM

    // Basic common routine
    routines.push({ userId: currentUser.id, title: 'Morning Hydration', type: 'hydration', icon: '💧', scheduledTime: '08:00', repeat: 'daily', reminderEnabled: true });

    // Focus area routine
    if (focusArea === 'Memory') {
      routines.push({ userId: currentUser.id, title: 'Memory Challenge', type: 'activity', icon: '🧠', scheduledTime: '09:00', repeat: 'daily', reminderEnabled: true });
    } else if (focusArea === 'Quantitative Aptitude') {
      routines.push({ userId: currentUser.id, title: 'Quantitative Practice', type: 'activity', icon: '📊', scheduledTime: '09:00', repeat: 'daily', reminderEnabled: true });
    } else {
      routines.push({ userId: currentUser.id, title: 'Focus Challenge', type: 'activity', icon: '🎯', scheduledTime: '09:00', repeat: 'daily', reminderEnabled: true });
    }

    // Goal routine
    if (goal === 'Placement preparation') {
      routines.push({ userId: currentUser.id, title: 'Mock Test Section', type: 'activity', icon: '📝', scheduledTime: '17:00', repeat: 'daily', reminderEnabled: true });
    }

    // Save all
    routines.forEach(r => DatabaseService.saveRoutine(r));

    // Exit onboarding
    navigate('/');
    document.body.removeAttribute('data-hide-nav');
  };

  const steps = [
    {
      id: 'welcome',
      title: `Welcome, ${currentUser?.name || 'Explorer'}`,
      desc: "Let's personalize your experience. We have a few quick questions.",
      actionText: "CONTINUE →",
      onAction: () => setStep(1)
    },
    {
      id: 'goal',
      title: "What is your goal?",
      desc: "Select the primary reason you are here.",
      options: ['Placement preparation', 'Competitive exams', 'Improve cognitive skills', 'General aptitude'],
      value: goal,
      setValue: setGoal,
      actionText: "NEXT →",
      onAction: () => setStep(2)
    },
    {
      id: 'time',
      title: "How much time can you spend each day?",
      desc: "We will build your routine around this.",
      options: ['10 minutes', '20 minutes', '30 minutes'],
      value: time,
      setValue: setTime,
      actionText: "NEXT →",
      onAction: () => setStep(3)
    },
    {
      id: 'focus',
      title: "What do you want to improve?",
      desc: "Pick your primary focus area.",
      options: ['Quantitative Aptitude', 'Logical reasoning', 'Memory', 'Focus', 'Speed'],
      value: focusArea,
      setValue: setFocusArea,
      actionText: "BUILD MY ROUTINE →",
      onAction: generateRoutines
    }
  ];

  const currentStep = steps[step];
  const progressText = step > 0 ? `${step} / 3` : null;

  return (
    <div className="onboarding-page">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep.id}
          className="onboarding-content"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
        >
          {progressText && (
            <motion.div className="onboarding-progress" variants={fadeUp}>
              {progressText}
            </motion.div>
          )}

          <motion.h1 variants={fadeUp} className="onboarding-title">
            {currentStep.title}
          </motion.h1>
          
          <motion.p variants={fadeUp} className="onboarding-desc">
            {currentStep.desc}
          </motion.p>

          {currentStep.options && (
            <motion.div variants={fadeUp} className="onboarding-options">
              {currentStep.options.map(opt => (
                <button
                  key={opt}
                  className={`onboarding-option-btn ${currentStep.value === opt ? 'active' : ''}`}
                  onClick={() => currentStep.setValue && currentStep.setValue(opt)}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          )}
          
          <motion.div variants={fadeUp} className="onboarding-actions">
            <button 
              className="void-btn void-btn--primary" 
              onClick={currentStep.onAction}
              disabled={currentStep.options && !currentStep.value}
            >
              <span>{currentStep.actionText}</span><i></i>
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
