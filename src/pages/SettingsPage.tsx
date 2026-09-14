import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import { fadeUp, staggerContainer } from '../tokens/variants';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { currentUser, logout, showToast } = useAppStore();
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLogoutModal) {
        setShowLogoutModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutModal]);

  const handleConfirmLogout = () => {
    logout();
    navigate('/landing');
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button className="game-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          ← Back
        </button>
        <div className="settings-header-eyebrow">
          <div className="dot"></div>
          SETTINGS & PROFILE
        </div>
      </div>

      <motion.div
        className="settings-content"
        variants={reduced ? {} : staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div className="profile-section" variants={reduced ? {} : fadeUp}>
          <div className="profile-avatar">{currentUser?.name.charAt(0) || 'E'}</div>
          <div className="profile-info">
            <h2>{currentUser?.name || 'Explorer'}</h2>
            <p>{currentUser?.email || 'user@example.com'}</p>
            {currentUser && (
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '14px', color: 'var(--color-tea-green)' }}>
                <span>Level {currentUser.level}</span>
                <span>•</span>
                <span>{currentUser.xp} XP</span>
                <span>•</span>
                <span>🔥 {currentUser.currentStreak} Day Streak</span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div className="settings-group" variants={reduced ? {} : fadeUp}>
          <h3>Account</h3>
          
          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-item-title">Edit Profile</span>
              <span className="settings-item-desc">Update your personal details</span>
            </div>
            <button className="settings-action-btn" onClick={() => showToast('Edit profile coming soon')}>Edit</button>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-item-title">Preferences</span>
              <span className="settings-item-desc">Adjust the appearance of NOVA</span>
            </div>
            <button className="settings-action-btn" onClick={() => showToast('Preferences coming soon')}>Manage</button>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-item-title">Notifications</span>
              <span className="settings-item-desc">Get reminders for routines and activities</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked onChange={() => showToast('Push notifications updated')} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-item-title">Privacy</span>
              <span className="settings-item-desc">Manage your data and security</span>
            </div>
            <button className="settings-action-btn" onClick={() => showToast('Privacy settings coming soon')}>View</button>
          </div>
        </motion.div>

        <motion.div className="settings-group" variants={reduced ? {} : fadeUp} style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
          <div className="settings-item" style={{ border: 'none' }}>
            <div className="settings-item-info">
              <span className="settings-item-title" style={{ color: '#ef4444' }}>Log out</span>
              <span className="settings-item-desc">Securely end your session</span>
            </div>
            <button className="settings-action-btn danger-btn" onClick={() => setShowLogoutModal(true)}>
              <span style={{ marginRight: '8px' }}>Log out</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showLogoutModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutModal(false)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '24px'
            }}
          >
            <motion.div 
              className="modal-content"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              exit="hidden"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-2)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '400px',
                width: '100%',
                position: 'relative',
                textAlign: 'center'
              }}
            >
              <h2 style={{ fontSize: '28px', color: 'var(--bone)', marginBottom: '16px' }}>Log out of Synapsa?</h2>
              <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: '1.5', marginBottom: '8px' }}>
                Your progress will remain safely saved.
              </p>
              <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: '1.5', marginBottom: '32px' }}>
                You can sign back in anytime.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '100px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'transparent',
                    color: 'var(--bone)',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmLogout}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '100px',
                    border: 'none',
                    background: '#ef4444',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Log out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
