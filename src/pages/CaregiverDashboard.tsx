import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAppStore } from '../store';
import { useAnimatedValue, useReducedMotion } from '../hooks';
import { fadeUp } from '../tokens/variants';
import { DatabaseService } from '../services';
import type { RoutineItem } from '../types';
import './CaregiverDashboard.css';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CaregiverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { caregiverData, currentUser } = useAppStore();
  const patientName = currentUser?.name || 'Explorer';
  const reduced = useReducedMotion();

  // Pin Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cgId, setCgId] = useState('cg-1');
  const [pin, setPin] = useState('');
  
  // Dashboard state
  const [difficulty, setDifficulty] = useState<'EASY'|'MEDIUM'|'HARD'>('MEDIUM');
  
  const [reminders, setReminders] = useState<RoutineItem[]>([]);
  
  const [searchPatientId, setSearchPatientId] = useState('patient-1');
  const [patientData, setPatientData] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      // Mock loading reminders for UI demo purposes
      setReminders(DatabaseService.getRoutines(searchPatientId));
    }
  }, [isAuthenticated, searchPatientId]);

  const loadPatientData = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setApiError(null);
    try {
      const res = await fetch(`/api/patient/${searchPatientId}`, {
        headers: {
          'x-caregiver-id': cgId
        }
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || 'Failed to load patient data');
        setPatientData(null);
      } else {
        setPatientData(data.data);
      }
    } catch (err) {
      setApiError('Network error connecting to server');
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) loadPatientData();
  }, [isAuthenticated]);

  const [newRemText, setNewRemText] = useState('');
  const [newRemTime, setNewRemTime] = useState('');

  const animAccuracy = useAnimatedValue(caregiverData.memoryAccuracy, 1200);
  const animAdherence = useAnimatedValue(caregiverData.routineAdherence, 1200);

  const weeklyData = caregiverData.weeklyTrend.map((score, i) => ({
    day: WEEK_DAYS[i],
    score,
  }));

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') { // Mock PIN
      setIsAuthenticated(true);
    } else {
      alert('Incorrect PIN. (Hint: 1234)');
    }
  };

  const addReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemText || !newRemTime || !currentUser) return;
    
    const newRoutine: Omit<RoutineItem, 'id'> = {
      userId: currentUser.id,
      title: newRemText,
      scheduledTime: newRemTime,
      type: 'other',
      repeat: 'daily',
      reminderEnabled: true
    };
    
    const saved = DatabaseService.saveRoutine(newRoutine);
    setReminders([...reminders, saved]);
    setNewRemText('');
    setNewRemTime('');
  };

  const removeReminder = (id: string) => {
    DatabaseService.deleteRoutine(id);
    setReminders(reminders.filter(r => r.id !== id));
  };

  if (!isAuthenticated) {
    return (
      <div className="cg-auth-gate">
        <form className="cg-auth-box" onSubmit={handlePinSubmit}>
          <h2>Caregiver Access</h2>
          <p>Please enter your Caregiver ID and PIN to access sensitive health and progress data.</p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input 
              type="text" 
              className="cg-pin-input" 
              placeholder="Caregiver ID"
              value={cgId}
              onChange={e => setCgId(e.target.value)}
              style={{ flex: 1, fontSize: '16px' }}
            />
            <input 
              type="password" 
              className="cg-pin-input" 
              autoFocus 
              maxLength={4}
              placeholder="PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              style={{ flex: 1, fontSize: '16px' }}
            />
          </div>
          <button type="submit" className="add-rem-btn" style={{ padding: '16px 48px', fontSize: '18px', width: '100%' }}>Unlock</button>
          
          <button type="button" onClick={() => navigate('/')} style={{ display: 'block', margin: '24px auto 0', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
            Return to Home
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="dashboard-page" id="caregiver-dashboard">
      
      <div className="dashboard-header">
        <button className="game-back-btn" onClick={() => navigate('/')}>
          ← Exit Dashboard
        </button>
      </div>

      <div className="dashboard-split">
        {/* Left: Key Metrics */}
        <motion.div variants={reduced ? {} : fadeUp} initial="hidden" animate="show">
          <div className="eyebrow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><div className="dot"></div> CAREGIVER ID: {cgId}</span>
          </div>

          <form onSubmit={loadPatientData} style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <input 
              type="text"
              value={searchPatientId}
              onChange={e => setSearchPatientId(e.target.value)}
              className="cg-pin-input"
              style={{ flex: 1, margin: 0, padding: '10px', fontSize: '14px' }}
              placeholder="Enter Patient ID (e.g. patient-1)"
            />
            <button type="submit" className="add-rem-btn" style={{ padding: '0 20px', borderRadius: '8px' }}>Load</button>
          </form>

          {apiError && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', borderRadius: '8px', color: '#EF4444' }}>
              🔒 <strong>Access Denied:</strong> {apiError}
            </div>
          )}

          {patientData && (
            <>
              <div className="cur-head" style={{ marginTop: '24px' }}>
                <h2 className="h-sec jp">{patientData.name}'s Health.</h2>
                <div className="rule"></div>
              </div>
              
              <div className="cur">
            <div className="les">
              <div className="k">01</div>
              <h3>Memory <em>記憶</em></h3>
              <p>Overall memory performance</p>
              <div className="t">{Math.round(animAccuracy)}%</div>
              <div className="bar" style={{ width: `${animAccuracy}%` }}></div>
            </div>

            <div className="les">
              <div className="k">02</div>
              <h3>Attention <em>注意</em></h3>
              <p>Focus and sustained attention</p>
              <div className="t">{Math.round(animAdherence)}%</div>
              <div className="bar" style={{ width: `${animAdherence}%` }}></div>
            </div>

            <div className="les">
              <div className="k">03</div>
              <h3>Recognition <em>認識</em></h3>
              <p>Pattern & object recognition</p>
              <div className="t">91%</div>
              <div className="bar" style={{ background: 'var(--color-tea-green)', width: '91%' }}></div>
            </div>
            
            <div className="les">
              <div className="k">04</div>
              <h3>Activities <em>活動</em></h3>
              <p>Daily routines completed</p>
              <div className="t" style={{ color: 'var(--bone)' }}>
                {reminders.filter(r => r.completedAt).length} / {reminders.length || 1}
              </div>
              <div className="bar" style={{ background: 'var(--color-tea-green)', width: `${reminders.length ? (reminders.filter(r => r.completedAt).length / reminders.length) * 100 : 0}%` }}></div>
            </div>
          </div>
          </>
          )}
        </motion.div>

        {/* Right: Charts & Controls */}
        <motion.div variants={reduced ? {} : fadeUp} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div className="eyebrow"><div className="dot"></div> TRENDS</div>
          <div className="cur-head">
            <h2 className="h-sec jp">7-Day Activity.</h2>
            <div className="rule"></div>
          </div>

          <div style={{ width: '100%', height: '300px', position: 'relative', background: 'rgba(10, 15, 20, 0.4)', borderRadius: '24px', padding: '24px' }}>
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--vermilion)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--vermilion)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'var(--muted)', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(5,7,10,0.9)', border: '1px solid var(--line-soft)', color: 'var(--bone)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--vermilion)' }}
                />
                <Area type="monotone" dataKey="score" stroke="var(--vermilion)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Controls section */}
          <div style={{ display: 'flex', gap: '32px', marginTop: '16px', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ marginBottom: '16px' }}><div className="dot"></div> CONFIGURATION</div>
              <h3 style={{ fontSize: '24px', color: 'var(--bone)', marginBottom: '16px' }}>App Difficulty</h3>
              
              <div className="difficulty-selector">
                <button className={`diff-btn ${difficulty === 'EASY' ? 'active' : ''}`} onClick={() => setDifficulty('EASY')}>Easy (Fewer items)</button>
                <button className={`diff-btn ${difficulty === 'MEDIUM' ? 'active' : ''}`} onClick={() => setDifficulty('MEDIUM')}>Medium (Standard)</button>
                <button className={`diff-btn ${difficulty === 'HARD' ? 'active' : ''}`} onClick={() => setDifficulty('HARD')}>Hard (Fast/Complex)</button>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                Adjusting this will scale the number of items and speed across all cognitive games.
              </p>
            </div>

            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ marginBottom: '16px' }}><div className="dot"></div> PATIENT NOTICES</div>
              <h3 style={{ fontSize: '24px', color: 'var(--bone)', marginBottom: '16px' }}>Daily Reminders</h3>
              
              <div className="reminder-list">
                {reminders.map(r => (
                  <div key={r.id} className="reminder-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ 
                      color: r.completedAt ? 'var(--color-tea-green)' : 'var(--bone)' 
                    }}>
                      {r.completedAt ? '✓' : '○'}
                    </span>
                    <span className="rem-text" style={{ flex: 1, color: r.completedAt ? 'var(--muted)' : 'var(--bone)', textDecoration: r.completedAt ? 'line-through' : 'none' }}>
                      {r.title}
                    </span>
                    <span className="rem-time" style={{ color: 'var(--muted)', fontSize: '12px' }}>{r.scheduledTime}</span>
                    <button className="rem-del" onClick={() => removeReminder(r.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
                {reminders.length === 0 && <div style={{ color: 'var(--muted)' }}>No active routines.</div>}
              </div>

              <form className="add-reminder-form" onSubmit={addReminder}>
                <input type="text" className="add-rem-input" placeholder="e.g. Drink water" value={newRemText} onChange={e => setNewRemText(e.target.value)} />
                <input type="text" className="add-rem-time" placeholder="02:00 PM" value={newRemTime} onChange={e => setNewRemTime(e.target.value)} />
                <button type="submit" className="add-rem-btn">+</button>
              </form>
            </div>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
};
