import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { AuthService } from '../services';
import { fadeUp } from '../tokens/variants';
import './Auth.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUser, fetchRoutines } = useAppStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.setAttribute('data-hide-nav', 'true');
    return () => {
      document.body.removeAttribute('data-hide-nav');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // For demo purposes, we only check email since it's local storage
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    const user = AuthService.login(email);
    if (user) {
      setCurrentUser(user);
      fetchRoutines();
      navigate('/');
    } else {
      setError('Account not found. Please create an account.');
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        className="auth-container"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Your memory journey continues.</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="void-btn void-btn--primary auth-submit-btn">
            <span>SIGN IN →</span><i></i>
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? 
          <button className="auth-link" onClick={() => navigate('/signup')}>Create account</button>
        </div>
      </motion.div>
    </div>
  );
};
