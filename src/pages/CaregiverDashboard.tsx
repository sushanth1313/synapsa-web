import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  XAxis, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { useAppStore } from '../store';
import { useAnimatedValue, useReducedMotion } from '../hooks';
import { fadeUp } from '../tokens/variants';
import './CaregiverDashboard.css';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CaregiverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { caregiverData } = useAppStore();
  const reduced = useReducedMotion();

  const animAccuracy = useAnimatedValue(caregiverData.memoryAccuracy, 1200);
  const animAdherence = useAnimatedValue(caregiverData.routineAdherence, 1200);

  const weeklyData = caregiverData.weeklyTrend.map((score, i) => ({
    day: WEEK_DAYS[i],
    score,
  }));

  return (
    <div className="dashboard-page" id="caregiver-dashboard">
      <div className="dashboard-header">
        <button className="game-back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>
      </div>

      <div className="dashboard-split">
        {/* Left: Kage Curriculum Layout */}
        <motion.div
          variants={reduced ? {} : fadeUp}
          initial="hidden"
          animate="show"
        >
          <div className="eyebrow"><div className="dot"></div> OVERVIEW</div>
          <div className="cur-head" style={{ marginTop: '24px' }}>
            <h2 className="h-sec jp">Cognitive Health.</h2>
            <div className="rule"></div>
          </div>
          
          <div className="cur">
            <div className="les">
              <div className="k">01</div>
              <h3>Memory Accuracy <em>記憶</em></h3>
              <p>Overall performance</p>
              <div className="t">{Math.round(animAccuracy)}%</div>
              <div className="bar"></div>
            </div>

            <div className="les">
              <div className="k">02</div>
              <h3>Routine Adherence <em>日常</em></h3>
              <p>Daily medication & habits</p>
              <div className="t">{Math.round(animAdherence)}%</div>
              <div className="bar"></div>
            </div>

            <div className="les">
              <div className="k">03</div>
              <h3>Active Alerts <em>警告</em></h3>
              <p>{caregiverData.alerts.length > 0 ? caregiverData.alerts[0].message : "No active alerts"}</p>
              <div className="t">{caregiverData.alerts.length}</div>
              <div className="bar"></div>
            </div>
          </div>
        </motion.div>

        {/* Right: Massive Charts */}
        <motion.div
          variants={reduced ? {} : fadeUp}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '24px' }}
        >
          <div className="eyebrow"><div className="dot"></div> TREND</div>
          <div className="cur-head">
            <h2 className="h-sec jp">7-Day Activity.</h2>
            <div className="rule"></div>
          </div>

          <div style={{ width: '100%', height: '400px', position: 'relative' }}>
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
                  contentStyle={{ backgroundColor: 'rgba(5,7,10,0.9)', border: '1px solid var(--line-soft)', color: 'var(--bone)', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: 'var(--vermilion)' }}
                />
                <Area type="monotone" dataKey="score" stroke="var(--vermilion)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
