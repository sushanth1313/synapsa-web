import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store';

const LANGUAGES = [
  { code: 'en-IN', name: 'English', available: true },
  { code: 'as-IN', name: 'Assamese (অসমীয়া)', available: true },
  { code: 'bn-IN', name: 'Bengali (বাংলা)', available: true },
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)', available: true },
  { code: 'mni-IN', name: 'Meitei (মৈতৈ)', available: false },
  { code: 'lus', name: 'Mizo', available: false },
  { code: 'kha', name: 'Khasi', available: false },
  { code: 'grt', name: 'Garo', available: false },
  { code: 'ne', name: 'Nepali (नेपाली)', available: false },
  { code: 'trp', name: 'Kokborok/Tripuri', available: false },
];

export const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale } = useAppStore();
  const currentLang = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  return (
    <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 1000, fontFamily: 'var(--font-sans)' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(5, 7, 10, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'var(--bone)',
          padding: '8px 16px',
          borderRadius: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px'
        }}
      >
        <span>🌐</span> {currentLang.name} {isOpen ? '▲' : '▼'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'rgba(5, 7, 10, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '8px',
              width: '240px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}
          >
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  if (lang.available) {
                    setLocale(lang.code);
                    setIsOpen(false);
                  }
                }}
                disabled={!lang.available}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  padding: '10px 12px',
                  background: 'none',
                  border: 'none',
                  color: lang.available ? 'var(--bone)' : 'rgba(255, 255, 255, 0.3)',
                  cursor: lang.available ? 'pointer' : 'not-allowed',
                  textAlign: 'left',
                  borderRadius: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => { if(lang.available) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={(e) => { if(lang.available) e.currentTarget.style.background = 'none'; }}
              >
                <span>{lang.name}</span>
                {!lang.available && <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Coming Soon</span>}
                {lang.code === currentLang.code && <span style={{ color: 'var(--color-tea-green)' }}>✓</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
