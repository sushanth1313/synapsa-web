import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { getStrings } from '../i18n';
import { staggerContainer, fadeUp } from '../tokens/variants';
import './FamilyConnectPage.css';

const MESSAGES = [
  { id: 1, author: 'Arjun (Son)', text: 'Thinking of you today, Ma. I will visit this weekend!', time: '2 hours ago', avatar: '👨‍🦱' },
  { id: 2, author: 'Priya (Daughter)', text: 'Hope you are doing your memory games. Love you!', time: 'Yesterday', avatar: '👩🏽' },
  { id: 3, author: 'Rohan (Grandson)', text: 'Look at my new drawing for you!', time: '2 days ago', avatar: '👦🏽' },
];

export const FamilyConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const { locale } = useAppStore();
  const strings = getStrings(locale);

  return (
    <div className="family-connect-page">
      <div className="family-content">
        <div className="game-header-top">
          <button className="game-back-btn" onClick={() => navigate('/games')}>← {strings.back || 'Back'}</button>
        </div>

        <motion.div 
          className="family-container"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div className="family-header-text" variants={fadeUp}>
            <h1 className="family-title">Family Messages</h1>
            <p className="family-subtitle">Stay connected with your loved ones.</p>
          </motion.div>
          
          <div className="messages-list">
            {MESSAGES.map((msg) => (
              <motion.div key={msg.id} className="message-card" variants={fadeUp}>
                <div className="message-avatar">{msg.avatar}</div>
                <div className="message-body">
                  <div className="message-header">
                    <span className="message-author">{msg.author}</span>
                    <span className="message-time">{msg.time}</span>
                  </div>
                  <p className="message-text">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
