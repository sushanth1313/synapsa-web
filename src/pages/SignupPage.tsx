import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { AuthService } from '../services';
import { fadeUp } from '../tokens/variants';
import './Auth.css';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAppStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.setAttribute('data-hide-nav', 'true');
    return () => {
      document.body.removeAttribute('data-hide-nav');
    }
  }, []);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const user = AuthService.register(name, email);
      setCurrentUser(user);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
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
          <h1>Create your account</h1>
          <p>Begin your personal memory journey.</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Rahul"
            />
          </div>
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
            <span>CREATE MY ACCOUNT →</span><i></i>
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? 
          <button className="auth-link" onClick={() => navigate('/login')}>Sign in</button>
        </div>
      </motion.div>
    </div>
  );
};
