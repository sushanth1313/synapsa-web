import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import './MemoryJourneyPage.css';

const FOREST_OBJECTS = [
  { id: 'fox', label: 'Silver Fox', icon: '🦊', color: '#f97316' },
  { id: 'mushroom', label: 'Glowing Mushroom', icon: '🍄', color: '#ef4444' },
  { id: 'butterfly', label: 'Sapphire Butterfly', icon: '🦋', color: '#3b82f6' },
  { id: 'owl', label: 'Snow Owl', icon: '🦉', color: '#f3f4f6' },
  { id: 'acorn', label: 'Golden Acorn', icon: '🌰', color: '#b45309' },
  { id: 'leaf', label: 'Autumn Leaf', icon: '🍂', color: '#fbbf24' }
];

const BRIDGE_SYMBOLS = [
  { id: 'star', label: 'Star', icon: '⭐', color: '#fde047' },
  { id: 'moon', label: 'Moon', icon: '🌙', color: '#fbcfe8' },
  { id: 'sun', label: 'Sun', icon: '☀️', color: '#fb923c' },
  { id: 'cloud', label: 'Cloud', icon: '☁️', color: '#e2e8f0' },
  { id: 'lightning', label: 'Lightning', icon: '⚡', color: '#fef08a' }
];

type Stage = 'intro' | 'forest_observe' | 'bridge_transition' | 'bridge_observe' | 'bridge_recall' | 'clearing_transition' | 'clearing_recall' | 'finale';

export const MemoryJourneyPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { incrementScore, completeGameActivity } = useAppStore();

  const [stage, setStage] = useState<Stage>('intro');
  const [bgClass, setBgClass] = useState('end');
  
  // Data
  const [forestTargets, setForestTargets] = useState<typeof FOREST_OBJECTS>([]);
  const [forestPool, setForestPool] = useState<typeof FOREST_OBJECTS>([]);
  const [selectedForest, setSelectedForest] = useState<Set<string>>(new Set());
  
  const [bridgeSequence, setBridgeSequence] = useState<typeof BRIDGE_SYMBOLS>([]);
  const [bridgeStep, setBridgeStep] = useState(0); // for showing and recalling
  const [activeBridgeNode, setActiveBridgeNode] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Generate game data once
    const fTargets = [...FOREST_OBJECTS].sort(() => 0.5 - Math.random()).slice(0, 3);
    const fDecoys = [...FOREST_OBJECTS].filter(o => !fTargets.includes(o)).slice(0, 3);
    setForestTargets(fTargets);
    setForestPool([...fTargets, ...fDecoys].sort(() => 0.5 - Math.random()));
    
    const bSeq: typeof BRIDGE_SYMBOLS = [];
    for (let i=0; i<4; i++) {
      bSeq.push(BRIDGE_SYMBOLS[Math.floor(Math.random() * BRIDGE_SYMBOLS.length)]);
    }
    setBridgeSequence(bSeq);
  }, []);

  const beginJourney = () => {
    setBgClass('forest');
    setStage('forest_observe');
    
    // Forest observation
    timerRef.current = setTimeout(() => {
      setBgClass('bridge');
      setStage('bridge_transition');
      
      timerRef.current = setTimeout(() => {
        setStage('bridge_observe');
        playBridgeSequence();
      }, 3000);
      
    }, 5000);
  };

  const playBridgeSequence = () => {
    let step = 0;
    const play = () => {
      if (step < bridgeSequence.length) {
        setActiveBridgeNode(bridgeSequence[step].id);
        timerRef.current = setTimeout(() => {
          setActiveBridgeNode(null);
          timerRef.current = setTimeout(play, 400);
          step++;
        }, 800);
      } else {
        setStage('bridge_recall');
        setBridgeStep(0);
      }
    };
    timerRef.current = setTimeout(play, 1500);
  };

  const handleBridgeTap = (symbolId: string) => {
    if (stage !== 'bridge_recall') return;
    
    if (symbolId === bridgeSequence[bridgeStep].id) {
      // Correct
      const nextStep = bridgeStep + 1;
      setBridgeStep(nextStep);
      setActiveBridgeNode(symbolId); // Flash positive
      setTimeout(() => setActiveBridgeNode(null), 300);

      if (nextStep === bridgeSequence.length) {
        // Bridge complete
        setBgClass('clearing');
        setStage('clearing_transition');
        
        timerRef.current = setTimeout(() => {
          setStage('clearing_recall');
        }, 3000);
      }
    } else {
      // Wrong, flash and reset bridge
      setActiveBridgeNode('wrong');
      setTimeout(() => {
        setActiveBridgeNode(null);
        setBridgeStep(0);
      }, 600);
    }
  };

  const toggleForestSelection = (obj: string) => {
    if (stage !== 'clearing_recall') return;
    const newSel = new Set(selectedForest);
    if (newSel.has(obj)) {
      newSel.delete(obj);
    } else {
      if (newSel.size < 3) newSel.add(obj);
    }
    setSelectedForest(newSel);
  };

  const checkFinalRecall = () => {
    let correct = 0;
    selectedForest.forEach(objId => {
      if (forestTargets.some(t => t.id === objId)) correct++;
    });
    
    if (correct === 3) {
      setBgClass('end');
      setStage('finale');
      completeGameActivity('MEMORY_JOURNEY', 500, 100, 180, 1);
      incrementScore(500);
    } else {
      // Clear and let try again
      setSelectedForest(new Set());
    }
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const fade = {
    hidden: { opacity: 0, filter: 'blur(20px)' },
    show: { opacity: 1, filter: 'blur(0px)', transition: { duration: 1.5, ease: 'easeOut' } },
    exit: { opacity: 0, filter: 'blur(20px)', transition: { duration: 1 } }
  };

  return (
    <div className="memory-journey-page">
      
      <div className={`mj-bg ${bgClass}`} />

      <div className="mj-header">
        <button className="mj-btn-outline" onClick={() => navigate('/games')}>Leave Journey</button>
      </div>

      <div className="mj-content">
        <AnimatePresence mode="wait">
          
          {stage === 'intro' && (
            <motion.div key="intro" variants={reduced ? {} : fade} initial="hidden" animate="show" exit="exit" className="mj-stage-container">
              <h1 className="mj-title">The Memory Journey</h1>
              <p className="mj-subtitle">A seamless experience across three distinct environments. Keep your mind open and remember what you see along the way.</p>
              <button className="mj-btn" onClick={beginJourney}>Begin Journey</button>
            </motion.div>
          )}

          {stage === 'forest_observe' && (
            <motion.div key="forest_observe" variants={reduced ? {} : fade} initial="hidden" animate="show" exit="exit" className="mj-stage-container">
              <p className="mj-subtitle">You enter a tranquil forest. Remember these artifacts...</p>
              <div className="mj-objects">
                {forestTargets.map((obj, i) => (
                  <motion.div 
                    key={i} 
                    className="mj-object-card"
                    initial={{ opacity: 0, scale: 0.8, y: 50 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    transition={{ delay: 0.5 + i * 0.4, duration: 0.8, type: 'spring' }}
                  >
                    <span className="mj-object-icon" style={{ textShadow: `0 0 40px ${obj.color}` }}>{obj.icon}</span>
                    <span className="mj-object-label">{obj.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'bridge_transition' && (
            <motion.div key="bridge_transition" variants={reduced ? {} : fade} initial="hidden" animate="show" exit="exit" className="mj-stage-container">
              <h1 className="mj-title">The Bridge of Stars</h1>
              <p className="mj-subtitle">You leave the forest behind and step onto a bridge suspended in the night sky.</p>
            </motion.div>
          )}

          {stage === 'bridge_observe' && (
            <motion.div key="bridge_observe" variants={reduced ? {} : fade} initial="hidden" animate="show" exit="exit" className="mj-stage-container">
              <p className="mj-subtitle">Watch the sequence of the stars...</p>
              <div className="mj-sequence">
                {BRIDGE_SYMBOLS.map((sym, i) => (
                  <div 
                    key={i} 
                    className={`mj-seq-node ${activeBridgeNode === sym.id ? 'active' : ''}`}
                    style={{ borderColor: activeBridgeNode === sym.id ? sym.color : 'rgba(255,255,255,0.1)' }}
                  >
                    {sym.icon}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'bridge_recall' && (
            <motion.div key="bridge_recall" variants={reduced ? {} : fade} initial="hidden" animate="show" exit="exit" className="mj-stage-container">
              <p className="mj-subtitle" style={{ color: activeBridgeNode === 'wrong' ? '#EF4444' : 'inherit' }}>
                Tap the sequence to cross the bridge. ({bridgeStep}/{bridgeSequence.length})
              </p>
              <div className="mj-sequence">
                {BRIDGE_SYMBOLS.map((sym, i) => (
                  <div 
                    key={i} 
                    className={`mj-seq-node interactive ${activeBridgeNode === sym.id ? 'active' : ''} ${activeBridgeNode === 'wrong' ? 'wrong' : ''}`}
                    onClick={() => handleBridgeTap(sym.id)}
                  >
                    {sym.icon}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'clearing_transition' && (
            <motion.div key="clearing_transition" variants={reduced ? {} : fade} initial="hidden" animate="show" exit="exit" className="mj-stage-container">
              <h1 className="mj-title">The Final Clearing</h1>
              <p className="mj-subtitle">You have crossed safely. One final test remains.</p>
            </motion.div>
          )}

          {stage === 'clearing_recall' && (
            <motion.div key="clearing_recall" variants={reduced ? {} : fade} initial="hidden" animate="show" exit="exit" className="mj-stage-container">
              <p className="mj-subtitle">Think back to the beginning. What three artifacts did you see in the forest?</p>
              
              <div className="mj-options">
                {forestPool.map((obj, i) => (
                  <div 
                    key={i} 
                    className={`mj-option ${selectedForest.has(obj.id) ? 'selected' : ''}`}
                    onClick={() => toggleForestSelection(obj.id)}
                    style={{ '--sel-color': obj.color } as any}
                  >
                    <span className="mj-option-icon">{obj.icon}</span>
                    <span className="mj-option-label">{obj.label}</span>
                  </div>
                ))}
              </div>

              <button 
                className="mj-btn mj-btn-primary" 
                style={{ marginTop: '48px', opacity: selectedForest.size === 3 ? 1 : 0.4, pointerEvents: selectedForest.size === 3 ? 'auto' : 'none' }}
                onClick={checkFinalRecall}
              >
                Reveal Truth
              </button>
            </motion.div>
          )}

          {stage === 'finale' && (
            <motion.div key="finale" variants={reduced ? {} : fade} initial="hidden" animate="show" exit="exit" className="mj-stage-container">
              <h1 className="mj-title finale-title">Journey Complete</h1>
              <p className="mj-subtitle">Your mind is clear, present, and resilient.</p>
              <div className="mj-finale-stats">
                <div><span>Score</span><b>+500</b></div>
                <div><span>Accuracy</span><b>100%</b></div>
              </div>
              <button className="mj-btn" onClick={() => navigate('/games')}>Return to Hub</button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
