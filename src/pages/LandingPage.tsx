import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { cinematicText, staggerContainer } from '../tokens/variants';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  useEffect(() => {
    // Hide bottom nav for landing page
    document.body.setAttribute('data-hide-nav', 'true');
    return () => {
      document.body.removeAttribute('data-hide-nav');
    }
  }, []);

  return (
    <div className="landing-page">
      <motion.div 
        className="landing-content"
        variants={reduced ? {} : staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={reduced ? {} : cinematicText} className="landing-brand">
          <div className="dot"></div>
          SYNAPSA
        </motion.div>
        
        <motion.h1 variants={reduced ? {} : cinematicText} className="landing-title">
          Your AI Cognitive Companion
        </motion.h1>
        
        <motion.p variants={reduced ? {} : cinematicText} className="landing-desc">
          Personalized cognitive activities, intelligent guidance, daily routines, and progress — all in one place.
        </motion.p>
        
        <motion.div variants={reduced ? {} : cinematicText} className="landing-actions">
          <button className="void-btn void-btn--primary" onClick={() => navigate('/signup')}>
            <span>START YOUR JOURNEY →</span><i></i>
          </button>
          <button className="void-btn void-btn--secondary" onClick={() => navigate('/login')}>
            <span>I ALREADY HAVE AN ACCOUNT</span><i></i>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
