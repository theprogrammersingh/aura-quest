'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { saveOfflineEntry } from '@/lib/offlineStore';
import ParticleCanvas from '@/components/ParticleCanvas';
import { Sparkles, ArrowLeft, Send, PenTool, BookOpen, AlertTriangle } from 'lucide-react';

const ASTRONOMICAL_QUOTES = [
  "Mapping your emotional constellation...",
  "Consulting the celestial wisdom...",
  "Aligning the orbits of your thoughts...",
  "Synthesizing your spiritual insights...",
  "Tracing the light of your current mood..."
];

export default function JournalEditor() {
  const { token, refreshUser, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState('');
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const editorRef = useRef(null);

  // Authentication gate redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  // Safe online state detection to prevent SSR/CSR hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      
      const goOnline = () => setIsOnline(true);
      const goOffline = () => setIsOnline(false);

      window.addEventListener('online', goOnline);
      window.addEventListener('offline', goOffline);

      return () => {
        window.removeEventListener('online', goOnline);
        window.removeEventListener('offline', goOffline);
      };
    }
  }, []);

  useEffect(() => {
    // Focus editor on mount
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // Update word count
  useEffect(() => {
    const cleanContent = content.trim();
    if (cleanContent.length === 0) {
      setWordCount(0);
    } else {
      setWordCount(cleanContent.split(/\s+/).length);
    }
  }, [content]);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setError('');
    setLoading(true);

    // Pick random loading quote
    setLoadingQuote(ASTRONOMICAL_QUOTES[Math.floor(Math.random() * ASTRONOMICAL_QUOTES.length)]);
    
    // Periodically update quotes during loading
    const quoteInterval = setInterval(() => {
      setLoadingQuote(ASTRONOMICAL_QUOTES[Math.floor(Math.random() * ASTRONOMICAL_QUOTES.length)]);
    }, 3000);

    try {
      if (!isOnline) {
        // Intercept and save offline
        console.log("Browser is offline. Buffering entry locally in IndexedDB...");
        await saveOfflineEntry(content);
        setOfflineSaved(true);
        clearInterval(quoteInterval);
        setLoading(false);
        return;
      }

      // Online: submit to API
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'The cosmos failed to capture your thought.');
      }

      clearInterval(quoteInterval);
      setLoading(false);
      refreshUser();

      // Navigate to AI insights view with the new entry ID
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('justSubmitted', 'true');
      }
      router.push(`/insights?entryId=${data.entry.id}`);
    } catch (err) {
      clearInterval(quoteInterval);
      setLoading(false);
      setError(err.message || 'Network disturbance. Please try again.');
    }
  };

  if (authLoading || (!isAuthenticated && !token)) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div className="animate-spin-slow" style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid rgba(255, 255, 255, 0.1)', 
          borderTopColor: 'var(--glow-cyan)', 
          borderRadius: '50%',
          marginBottom: '16px'
        }} />
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          Aligning constellations...
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px 40px 20px', position: 'relative' }}>
      
      {/* Loading Overlay */}
      {loading && (
        <div className="loader-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(7, 8, 15, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          {/* Particle Star background for loader */}
          <ParticleCanvas speedMultiplier={4} density={60} />
          <div style={{ textAlign: 'center', zIndex: 10, padding: '24px' }}>
            <div className="animate-spin-slow" style={{
              width: '80px',
              height: '80px',
              border: '4px dashed transparent',
              borderTopColor: 'var(--glow-cyan)',
              borderBottomColor: 'var(--glow-pink)',
              borderRadius: '50%',
              display: 'inline-block',
              marginBottom: '28px'
            }} />
            <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              Decoding Aura
            </h2>
            <p className="animate-pulse-slow" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', minHeight: '30px' }}>
              {loadingQuote}
            </p>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          fontSize: '0.95rem',
          marginBottom: '24px',
          padding: '8px 0',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={16} />
        <span>Return to Orbit</span>
      </button>

      {/* Editor Screen */}
      {offlineSaved ? (
        <div className="glass-panel glow-purple" style={{ textAlign: 'center', padding: '60px 40px', borderRadius: '24px' }}>
          <div className="animate-float" style={{
            display: 'inline-flex',
            background: 'rgba(138, 43, 226, 0.15)',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            color: 'var(--glow-purple)',
            padding: '20px',
            borderRadius: '50%',
            marginBottom: '24px'
          }}>
            <BookOpen size={48} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '12px' }}>
            Reflection Cast Offline
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 32px auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Your connection to the internet is offline. AuraQuest has safely buffered your journal entry in your local browser's IndexedDB. As soon as you step back online, we will automatically sync it to analyze your mood!
          </p>
          <button onClick={() => router.push('/dashboard')} className="glowing-btn">
            Proceed to Dashboard
          </button>
        </div>
      ) : (
        <div className="glass-panel" style={{
          padding: '40px 32px',
          borderRadius: '24px',
          border: '1px solid var(--space-border)',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'rgba(0, 255, 255, 0.1)',
                border: '1px solid rgba(0, 255, 255, 0.2)',
                color: 'var(--glow-cyan)',
                padding: '8px',
                borderRadius: '12px'
              }}>
                <PenTool size={20} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', lineHeight: 1.2 }}>New Reflection</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pour your mind without judgement.</p>
              </div>
            </div>

            {/* Offline status indicator */}
            {!isOnline && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--glow-gold)',
                background: 'rgba(255, 170, 0, 0.1)',
                border: '1px solid rgba(255, 170, 0, 0.2)',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}>
                <AlertTriangle size={14} />
                <span>Offline Sync Ready</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Editor Area */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Close your eyes, breathe, and write how you truly feel right now..."
                style={{
                  width: '100%',
                  minHeight: '300px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--space-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  color: 'var(--text-primary)',
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.7,
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--glow-cyan)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.target.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--space-border)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={loading}
              />
            </div>

            {/* Error alerts */}
            {error && (
              <div style={{
                color: 'var(--glow-pink)',
                fontSize: '0.9rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Footer controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--space-border)',
              paddingTop: '20px'
            }}>
              {/* Word Count */}
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{wordCount}</span> words
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="glowing-btn"
                disabled={!content.trim() || loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px'
                }}
              >
                <span>{isOnline ? 'Decode Aura' : 'Save Offline'}</span>
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
