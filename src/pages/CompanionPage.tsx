// ============================================================
// Smarani NER — Companion Page
// AI voice companion with full interaction states (SIH Integrated)
// ============================================================

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../components/avatar/Avatar';
import { VoiceWave } from '../components/voice/VoiceWave';
import { Button } from '../components/ui/UI';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
import { VoiceService } from '../services';
import { useVoiceAmplitude, useReducedMotion } from '../hooks';
import { fadeUp, staggerContainer, buttonHover } from '../tokens/variants';
import './CompanionPage.css';

const QUICK_MESSAGES = [
  { id: 'hw', text: 'How are you?', icon: '😊' },
  { id: 'game', text: 'I want to play a game', icon: '🎮' },
  { id: 'remind', text: 'What should I do today?', icon: '📋' },
  { id: 'calm', text: 'I feel tired', icon: '🌿' },
  { id: 'help', text: 'I need help', icon: '🤝' },
  { id: 'good', text: 'I feel good today!', icon: '🌟' },
];

const AI_RESPONSES: Record<string, { text: string; action?: string }> = {
  hw: { text: "I am happy to hear from you. How can I help you today?" },
  game: { text: "Wonderful! Let us play a memory game. It will be fun!", action: '/memory-game' },
  remind: { text: "Today you have your morning medicine, a walk, and three glasses of water. Take your time." },
  calm: { text: "It is okay to feel tired. Let us go to the calm space together.", action: '/calm' },
  help: { text: "I am right here with you. You are safe. What do you need?" },
  good: { text: "That makes me very happy! A good feeling is a gift. Shall we play a game?" },
};

export const CompanionPage: React.FC = () => {
  const navigate = useNavigate();
  const { locale, aiState, setAIState, lastSpeech, setLastSpeech, currentUser } = useAppStore();
  const strings = getStrings(locale);
  const reduced = useReducedMotion();

  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'ai'; text: string; sources?: string[] | string }>>([
    { id: 'greeting', role: 'ai', text: strings.greeting },
  ]);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const amplitude = useVoiceAmplitude(isListening);

  // Greet on mount
  useEffect(() => {
    setAIState('speaking');
    VoiceService.speak(strings.greeting);
    setTimeout(() => setAIState('idle'), 3000);
    return () => VoiceService.stopSpeaking();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processMessage = useCallback(async (text: string, msgId?: string) => {
    if (aiState === 'thinking' || aiState === 'speaking') return;

    // Add user message
    const userMsg = { id: Date.now().toString(), role: 'user' as const, text };
    setMessages(prev => {
      const newHistory = [...prev, userMsg];
      
      // Determine premium loading text
      const lower = text.toLowerCase();
      const requiresSearch = ['latest', 'current', 'today', 'news', 'president', 'pm', 'price', 'recently', 'yesterday', 'won', 'match', 'ceo'].some(kw => lower.includes(kw));
      setAIState(requiresSearch ? 'searching' : 'thinking');
      
      // We will perform the API call inside the async flow but we need the latest messages.
      return newHistory;
    });

    // Wait slightly to let state update, then capture the current state of messages
    // React state updates asynchronously, so we construct the history directly here to send to the server.
    // We can't rely on `messages` immediately since it hasn't re-rendered.
    let response: { text: string; action?: string; sources?: string[] | string } | undefined;

    // Check predefined actions first
    if (msgId && AI_RESPONSES[msgId]) {
      response = AI_RESPONSES[msgId];
      await new Promise(r => setTimeout(r, 900));
    } else {
      try {
        const userContext = currentUser ? {
          name: currentUser.name,
          level: currentUser.level,
          xp: currentUser.xp,
          streak: currentUser.currentStreak
        } : null;

        // Since messages state might not be updated yet in this closure, we pass the prev messages + new message
        const currentHistory = [...messages, userMsg];
        
        const apiRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: currentHistory, userContext })
        });
        
        if (apiRes.ok) {
          const data = await apiRes.json();
          response = { text: data.text, sources: data.sources };
        } else {
          response = { text: "I am having trouble connecting to my servers right now." };
        }
      } catch (e) {
        console.error("API error:", e);
        response = { text: "I seem to be offline. Let's just talk when I'm back." };
      }
    }

    const aiMsg = { 
      id: Date.now().toString() + 'ai', 
      role: 'ai' as const, 
      text: response?.text || 'Hello.', 
      sources: response?.sources 
    };
    
    setMessages(prev => [...prev, aiMsg]);
    setLastSpeech(aiMsg.text);
    setAIState('speaking');
    VoiceService.speak(aiMsg.text);

    if (response?.action) {
      setPendingAction(response.action);
    }

    setTimeout(() => setAIState('idle'), 4000);
  }, [aiState, setAIState, setLastSpeech, currentUser, messages]);

  const handleQuickMessage = useCallback((msgId: string, text: string) => {
    processMessage(text, msgId);
  }, [processMessage]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    processMessage(text);
  };

  const handleMicPress = async () => {
    if (isListening) {
      setIsListening(false);
      setAIState('thinking');
      await VoiceService.stopListening();
      await new Promise(r => setTimeout(r, 1000));
      const aiMsg = { id: Date.now() + 'ai', role: 'ai' as const, text: "I heard you. I am here to help." };
      setMessages(prev => [...prev, aiMsg]);
      setAIState('speaking');
      VoiceService.speak(aiMsg.text);
      setTimeout(() => setAIState('idle'), 3000);
    } else {
      setIsListening(true);
      setAIState('listening');
      const userMsg = { id: Date.now().toString(), role: 'user' as const, text: '[Speaking…]' };
      setMessages(prev => [...prev, userMsg]);
      await VoiceService.startListening();
    }
  };

  return (
    <div className="companion-page" id="companion-page">
      {/* Header */}
      <div className="companion-header">
        <button className="game-back-btn" onClick={() => navigate('/')} aria-label="Go back">
          ← {strings.back}
        </button>
        <div className="companion-header-center">
          <div className="dot"></div>
          <h1 className="companion-title">NOVA: Your AI Memory Companion</h1>
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* Avatar area */}
      <div className="companion-avatar-area">
        <div className="companion-avatar-wrapper">
          {!reduced && (
            <VoiceWave state={aiState} amplitude={amplitude} size={280} />
          )}
          <Avatar
            state={aiState}
            size="lg"
            speech={aiState === 'speaking' ? lastSpeech.slice(0, 60) : undefined}
            amplitude={amplitude}
          />
        </div>

        {/* State label */}
        <AnimatePresence mode="wait">
          {aiState !== 'idle' && (
            <motion.p
              key={aiState}
              className="companion-state-label"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {aiState === 'listening' ? strings.listening :
               aiState === 'thinking' ? strings.thinking :
               aiState === 'searching' ? 'Searching the web...' :
               aiState === 'speaking' ? strings.speaking : ''}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Chat messages */}
      <div className="companion-messages" role="log" aria-live="polite">
        <AnimatePresence>
          {messages.slice(-4).map(msg => (
            <motion.div
              key={msg.id}
              className={`chat-bubble chat-bubble--${msg.role}`}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              {msg.text}
              {msg.sources && (
                <div className="chat-sources">
                  <div className="chat-sources-header">
                    <span className="chat-sources-icon">🌐</span> Grounded Sources
                  </div>
                  <ul className="chat-sources-list">
                    {(Array.isArray(msg.sources) ? msg.sources : [msg.sources]).map((src, idx) => (
                      <li key={idx}>{typeof src === 'string' ? src : JSON.stringify(src)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick messages */}
      <div className="companion-quick-msg">
        <p className="quick-msg-label">Quick messages</p>
        <motion.div 
          className="quick-msg-grid"
          variants={reduced ? {} : staggerContainer}
          initial="hidden"
          animate="show"
        >
          {QUICK_MESSAGES.map(msg => (
            <motion.button
              key={msg.id}
              id={`quick-msg-${msg.id}`}
              className="quick-msg-btn"
              onClick={() => handleQuickMessage(msg.id, msg.text)}
              disabled={aiState === 'thinking' || aiState === 'speaking'}
              variants={reduced ? {} : fadeUp}
              whileHover={!reduced ? buttonHover.hover : {}}
              whileTap={!reduced ? buttonHover.tap : {}}
              aria-label={msg.text}
            >
              <span className="quick-msg-icon">{msg.icon}</span>
              <span className="quick-msg-text">{msg.text}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Chat Input */}
      <div className="companion-chat-input-area">
        <form onSubmit={handleTextSubmit} className="companion-chat-form">
          <input
            type="text"
            className="companion-text-input"
            placeholder="Type a message to NOVA..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={aiState === 'thinking' || aiState === 'speaking'}
          />
          <button 
            type="submit" 
            className="companion-send-btn"
            disabled={!inputText.trim() || aiState === 'thinking' || aiState === 'speaking'}
            aria-label="Send message"
          >
            ➤
          </button>
        </form>
      </div>

      {/* Microphone button */}
      <div className="companion-mic-area">
        <motion.button
          id="companion-mic-btn"
          className={`companion-mic-btn ${isListening ? 'companion-mic-btn--listening' : ''}`}
          onPointerDown={handleMicPress}
          onPointerUp={() => { if (isListening) handleMicPress(); }}
          onPointerLeave={() => { if (isListening) handleMicPress(); }}
          whileHover={!reduced ? { scale: 1.05 } : {}}
          whileTap={!reduced ? { scale: 0.95 } : {}}
          aria-label={isListening ? 'Stop listening' : 'Hold to speak'}
          aria-pressed={isListening}
          style={{ userSelect: 'none' }}
        >
          <span className="mic-icon">{isListening ? '⬛' : '🎤'}</span>
          <span className="mic-label">{isListening ? 'LISTENING...' : 'HOLD TO SPEAK'}</span>
        </motion.button>

        {isListening && !reduced && (
          <motion.div
            className="mic-pulse-ring"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Action prompt */}
      <AnimatePresence>
        {pendingAction && (
          <motion.div
            className="companion-action-prompt"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p>Would you like to go there?</p>
            <div className="action-prompt-btns">
              <Button variant="primary" size="sm" onClick={() => { navigate(pendingAction!); setPendingAction(null); }}>
                Yes, take me there
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPendingAction(null)}>
                Stay here
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
