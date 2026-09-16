// ============================================================
// SYNAPSA — Companion Page
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

const getQuickMessages = (strings: any) => [
  { id: 'hw', text: strings.quick_msg_hw || 'How are you?', icon: '😊' },
  { id: 'game', text: strings.quick_msg_game || 'I want to play a game', icon: '🎮' },
  { id: 'remind', text: strings.quick_msg_remind || 'What should I do today?', icon: '📋' },
  { id: 'calm', text: strings.quick_msg_calm || 'I feel tired', icon: '🌿' },
  { id: 'help', text: strings.quick_msg_help || 'I need help', icon: '🤝' },
  { id: 'good', text: strings.quick_msg_good || 'I feel good today!', icon: '🌟' },
];

// Navigation hints for quick messages — used ONLY to suggest navigation after AI responds
const QUICK_NAV_HINTS: Record<string, string> = {
  game: '/games',
  calm: '/calm',
};

export const CompanionPage: React.FC = () => {
  const navigate = useNavigate();
  const { locale, aiState, setAIState, lastSpeech, setLastSpeech, currentUser, routineItems } = useAppStore();
  const strings = getStrings(locale);
  const reduced = useReducedMotion();

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'ai'; text: string; sources?: string[] | string }>>([
    { id: 'greeting', role: 'ai', text: strings.greeting },
  ]);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  
  const recognitionRef = React.useRef<any>(null);

  const amplitude = useVoiceAmplitude(false);

  // Greet on mount
  useEffect(() => {
    setAIState('speaking');
    VoiceService.speak(strings.greeting, locale);
    setTimeout(() => setAIState('idle'), 3000);
    return () => VoiceService.stopSpeaking();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop recognition and speaking on locale change
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
      if (aiState === 'listening') setAIState('idle');
    }
    VoiceService.stopSpeaking();
  }, [locale]);

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

    // Always call backend so language enforcement (CRITICAL LANGUAGE RULE) is applied
    try {
      const userContext = currentUser ? {
        name: currentUser.name,
        level: currentUser.level,
        xp: currentUser.xp,
        streak: currentUser.currentStreak,
        routine: routineItems.map(r => `${r.scheduledTime}: ${r.title} (${r.completedAt ? 'Done' : 'Pending'})`).join(', ')
      } : null;

      // Since messages state might not be updated yet in this closure, we pass the prev messages + new message
      const currentHistory = [...messages, userMsg];
      
      const apiRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentHistory, userContext, language: locale })
      });
      
      if (apiRes.ok) {
        const data = await apiRes.json();
        // Map backend 'response' field correctly
        if (data.success === false) {
           response = { text: data.error || data.response || "Server error occurred." };
        } else {
           // Merge any nav hint from quick message shortcuts
           const navAction = data.action || (msgId ? QUICK_NAV_HINTS[msgId] : undefined);
           response = { text: data.response || data.text, sources: data.sources, action: navAction };
        }
      } else {
        try {
          const errData = await apiRes.json();
          response = { text: errData.error || errData.response || `Error ${apiRes.status}: I am having trouble connecting to my servers.` };
        } catch(e) {
          response = { text: `Error ${apiRes.status}: I am having trouble connecting to my servers right now.` };
        }
      }
    } catch (e) {
      console.error("API error:", e);
      response = { text: `I seem to be offline. Error: ${e instanceof Error ? e.message : String(e)}` };
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
    VoiceService.speak(aiMsg.text, locale);

    if (response?.action) {
      setPendingAction(response.action);
    }

    setTimeout(() => setAIState('idle'), 4000);
  }, [aiState, setAIState, setLastSpeech, currentUser, messages]);

  const handleQuickMessage = useCallback((msgId: string, text: string) => {
    processMessage(text, msgId);
  }, [processMessage]);

  // Locale is stored as 'en-IN', 'kn-IN', 'as-IN', 'bn-IN' — use directly for recognition
  const speechLangMap: Record<string, string> = {
    'en-IN': 'en-IN',
    'kn-IN': 'kn-IN',
    'as-IN': 'as-IN',
    'bn-IN': 'bn-IN',
  };
  const recognitionLang = speechLangMap[locale] || 'en-IN';

  // Mic label in the selected language
  const micLabel: Record<string, string> = {
    'en-IN': 'Speak',
    'kn-IN': 'ಮಾತನಾಡಿ',
    'as-IN': 'কথা কওক',
    'bn-IN': 'বলুন',
  };
  const micLabelText = micLabel[locale] || 'Speak';

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setAIState('idle');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    // Use the full locale code directly (kn-IN, en-IN, bn-IN, as-IN)
    recognition.lang = recognitionLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setAIState('listening');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      processMessage(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone permission is required. Please allow microphone access in your browser settings.');
      }
      setIsListening(false);
      setAIState('idle');
    };

    recognition.onend = () => {
      setIsListening(false);
      if (aiState === 'listening') setAIState('idle');
    };

    recognition.start();
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    processMessage(text);
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
          <h1 className="companion-title">{strings.companion_title}</h1>
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* Avatar area */}
      <div className="companion-avatar-area">
        <div className="companion-avatar-wrapper">
          {!reduced && (
            <VoiceWave state={aiState} size={280} />
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
               aiState === 'searching' ? strings.searching_web :
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
        <p className="quick-msg-label">{strings.quick_msg_label}</p>
        <motion.div 
          className="quick-msg-grid"
          variants={reduced ? {} : staggerContainer}
          initial="hidden"
          animate="show"
        >
          {getQuickMessages(strings).map(msg => (
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

      {/* ── Large Microphone Button (elderly-friendly) ── */}
      <div className="companion-mic-area">
        <button
          id="nova-mic-button"
          type="button"
          className={`nova-mic-btn ${isListening ? 'nova-mic-btn--listening' : ''}`}
          onClick={toggleListening}
          disabled={aiState === 'thinking' || aiState === 'speaking'}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        >
          <span className="nova-mic-icon">{isListening ? '⏹' : '🎤'}</span>
          <span className="nova-mic-label">{isListening ? (strings.listening || 'Listening...') : micLabelText}</span>
        </button>
        {isListening && (
          <div className="nova-mic-pulse-ring" aria-hidden="true" />
        )}
      </div>

      {/* Chat Input */}
      <div className="companion-chat-input-area">
        <form onSubmit={handleTextSubmit} className="companion-chat-form">
          <input
            type="text"
            className="companion-text-input"
            placeholder={strings.type_message}
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

      {/* Action prompt */}
      <AnimatePresence>
        {pendingAction && (
          <motion.div
            className="companion-action-prompt"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p>{strings.would_you_like_to_go}</p>
            <div className="action-prompt-btns">
              <Button variant="primary" size="sm" onClick={() => { navigate(pendingAction!); setPendingAction(null); }}>
                {strings.yes_take_me_there}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPendingAction(null)}>
                {strings.stay_here}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
