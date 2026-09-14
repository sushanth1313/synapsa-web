import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { Canvas } from '@react-three/fiber';
import { BreathingLotus3D } from '../components/3d/BreathingLotus3D';
import { fadeUp } from '../tokens/variants';
import './CalmSpacePage.css';

const BREATHING_STEPS = [
  { label: 'Breathe In', duration: 4000 },
  { label: 'Hold', duration: 4000 },
  { label: 'Breathe Out', duration: 6000 },
];

export const CalmSpacePage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const [breathStep, setBreathStep] = React.useState(0);
  const [exercising, setExercising] = React.useState(false);

  useEffect(() => {
    if (!exercising) return;
    let step = breathStep;
    const advance = () => {
      step = (step + 1) % BREATHING_STEPS.length;
      setBreathStep(step);
    };
    const id = setTimeout(advance, BREATHING_STEPS[step].duration);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercising, breathStep]);

  return (
    <div className="calm-page" id="calm-space-page">
      <div className="calm-header">
        <button className="game-back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>
      </div>

      <div className="calm-split">
        {/* Left: Huge Typography */}
        <motion.div
          className="calm-typography"
          variants={reduced ? {} : fadeUp}
          initial="hidden"
          animate="show"
        >
          <div className="eyebrow"><div className="dot"></div> TRANQUIL</div>
          
          <h1 className="h-hero jp calm-title-animate" key={exercising ? 'ex' : 'idle'}>
            {exercising ? BREATHING_STEPS[breathStep].label : "You are safe here."}
          </h1>
          
          <p className="body-lg">
            {exercising ? "Follow the expanding void." : "Take your time. Breathe slowly."}
          </p>

          <div style={{ marginTop: '48px' }}>
            {!exercising ? (
              <button className="void-btn" onClick={() => { setExercising(true); setBreathStep(0); }}>
                <span>Begin Exercise</span><i></i>
              </button>
            ) : (
              <button className="void-btn void-btn-stop" onClick={() => setExercising(false)}>
                <span>End Exercise</span><i></i>
              </button>
            )}
          </div>
        </motion.div>

        {/* Right: Massive Geometric Breathing Core */}
        <div className="calm-visual">
          <div className="calm-visual-container glow">
            {!reduced && (
              <Canvas camera={{ position: [0, 0, 10], fov: 45 }} gl={{ alpha: true }}>
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={2} color="#8052ff" />
                <BreathingLotus3D phase={exercising ? BREATHING_STEPS[breathStep].label : 'idle'} />
              </Canvas>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
