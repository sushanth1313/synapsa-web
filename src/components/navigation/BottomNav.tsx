// ============================================================
// SYNAPSA — Bottom Navigation (Premium Redesign)
// ============================================================

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M12 3L4 9V21H9V14H15V21H20V9L12 3Z" />
  </svg>
);

const GamesIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M21 6H3C1.9 6 1 6.9 1 8V16C1 17.1 1.9 18 3 18H21C22.1 18 23 17.1 23 16V8C23 6.9 22.1 6 21 6ZM9 15H7V13H5V11H7V9H9V11H11V13H9V15ZM15 15C13.9 15 13 14.1 13 13C13 11.9 13.9 11 15 11C16.1 11 17 11.9 17 13C17 14.1 16.1 15 15 15ZM19 12C17.9 12 17 11.1 17 10C17 8.9 17.9 8 19 8C20.1 8 21 8.9 21 10C21 11.1 20.1 12 19 12Z" />
  </svg>
);

const RoutineIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1C10.7 1 9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 3C12.55 3 13 3.45 13 4C13 4.55 12.55 5 12 5C11.45 5 11 4.55 11 4C11 3.45 11.45 3 12 3ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12.5 9H11V12.5L13.5 14L14.2 12.8L12.5 11.8V9Z" />
  </svg>
);

const CompanionIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
  </svg>
);

const ProgressIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 20.2C9.5 20.2 7.29 18.92 6 16.98C6.03 14.99 10 13.9 12 13.9C13.99 13.9 17.97 14.99 18 16.98C16.71 18.92 14.5 20.2 12 20.2Z" />
  </svg>
);

const NAV_ITEMS = [
  { id: 'home', icon: <HomeIcon />, label: 'Home', route: '/' },
  { id: 'games', icon: <GamesIcon />, label: 'Games', route: '/games' },
  { id: 'progress', icon: <ProgressIcon />, label: 'Progress', route: '/progress' },
  { id: 'routine', icon: <RoutineIcon />, label: 'Routine', route: '/routine' },
  { id: 'profile', icon: <ProfileIcon />, label: 'Profile', route: '/settings' },
];

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();

  // Hide on caregiver dashboard
  if (location.pathname === '/caregiver') return null;

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {NAV_ITEMS.map(item => {
        const isActive =
          item.route === '/'
            ? location.pathname === '/'
            : item.id === 'games'
            ? location.pathname.startsWith('/games') || location.pathname.startsWith('/memory-game') || location.pathname.startsWith('/pattern-game')
            : location.pathname.startsWith(item.route);

        return (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.route)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="nav-item-icon">
              {item.icon}
            </div>

            {isActive && !reduced && (
              <motion.div
                className="nav-active-dot"
                layoutId="nav-active-indicator"
                style={{
                  position: 'absolute',
                  bottom: -2,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32,
                  height: 4,
                  borderRadius: 2,
                  background: 'var(--color-amber-light)',
                  boxShadow: '0 0 12px var(--color-amber-light)'
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            <span className="nav-item-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
