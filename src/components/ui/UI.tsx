// ============================================================
// SYNAPSA — Shared UI Components
// Button, Card, ProgressRing, Toast, Modal, StatusIndicator
// ============================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../hooks';
import './UI.css';

// ── Button ────────────────────────────────────────────────────

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  fullWidth?: boolean;
  id?: string;
  'aria-label'?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  fullWidth = false,
  id,
  'aria-label': ariaLabel,
}) => {
  const reduced = useReducedMotion();

  return (
    <motion.button
      id={id}
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={reduced || disabled ? {} : { y: -2, transition: { duration: 0.12 } }}
      whileTap={reduced || disabled ? {} : { scale: 0.97, transition: { duration: 0.08 } }}
    >
      {icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
      <span className="btn-label">{children}</span>
      {icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
    </motion.button>
  );
};

// ── Card ──────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'glass' | 'cultural';
  className?: string;
  id?: string;
  hoverable?: boolean;
  'aria-label'?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onClick,
  variant = 'default',
  className = '',
  id,
  hoverable = !!onClick,
  'aria-label': ariaLabel,
}) => {
  const reduced = useReducedMotion();

  return (
    <motion.div
      id={id}
      className={`card card--${variant} ${hoverable ? 'card--hoverable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      whileHover={reduced || !hoverable ? {} : { y: -4, transition: { duration: 0.2 } }}
      whileTap={reduced || !onClick ? {} : { scale: 0.98, transition: { duration: 0.1 } }}
    >
      {children}
    </motion.div>
  );
};

// ── ProgressRing ──────────────────────────────────────────────

interface ProgressRingProps {
  value: number;        // 0–100
  size?: number;        // px
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 80,
  strokeWidth = 6,
  color = 'var(--color-tea-green)',
  trackColor = 'var(--color-border)',
  label,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className="progress-ring"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
      <div className="progress-ring-content">
        {children ?? (
          <span className="progress-ring-label">
            {Math.round(value)}%
          </span>
        )}
      </div>
    </div>
  );
};

// ── Toast ──────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  onClose?: () => void;
}

export const ToastNotification: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  return (
    <motion.div
      className={`toast toast--${type}`}
      role="alert"
      aria-live="polite"
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onClose}
    >
      {message}
    </motion.div>
  );
};

// ── StatusIndicator ───────────────────────────────────────────

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'syncing' | 'synced';
  label?: string;
}

const statusColors: Record<string, string> = {
  online: '#15803D',
  offline: '#DC2626',
  syncing: '#D97706',
  synced: '#15803D',
};

const statusLabels: Record<string, string> = {
  online: 'Online',
  offline: 'Offline',
  syncing: 'Syncing…',
  synced: 'Synced',
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label }) => {
  return (
    <div className="status-indicator" role="status" aria-label={`Connection: ${statusLabels[status]}`}>
      <motion.span
        className="status-dot"
        style={{ background: statusColors[status] }}
        animate={status === 'syncing' ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <span className="status-label">{label ?? statusLabels[status]}</span>
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {title && <h2 className="modal-title">{title}</h2>}
            <div className="modal-content">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ── Section Title ─────────────────────────────────────────────

export const SectionTitle: React.FC<{
  children: React.ReactNode;
  subtitle?: string;
  center?: boolean;
}> = ({ children, subtitle, center }) => (
  <div className={`section-title ${center ? 'section-title--center' : ''}`}>
    <h2 className="section-title-text">{children}</h2>
    {subtitle && <p className="section-title-sub">{subtitle}</p>}
  </div>
);

// ── Loader ────────────────────────────────────────────────────

export const Loader: React.FC<{ message?: string }> = ({ message = 'Just a moment…' }) => (
  <div className="loader" role="status" aria-label={message}>
    <motion.div
      className="loader-ring"
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
    />
    <p className="loader-message">{message}</p>
  </div>
);

// ── EmptyState ────────────────────────────────────────────────

export const EmptyState: React.FC<{
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon = '🌱', title, description, action }) => (
  <div className="empty-state">
    <motion.div
      className="empty-state-icon"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {icon}
    </motion.div>
    <h3 className="empty-state-title">{title}</h3>
    {description && <p className="empty-state-desc">{description}</p>}
    {action && <div className="empty-state-action">{action}</div>}
  </div>
);
