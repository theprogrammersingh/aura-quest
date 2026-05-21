'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getOfflineEntries } from '@/lib/offlineStore';
import { 
  Sparkles, Flame, Plus, ChevronRight, AlertCircle, 
  Trash2, BrainCircuit, Heart, Calendar, Smile, RefreshCw
} from 'lucide-react';

export default function Dashboard() {
  const { user, token, refreshUser, syncNotification, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [entries, setEntries] = useState([]);
  const [offlineCount, setOfflineCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Authentication gate redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch entries
  const fetchEntries = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/entries', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      } else {
        setError('Could not retrieve entries from the stars.');
      }
    } catch (err) {
      console.error(err);
      setError('Running in celestial offline mode.');
    } finally {
      setLoading(false);
    }
  };

  // Check offline store
  const checkOfflineStore = async () => {
    try {
      const offline = await getOfflineEntries();
      setOfflineCount(offline.length);
    } catch (err) {
      console.error('Failed to access offline storage:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchEntries();
      checkOfflineStore();
      refreshUser();
    }
  }, [token, syncNotification]);

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to erase this memory from your quest?")) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setEntries(entries.filter(e => e.id !== id));
        refreshUser();
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // Helper to map mood score to glowing class
  const getMoodGlowClass = (score, emotion) => {
    const emo = (emotion || '').toLowerCase();
    if (emo.includes('joy') || emo.includes('happy') || score >= 80) return 'glow-joy';
    if (emo.includes('peace') || emo.includes('calm') || (score >= 60 && score < 80)) return 'glow-peace';
    if (emo.includes('sad') || score < 40) return 'glow-sadness';
    if (emo.includes('fear') || emo.includes('anxious')) return 'glow-fear';
    if (emo.includes('anger') || emo.includes('frustrated')) return 'glow-anger';
    return 'glow-peace'; // fallback
  };

  const getMoodColor = (score, emotion) => {
    const emo = (emotion || '').toLowerCase();
    if (emo.includes('joy') || emo.includes('happy') || score >= 80) return 'var(--glow-gold)';
    if (emo.includes('peace') || emo.includes('calm') || (score >= 60 && score < 80)) return 'var(--glow-green)';
    if (emo.includes('sad') || score < 40) return 'var(--glow-blue)';
    if (emo.includes('fear') || emo.includes('anxious')) return 'var(--glow-purple)';
    if (emo.includes('anger') || emo.includes('frustrated')) return 'var(--glow-pink)';
    return 'var(--glow-cyan)';
  };

  // Calculate weekly mood average
  const getWeeklyStats = () => {
    const validScores = entries
      .slice(0, 7)
      .map(e => e.mood_score)
      .filter(s => s !== undefined && s !== null);

    if (validScores.length === 0) return { avg: 0, count: 0, label: 'N/A' };
    
    const sum = validScores.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / validScores.length);
    
    let label = 'Balanced';
    let color = 'var(--glow-green)';
    if (avg >= 80) { label = 'Radiant'; color = 'var(--glow-gold)'; }
    else if (avg >= 60) { label = 'Peaceful'; color = 'var(--glow-green)'; }
    else if (avg >= 40) { label = 'Contemplative'; color = 'var(--glow-blue)'; }
    else { label = 'Turbulent'; color = 'var(--glow-pink)'; }

    return { avg, count: validScores.length, label, color };
  };

  const weeklyStats = getWeeklyStats();
  const weeklyStrokeDash = 2 * Math.PI * 50; // circumference for radius=50
  const weeklyStrokeOffset = weeklyStrokeDash - (weeklyStrokeDash * weeklyStats.avg) / 100;

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px' }}>
      
      {/* Offline entries notification banner */}
      {offlineCount > 0 && (
        <div className="glass-panel glow-fear" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderRadius: '16px',
          marginBottom: '24px',
          background: 'rgba(138, 43, 226, 0.1)',
          border: '1px solid rgba(138, 43, 226, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} color="var(--glow-purple)" />
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Offline Journal Entries Cached ({offlineCount})</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                They will sync automatically as soon as your link to the stars is re-established.
              </p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/new-entry')} 
            className="glowing-btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Manage Buffer
          </button>
        </div>
      )}

      {/* Sync Success notification alert toast */}
      {syncNotification && (
        <div className="glass-panel glow-peace" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 24px',
          borderRadius: '16px',
          marginBottom: '24px',
          background: 'rgba(0, 255, 102, 0.08)',
          border: '1px solid rgba(0, 255, 102, 0.25)',
          animation: 'pulse-slow 2s infinite'
        }}>
          <Sparkles size={20} color="var(--glow-green)" />
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--glow-green)' }}>Sync Synchronized!</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {syncNotification.message}
            </p>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '6px' }}>
            Welcome back, <span style={{
              background: 'linear-gradient(90deg, #fff, var(--glow-cyan))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>{user?.username || 'AuraJournaler'}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Your emotional cosmos is shifting. Discover your aura and earn XP.
          </p>
        </div>
        <Link href="/new-entry" className="glowing-btn" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none'
        }}>
          <Plus size={20} />
          <span>Capture Aura</span>
        </Link>
      </div>

      <div className="dashboard-grid">
        
        {/* Left Column: Entries Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrainCircuit size={20} color="var(--glow-purple)" />
                Recent Reflections
              </h3>
              <button 
                onClick={fetchEntries}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} />
                <span style={{ fontSize: '0.8rem' }}>Refresh</span>
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                <div className="animate-spin-slow" style={{ 
                  width: '30px', 
                  height: '30px', 
                  border: '3px solid rgba(255, 255, 255, 0.1)', 
                  borderTopColor: 'var(--glow-purple)',
                  borderRadius: '50%',
                  display: 'inline-block',
                  marginBottom: '12px'
                }} />
                <p>Retrieving ancient memories...</p>
              </div>
            ) : entries.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                background: 'rgba(0,0,0,0.15)',
                borderRadius: '16px',
                border: '1px dashed var(--space-border)'
              }}>
                <Smile size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Your journal is completely silent</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto 20px auto' }}>
                  Write your first entry, and our Gemini AI will map your dominant emotions, score your mood, and award your first badges!
                </p>
                <Link href="/new-entry" className="glowing-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                  Begin Quest
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {entries.map((entry) => {
                  const moodColor = getMoodColor(entry.mood_score, entry.dominant_emotion);
                  const glowClass = getMoodGlowClass(entry.mood_score, entry.dominant_emotion);
                  
                  return (
                    <div 
                      key={entry.id} 
                      className={`glass-panel ${glowClass}`} 
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        cursor: 'pointer'
                      }}
                      onClick={() => router.push(`/insights?entryId=${entry.id}`)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                        {/* Header Details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Circle mood score badge */}
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: `rgba(${entry.mood_score >= 80 ? 'var(--mood-joy)' : entry.mood_score >= 60 ? 'var(--mood-peace)' : '0, 136, 255'}, 0.1)`,
                            border: `2px solid ${moodColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: moodColor,
                            fontSize: '0.95rem'
                          }}>
                            {entry.mood_score || '??'}
                          </div>
                          <div>
                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {entry.dominant_emotion || 'AI Processing'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Calendar size={12} />
                              {new Date(entry.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Expand & Delete Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            disabled={deletingId === entry.id}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--glow-pink)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                            title="Erase Memory"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => router.push(`/insights?entryId=${entry.id}`)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Content excerpt */}
                      <p style={{ 
                        color: 'var(--text-secondary)', 
                        fontSize: '0.95rem',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {entry.content}
                      </p>

                      {/* Feelings sub-list pills */}
                      {entry.feelings_list && entry.feelings_list.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                          {entry.feelings_list.map((feel, i) => (
                            <span 
                              key={i} 
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid var(--space-border)',
                                padding: '3px 10px',
                                borderRadius: '20px'
                              }}
                            >
                              {feel}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Weekly Mood Ring Visualizer */}
          <div className="glass-panel" style={{
            padding: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', alignSelf: 'flex-start' }}>
              <Heart size={18} color="var(--glow-pink)" />
              Weekly Mood Ring
            </h3>

            {weeklyStats.count > 0 ? (
              <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Track ring */}
                  <circle
                    cx="65"
                    cy="65"
                    r="50"
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="8"
                  />
                  {/* Progress ring */}
                  <circle
                    cx="65"
                    cy="65"
                    r="50"
                    fill="transparent"
                    stroke={weeklyStats.color}
                    strokeWidth="8"
                    strokeDasharray={weeklyStrokeDash}
                    strokeDashoffset={weeklyStrokeOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                  />
                </svg>
                
                {/* Center score */}
                <div style={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                    {weeklyStats.avg}%
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600, textTransform: 'uppercase' }}>
                    Score
                  </span>
                </div>
              </div>
            ) : (
              <div style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                border: '2px dashed var(--space-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
              }}>
                No Data
              </div>
            )}

            <h4 style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: 700, 
              color: weeklyStats.count > 0 ? '#fff' : 'var(--text-muted)',
              fontSize: '1.2rem',
              marginTop: '16px'
            }}>
              {weeklyStats.label} Aura
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              {weeklyStats.count > 0 
                ? `Calculated from your past ${weeklyStats.count} entries.` 
                : 'Complete entries to generate your mood ring.'
              }
            </p>
          </div>

          {/* Gamified Streak visualizer card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <Flame size={18} color="var(--glow-gold)" />
              Quest Streak
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="animate-float" style={{
                background: 'rgba(255, 170, 0, 0.15)',
                border: '1px solid rgba(255, 170, 0, 0.3)',
                padding: '16px',
                borderRadius: '16px',
                color: 'var(--glow-gold)'
              }}>
                <Flame size={32} fill="var(--glow-gold)" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                  {user?.current_streak || 0} Days
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Current active streak. Keep writing!
                </p>
              </div>
            </div>

            <div style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--space-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.9rem'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>Longest Streak:</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff' }}>
                {user?.longest_streak || 0} days
              </span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
