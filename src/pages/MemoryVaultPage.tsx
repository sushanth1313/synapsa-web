import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks';
import { useAppStore } from '../store';
import type { MemoryEntry } from '../types';
import { fadeUp, staggerContainer } from '../tokens/variants';
import './MemoryVaultPage.css';

export const MemoryVaultPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { memories, addMemory, removeMemory } = useAppStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingMemory, setViewingMemory] = useState<MemoryEntry | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [relation, setRelation] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;

    addMemory({
      title,
      description: desc,
      date,
      relation,
      imageUrl
    });

    setIsFormOpen(false);
    setTitle('');
    setDesc('');
    setDate('');
    setRelation('');
    setImageUrl('');
  };

  return (
    <div className="memory-vault-page">
      
      <div className="vault-header">
        <button className="vault-back-btn" onClick={() => navigate('/')}>← Home</button>
      </div>

      <motion.div className="vault-hero" variants={reduced ? {} : staggerContainer} initial="hidden" animate="show">
        <div>
          <motion.h1 className="vault-title" variants={reduced ? {} : fadeUp}>Memory Vault</motion.h1>
          <motion.p className="vault-subtitle body-lg" variants={reduced ? {} : fadeUp}>
            A safe place for your most cherished moments, loved ones, and life events. Tap any memory to experience it.
          </motion.p>
        </div>
        <motion.button className="add-memory-btn" variants={reduced ? {} : fadeUp} onClick={() => setIsFormOpen(true)}>
          <span>+</span> Add Memory
        </motion.button>
      </motion.div>

      <motion.div className="vault-gallery" variants={reduced ? {} : staggerContainer} initial="hidden" animate="show">
        {memories.map(mem => (
          <motion.div 
            key={mem.id} 
            className="memory-card" 
            variants={fadeUp}
            onClick={() => setViewingMemory(mem)}
          >
            {mem.imageUrl ? (
              <div className="mc-image" style={{ backgroundImage: `url(${mem.imageUrl})` }} />
            ) : (
              <div className="mc-image">📸</div>
            )}
            <div className="mc-title">{mem.title}</div>
            <div className="mc-date">{mem.date || 'Timeless'} {mem.relation ? `• ${mem.relation}` : ''}</div>
          </motion.div>
        ))}

        {memories.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px', color: 'var(--bone-dim)' }}>
            Your Memory Vault is empty. Add your first cherished memory to get started.
          </div>
        )}
      </motion.div>

      {/* Add Memory Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.form 
              className="memory-form"
              initial={{ opacity: 0, y: 40, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleAddMemory}
            >
              <h2>Add a New Memory</h2>
              
              <input type="text" className="mf-input" placeholder="Title (e.g. Mary's Wedding)" required value={title} onChange={e => setTitle(e.target.value)} />
              
              <textarea className="mf-input" placeholder="Description or thoughts..." rows={3} required value={desc} onChange={e => setDesc(e.target.value)} />
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <input type="text" className="mf-input" placeholder="Date (e.g. Summer 1995)" value={date} onChange={e => setDate(e.target.value)} />
                <input type="text" className="mf-input" placeholder="Relation (e.g. Daughter)" value={relation} onChange={e => setRelation(e.target.value)} />
              </div>

              <input type="url" className="mf-input" placeholder="Image URL (optional)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />

              <div className="mf-actions">
                <button type="button" className="mf-btn secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="mf-btn primary">Save Memory</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Viewer */}
      <AnimatePresence>
        {viewingMemory && (
          <motion.div 
            className="cinematic-viewer"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <button className="cv-close" onClick={() => setViewingMemory(null)}>✕</button>
            
            {viewingMemory.imageUrl ? (
              <motion.img 
                src={viewingMemory.imageUrl} 
                className="cv-image" 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }}
              />
            ) : (
              <motion.div 
                className="cv-image-placeholder"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }}
              >
                📸
              </motion.div>
            )}

            <motion.div 
              className="cv-text"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1 }}
            >
              <h2 className="cv-title">{viewingMemory.title}</h2>
              <p className="cv-desc">"{viewingMemory.description}"</p>
              <div className="cv-meta">
                {viewingMemory.date || 'Timeless'} {viewingMemory.relation ? `• ${viewingMemory.relation}` : ''}
              </div>
            </motion.div>
            
            <motion.button 
              style={{ position: 'absolute', bottom: '40px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
              onClick={() => {
                if (window.confirm('Delete this memory?')) {
                  removeMemory(viewingMemory.id);
                  setViewingMemory(null);
                }
              }}
            >
              Delete Memory
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
