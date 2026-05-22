'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ParticleCanvas from '@/components/ParticleCanvas';
import { Sparkles, Mail, Lock, User, ShieldAlert, ArrowRight } from 'lucide-react';

export default function Auth() {
  const { login, register, isAuthenticated, error: authError } = useAuth();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Input Validation
    if (!username || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isLogin) {
      if (!email) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, email, password);
      }
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dynamic Star particles background */}
      <ParticleCanvas density={60} />

      <div className="glass-panel auth-card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '40px 32px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 10,
        position: 'relative'
      }}>
        {/* Decorative Celestial Accent Glow */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(138, 43, 226, 0.15)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          left: '-50px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(0, 255, 255, 0.1)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        {/* Branding header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--glow-purple), var(--glow-pink))',
            boxShadow: '0 0 20px rgba(138, 43, 226, 0.5)',
            marginBottom: '16px'
          }}>
            <Sparkles size={28} color="#fff" />
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            background: 'linear-gradient(90deg, #ffffff, #a0a6c0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '4px'
          }}>
            AuraQuest
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {isLogin ? 'Ascend into self-awareness' : 'Begin your celestial quest of self-reflection'}
          </p>
        </div>

        {/* Tab selector */}
        <div className="tabs-container" style={{ marginBottom: '28px' }}>
          <button
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
          >
            Create Account
          </button>
        </div>

        {/* Form Alerts */}
        {(error || authError) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 0, 127, 0.1)',
            border: '1px solid rgba(255, 0, 127, 0.25)',
            color: '#ff4da6',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Username Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Username or Email
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <User size={18} />
              </span>
              <input
                type="text"
                className="celestial-input"
                style={{ paddingLeft: '48px' }}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Email Input (Signup only) */}
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  className="celestial-input"
                  style={{ paddingLeft: '48px' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Password Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                className="celestial-input"
                style={{ paddingLeft: '48px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirm Password (Signup only) */}
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  className="celestial-input"
                  style={{ paddingLeft: '48px' }}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="glowing-btn"
            disabled={loading}
            style={{
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px'
            }}
          >
            <span>{loading ? 'Aligning Stars...' : isLogin ? 'Enter AuraQuest' : 'Begin Quest'}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
