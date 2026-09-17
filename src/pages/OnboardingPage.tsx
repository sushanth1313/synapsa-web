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
  const { currentUser, setCurrentUser } = useAppStore();
  const [step, setStep] = useState(0);

  // Questionnaire state
  const [userMode, setUserMode] = useState<string>('');
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
    
    // Save userMode
    if (userMode) {
      setCurrentUser({ ...currentUser, userMode: userMode as 'patient' | 'caregiver' });
    }

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
      id: 'mode',
      title: "Who is using this app?",
      desc: "Select the mode that fits your profile.",
      options: ['Patient Mode', 'Caregiver Mode'],
      value: userMode,
      setValue: setUserMode,
      actionText: "NEXT →",
      onAction: () => setStep(2)
    },
    {
      id: 'goal',
      title: "What is your primary goal?",
      desc: "Select the main reason you are here.",
      options: ['Remember Things', 'Improve Attention', 'Recognize Patterns', 'Remember Daily Routines', 'Stay Mentally Active', 'Emotional Wellness'],
      value: goal,
      setValue: setGoal,
      actionText: "NEXT →",
      onAction: () => setStep(3)
    },
    {
      id: 'time',
      title: "How much time can you spend each day?",
      desc: "We will build your routine around this.",
      options: ['10 minutes', '20 minutes', '30 minutes'],
      value: time,
      setValue: setTime,
      actionText: "NEXT →",
      onAction: () => setStep(4)
    },
    {
      id: 'focus',
      title: "What do you want to focus on?",
      desc: "Pick your primary activity area.",
      options: ['Memory', 'Attention', 'Recognition', 'Daily Recall', 'Emotional Wellness'],
      value: focusArea,
      setValue: setFocusArea,
      actionText: "BUILD MY ROUTINE →",
      onAction: generateRoutines
    }
  ];

  const currentStep = steps[step];
  const progressText = step > 0 ? `${step} / 4` : null;

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
