import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RoutineItem } from '../../types';
import { modalVariants, fadeUp } from '../../tokens/variants';
import './RoutineModal.css';
import { useReducedMotion } from '../../hooks';

interface RoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (routine: Omit<RoutineItem, 'id' | 'userId'>) => void;
  initialData?: RoutineItem;
}

export const RoutineModal: React.FC<RoutineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const reduced = useReducedMotion();

  const [title, setTitle] = useState(initialData?.title || '');
  const [scheduledTime, setScheduledTime] = useState(initialData?.scheduledTime || '09:00');
  const [type, setType] = useState<RoutineItem['type']>(initialData?.type || 'activity');
  const [repeat, setRepeat] = useState<RoutineItem['repeat']>(initialData?.repeat || 'daily');
  const [reminderEnabled, setReminderEnabled] = useState(initialData?.reminderEnabled ?? true);
  const [icon, setIcon] = useState(initialData?.icon || '📌');

  const TYPES = [
    { value: 'medication', label: 'Medication', icon: '💊' },
    { value: 'activity', label: 'Activity', icon: '🧠' },
    { value: 'meal', label: 'Meal', icon: '☕' },
    { value: 'hydration', label: 'Hydration', icon: '💧' },
    { value: 'other', label: 'Other', icon: '📌' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      scheduledTime,
      type,
      repeat,
      reminderEnabled,
      icon,
    });
    
    // Reset form for next time if not editing
    if (!initialData) {
      setTitle('');
      setScheduledTime('09:00');
      setType('activity');
      setIcon('🧠');
      setRepeat('daily');
    }
  };

  const handleTypeSelect = (selectedType: typeof TYPES[0]) => {
    setType(selectedType.value as RoutineItem['type']);
    setIcon(selectedType.icon);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          className="routine-modal"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="routine-modal-header">
            <h2>{initialData ? 'Edit Routine' : 'Add Routine'}</h2>
            <button className="routine-modal-close" onClick={onClose} aria-label="Close modal">×</button>
          </div>

          <form className="routine-modal-form" onSubmit={handleSave}>
            <div className="form-group">
              <label>Routine Title</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Morning Walk"
                autoFocus
                required
              />
            </div>

            <div className="form-group row">
              <div className="form-group-half">
                <label>Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                />
              </div>
              <div className="form-group-half">
                <label>Repeat</label>
                <select 
                  className="form-input" 
                  value={repeat} 
                  onChange={(e) => setRepeat(e.target.value as any)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Category</label>
              <div className="category-selector">
                {TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`category-btn ${type === t.value ? 'category-btn--active' : ''}`}
                    onClick={() => handleTypeSelect(t)}
                  >
                    <span>{t.icon}</span>
                    <span className="category-label">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                />
                <span className="checkbox-text">Enable push reminders</span>
              </label>
            </div>

            <div className="routine-modal-actions">
              <button type="button" className="void-btn void-btn--secondary" onClick={onClose}>
                <span>CANCEL</span><i></i>
              </button>
              <button type="submit" className="void-btn void-btn--primary">
                <span>{initialData ? 'SAVE CHANGES' : 'CREATE ROUTINE'}</span><i></i>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
