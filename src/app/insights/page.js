'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  getOfflineEntries, 
  getCachedSyncedEntries 
} from '@/lib/offlineStore';
import { 
  Sparkles, ArrowLeft, Heart, Award, Trophy, Compass,
  BookOpen, Quote, Smile, ShieldCheck, Flame, Moon, WifiOff
} from 'lucide-react';

function InsightsContent() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryId = searchParams.get('entryId');

  const [insight, setInsight] = useState(null);
  const [entryContent, setEntryContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [gaugeProgress, setGaugeProgress] = useState(0);

  // Authentication gate redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  // Check if we just submitted this entry
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const submitted = sessionStorage.getItem('justSubmitted');
      if (submitted === 'true') {
        setJustSubmitted(true);
        sessionStorage.removeItem('justSubmitted');
      }
    }
  }, []);

  // Load entry and insights
  useEffect(() => {
    const fetchInsightDetails = async () => {
      if (!entryId) {
        setError('No cosmic signature specified.');
        setLoading(false);
        return;
      }

      // Handle local-offline entries first
      if (String(entryId).startsWith('offline-')) {
        try {
          const localId = parseInt(String(entryId).replace('offline-', ''), 10);
          const offlineList = await getOfflineEntries();
          const localEntry = offlineList.find(e => e.id === localId);
          
          if (localEntry) {
            setEntryContent(localEntry.content);
            setInsight({
              isOfflinePending: true,
              mood_score: 0,
              dominant_emotion: 'Sync Pending',
              feelings_list: ['Offline Buffer', 'Airplane Mode'],
              summary: 'Your reflection is securely preserved in your local browser vault. As soon as your internet link to the stars is re-established, Gemini AI will analyze your dominant emotion, score your mood, and award your badges!',
              celebration: 'You took care of yourself by journaling offline. Your active streak is protected!',
              improvement: 'Enable your cellular network or connect to Wi-Fi to sync this entry and unlock detailed AI insights.'
            });
          } else {
            setError('Could not locate this offline reflection.');
          }
        } catch (err) {
          console.error(err);
          setError('Failed to retrieve offline reflection.');
        } finally {
          setLoading(false);
        }
        return;
      }

      if (!token) return;

      try {
        if (typeof window !== 'undefined' && !navigator.onLine) {
          throw new Error('Offline');
        }

        const response = await fetch(`/api/entries/${entryId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setEntryContent(data.content);
          setInsight({
            mood_score: data.mood_score,
            dominant_emotion: data.dominant_emotion,
            feelings_list: data.feelings_list,
            summary: data.summary,
            celebration: data.celebration,
            improvement: data.improvement
          });
        } else {
          // If server failed, try to load from local cache as fallback
          const cachedList = await getCachedSyncedEntries();
          const cachedEntry = cachedList.find(e => String(e.id) === String(entryId));
          if (cachedEntry) {
            setEntryContent(cachedEntry.content);
            setInsight({
              mood_score: cachedEntry.mood_score,
              dominant_emotion: cachedEntry.dominant_emotion,
              feelings_list: cachedEntry.feelings_list,
              summary: cachedEntry.summary,
              celebration: cachedEntry.celebration,
              improvement: cachedEntry.improvement,
              isFromCache: true
            });
          } else {
            setError('Could not trace this memory in the stars.');
          }
        }
      } catch (err) {
        console.error(err);
        // Load from local cache fallback
        try {
          const cachedList = await getCachedSyncedEntries();
          const cachedEntry = cachedList.find(e => String(e.id) === String(entryId));
          if (cachedEntry) {
            setEntryContent(cachedEntry.content);
            setInsight({
              mood_score: cachedEntry.mood_score,
              dominant_emotion: cachedEntry.dominant_emotion,
              feelings_list: cachedEntry.feelings_list,
              summary: cachedEntry.summary,
              celebration: cachedEntry.celebration,
              improvement: cachedEntry.improvement,
              isFromCache: true
            });
          } else {
            setError('Star system offline. Could not load insights.');
          }
        } catch (cacheErr) {
          console.error(cacheErr);
          setError('Star system offline. Could not load insights.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token || String(entryId).startsWith('offline-')) {
      fetchInsightDetails();
    }
  }, [entryId, token]);

  // Smooth Gauge Animation
  useEffect(() => {
    if (!loading && insight?.mood_score) {
      const t = setTimeout(() => {
        let start = 0;
        const end = insight.mood_score;
        const duration = 1200; // ms
        const stepTime = 15;
        const totalSteps = duration / stepTime;
        const stepValue = end / totalSteps;

        const timer = setInterval(() => {
          start += stepValue;
          if (start >= end) {
            setGaugeProgress(end);
            clearInterval(timer);
          } else {
            setGaugeProgress(Math.round(start));
          }
        }, stepTime);

        return () => clearInterval(timer);
      }, 200);

      return () => clearTimeout(t);
    }
  }, [loading, insight?.mood_score]);

  // Helper color map
  const getMoodColors = (score, emotion) => {
    const emo = (emotion || '').toLowerCase();
    if (emo.includes('pending') || emo.includes('sync')) {
      return { 
        glowClass: 'glow-purple', 
        primary: 'var(--glow-purple)', 
        rgb: '138, 43, 226',
        bg: 'rgba(138, 43, 226, 0.1)'
      };
    }
    if (emo.includes('joy') || emo.includes('happy') || score >= 80) {
      return { 
        glowClass: 'glow-joy', 
        primary: 'var(--glow-gold)', 
        rgb: '255, 170, 0',
        bg: 'rgba(255, 170, 0, 0.1)'
      };
    }
    if (emo.includes('peace') || emo.includes('calm') || (score >= 60 && score < 80)) {
      return { 
        glowClass: 'glow-peace', 
        primary: 'var(--glow-green)', 
        rgb: '0, 255, 102',
        bg: 'rgba(0, 255, 102, 0.1)'
      };
    }
    if (emo.includes('sad') || score < 40) {
      return { 
        glowClass: 'glow-sadness', 
        primary: 'var(--glow-blue)', 
        rgb: '0, 136, 255',
        bg: 'rgba(0, 136, 255, 0.1)'
      };
    }
    if (emo.includes('fear') || emo.includes('anxious')) {
      return { 
        glowClass: 'glow-fear', 
        primary: 'var(--glow-purple)', 
        rgb: '138, 43, 226',
        bg: 'rgba(138, 43, 226, 0.1)'
      };
    }
    if (emo.includes('anger') || emo.includes('frustrated')) {
      return { 
        glowClass: 'glow-anger', 
        primary: 'var(--glow-pink)', 
        rgb: '255, 0, 127',
        bg: 'rgba(255, 0, 127, 0.1)'
      };
    }
    return { 
      glowClass: 'glow-peace', 
      primary: 'var(--glow-cyan)', 
      rgb: '0, 255, 255',
      bg: 'rgba(0, 255, 255, 0.1)'
    };
  };

  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
        <div className="animate-spin-slow" style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid rgba(255, 255, 255, 0.1)', 
          borderTopColor: 'var(--glow-cyan)',
          borderRadius: '50%',
          display: 'inline-block',
          marginBottom: '16px'
        }} />
        <p>Aligning constellations...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
        <div className="animate-spin-slow" style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid rgba(255, 255, 255, 0.1)', 
          borderTopColor: 'var(--glow-cyan)',
          borderRadius: '50%',
          display: 'inline-block',
          marginBottom: '16px'
        }} />
        <p>Tracing emotional wavelengths...</p>
      </div>
    );
  }

  if (error || !insight) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '0 20px' }}>
        <div className="glass-panel glow-anger" style={{ padding: '40px 24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '12px' }}>Insight Lost</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error || "Could not generate insights."}</p>
          <button onClick={() => router.push('/dashboard')} className="glowing-btn">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { glowClass, primary: moodColor, bg: moodBg, rgb: moodRGB } = getMoodColors(insight.mood_score, insight.dominant_emotion);
  const radius = 60;
  const strokeCircumference = 2 * Math.PI * radius;
  const strokeOffset = strokeCircumference - (strokeCircumference * gaugeProgress) / 100;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px 40px 20px' }}>
      
      {/* Header and Back navigation */}
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
        <span>Return to Dashboard</span>
      </button>

      {/* Just submitted celebration unlock banner */}
      {justSubmitted && (
        <div className="glass-panel glow-joy" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '20px 28px',
          borderRadius: '20px',
          marginBottom: '32px',
          background: 'rgba(255, 170, 0, 0.08)',
          border: '1px solid rgba(255, 170, 0, 0.2)',
          animation: 'pulse-slow 2s infinite'
        }}>
          <div style={{
            background: 'rgba(255, 170, 0, 0.15)',
            padding: '10px',
            borderRadius: '12px',
            color: 'var(--glow-gold)'
          }}>
            <Trophy size={24} />
          </div>
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--glow-gold)' }}>
              Quest Objective Complete!
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Reflection analyzed! You earned <strong style={{ color: '#fff' }}>+100 XP</strong> and advanced your quest. Keep journaling to build your streak!
            </p>
          </div>
        </div>
      )}

      {/* Core Insights Layout */}
      <div className="insights-grid">
        
        {/* Left Column: Mood Score Card & Dominant Emotion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Animated Gauge Card */}
          <div className={`glass-panel ${glowClass}`} style={{
            padding: '40px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: '24px'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '24px' }}>
              Aura Level
            </span>

            {/* Circular Gauge SVG */}
            <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <svg 
                width="160" 
                height="160" 
                className={insight.isOfflinePending ? "animate-spin-slow" : ""} 
                style={{ transform: insight.isOfflinePending ? 'none' : 'rotate(-90deg)', transformOrigin: 'center' }}
              >
                {/* Background track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.04)"
                  strokeWidth="10"
                />
                {/* Progress track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={moodColor}
                  strokeWidth="10"
                  strokeDasharray={insight.isOfflinePending ? "8 6" : strokeCircumference}
                  strokeDashoffset={insight.isOfflinePending ? 0 : strokeOffset}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 0.1s linear',
                    filter: `drop-shadow(0 0 8px ${moodColor})`
                  }}
                />
              </svg>

              {/* Text Score Overlay */}
              <div style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                {insight.isOfflinePending ? (
                  <WifiOff size={40} style={{ color: moodColor, filter: `drop-shadow(0 0 8px ${moodColor})` }} />
                ) : (
                  <>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                      {gaugeProgress}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>
                      Aura Score
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Dominant Emotion Floating Indicator */}
            <div className="animate-pulse-slow" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: moodBg,
              border: `1px solid rgba(${moodRGB}, 0.25)`,
              padding: '10px 20px',
              borderRadius: '24px',
              color: moodColor,
              fontWeight: 700,
              fontSize: '1.25rem',
              fontFamily: 'var(--font-display)',
              boxShadow: `0 0 15px rgba(${moodRGB}, 0.1)`
            }}>
              <Heart size={20} fill={moodColor} />
              <span>{insight.dominant_emotion}</span>
            </div>
          </div>

          {/* Sub feelings pills display */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '16px' }}>
              Sub-Feelings Traced
            </h4>
            {insight.feelings_list && insight.feelings_list.length > 0 ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {insight.feelings_list.map((feel, i) => (
                  <span
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--space-border)',
                      color: '#fff',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}
                  >
                    {feel}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No detailed feelings map could be generated.</p>
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* AI Analysis Summary */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Compass size={22} color="var(--glow-cyan)" />
              Cosmic Reflection Summary
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              marginBottom: '24px',
              fontStyle: 'normal'
            }}>
              {insight.summary || "The stars have gone silent; no summary could be written."}
            </p>

            {/* Original content display accordion-style */}
            {entryContent && (
              <div style={{
                background: 'rgba(0,0,0,0.15)',
                border: '1px solid var(--space-border)',
                borderRadius: '16px',
                padding: '20px'
              }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={12} />
                  Your Captured Thought
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  "{entryContent}"
                </p>
              </div>
            )}
          </div>

          {/* Wins/Celebrations Card */}
          <div className="glass-panel glow-joy" style={{ padding: '32px', borderRadius: '24px', position: 'relative' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Award size={20} color="var(--glow-gold)" />
              Aura Wins to Celebrate
            </h3>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <Quote size={24} color="rgba(255, 170, 0, 0.4)" style={{ transform: 'rotate(180deg)', flexShrink: 0 }} />
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '1.05rem',
                lineHeight: 1.6,
                fontWeight: 500
              }}>
                {insight.celebration || "The stars commend your path. Take credit for taking time for yourself today."}
              </p>
            </div>
          </div>

          {/* Actionable Improvement Challenge */}
          <div className="glass-panel glow-purple" style={{ padding: '32px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ShieldCheck size={20} color="var(--glow-purple)" />
              Celestial Challenge
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.05rem',
              lineHeight: 1.6,
              marginBottom: '16px'
            }}>
              {insight.improvement || "Breathe deeply, align your posture, and drink a glass of water to anchor your mind."}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              color: 'var(--glow-purple)',
              background: 'rgba(138, 43, 226, 0.1)',
              border: '1px solid rgba(138, 43, 226, 0.2)',
              padding: '6px 14px',
              borderRadius: '12px',
              fontWeight: 600
            }}>
              <Moon size={14} />
              <span>Quest Action Item</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AIInsights() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
        <div className="animate-spin-slow" style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid rgba(255, 255, 255, 0.1)', 
          borderTopColor: 'var(--glow-cyan)',
          borderRadius: '50%',
          display: 'inline-block',
          marginBottom: '16px'
        }} />
        <p>Loading celestial insights...</p>
      </div>
    }>
      <InsightsContent />
    </Suspense>
  );
}
