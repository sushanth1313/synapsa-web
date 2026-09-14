import type { Variants } from 'framer-motion';
import { motion as motionTokens } from './index';

// ── Page & Layout ───────────────────────────────────────────

export const pageVariants: Variants = {
  initial: { opacity: 0, filter: 'blur(10px)', y: 20 },
  animate: { 
    opacity: 1, 
    filter: 'blur(0px)', 
    y: 0, 
    transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.1 } 
  },
  exit: { 
    opacity: 0, 
    filter: 'blur(10px)', 
    y: -10, 
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } 
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const slowStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

// ── Reveals & Fades ──────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

// ── Cinematic Text Reveals ───────────────────────────────────

export const cinematicText: Variants = {
  hidden: { opacity: 0, y: 32, filter: 'blur(16px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

// ── Interactive Elements ─────────────────────────────────────

export const cardHover = {
  rest: { scale: 1, y: 0, filter: 'brightness(1)' },
  hover: { scale: 1.02, y: -4, filter: 'brightness(1.05)', transition: motionTokens.springGentle },
  tap: { scale: 0.98, y: 0, filter: 'brightness(0.95)', transition: motionTokens.springTactile },
};

export const buttonHover = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: motionTokens.springGentle },
  tap: { scale: 0.95, transition: motionTokens.springTactile },
};

// ── Modals & Drawers ─────────────────────────────────────────

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: motionTokens.springGentle },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
};

export const drawerVariants: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: motionTokens.springGentle },
  exit: { y: '100%', transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } },
};

// ── Specialized Smarani States ───────────────────────────────

export const gentleFloat: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const breathingGlow: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 0 rgba(27,77,62,0)',
      '0 0 32px rgba(27,77,62,0.3)',
      '0 0 0 rgba(27,77,62,0)'
    ],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const pulseRing: Variants = {
  initial: { opacity: 0.8, scale: 1 },
  animate: {
    opacity: 0,
    scale: 2,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeOut",
    },
  },
};
