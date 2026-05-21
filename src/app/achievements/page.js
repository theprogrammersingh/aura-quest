'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Trophy, Star, Calendar, Lock, Unlock, 
  Flame, Award, ShieldAlert, Heart, Users
} from 'lucide-react';

const BADGE_ICONS = {
  first_entry: { icon: Star, color: 'var(--glow-cyan)', bg: 'rgba(0, 255, 255, 0.15)', glow: 'glow-peace' },
  streak_3: { icon: Flame, color: 'var(--glow-gold)', bg: 'rgba(255, 170, 0, 0.15)', glow: 'glow-joy' },
  streak_7: { icon: Trophy, color: 'var(--glow-gold)', bg: 'rgba(255, 170, 0, 0.25)', glow: 'glow-joy' },
  mood_master: { icon: Heart, color: 'var(--glow-pink)', bg: 'rgba(255, 0, 127, 0.15)', glow: 'glow-anger' },
  social_butterfly: { icon: Users, color: 'var(--glow-purple)', bg: 'rgba(138, 43, 226, 0.15)', glow: 'glow-fear' },
  xp_1000: { icon: Award, color: 'var(--glow-cyan)', bg: 'rgba(0, 255, 255, 0.25)', glow: 'glow-peace' }
};

export default function Achievements() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [unlocked, setUnlocked] = useState([]);
  const [locked, setLocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Authentication gate redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchAchievements = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/achievements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUnlocked(data.unlocked || []);
        setLocked(data.locked || []);
      } else {
        setError('Failed to fetch achievements from the cosmos.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection with achievements database lost.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAchievements();
    }
  }, [token]);

  // Format date
  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Unlocked percentage
  const totalBadgesCount = unlocked.length + locked.length;
  const progressPercent = totalBadgesCount > 0 ? Math.round((unlocked.length / totalBadgesCount) * 100) : 0;

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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px 40px 20px' }}>
      
      {/* Header and Quest Progress */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '6px' }}>Quest Badges</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track your milestones and unlock legendary journal achievements.
          </p>
        </div>

        {/* Progress Card */}
        <div className="glass-panel" style={{
          padding: '16px 24px',
          borderRadius: '16px',
          minWidth: '240px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Quest Progress</span>
            <span style={{ color: 'var(--glow-cyan)' }}>{unlocked.length} / {totalBadgesCount} Unlocked</span>
          </div>
          <div style={{
            height: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, var(--glow-cyan), var(--glow-purple))',
              borderRadius: '4px',
              transition: 'width 0.8s ease-out'
            }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Complete actions to reveal locked badges.
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
          <div className="animate-spin-slow" style={{ 
            width: '35px', 
            height: '35px', 
            border: '3px solid rgba(255, 255, 255, 0.1)', 
            borderTopColor: 'var(--glow-cyan)',
            borderRadius: '50%',
            display: 'inline-block',
            marginBottom: '12px'
          }} />
          <p>Revealing earned badges...</p>
        </div>
      ) : error ? (
        <div className="glass-panel glow-anger" style={{ textAlign: 'center', padding: '40px' }}>
          <ShieldAlert size={36} color="var(--glow-pink)" style={{ marginBottom: '12px', display: 'inline-block' }} />
          <p>{error}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Unlocked Badges section */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Unlock size={18} color="var(--glow-green)" />
              Unlocked Achievements ({unlocked.length})
            </h3>

            {unlocked.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', padding: '16px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', border: '1px dashed var(--space-border)' }}>
                No badges earned yet. Write a journal entry to claim your first one!
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {unlocked.map((badge) => {
                  const meta = BADGE_ICONS[badge.badge_key] || { icon: Star, color: '#fff', bg: 'rgba(255,255,255,0.05)', glow: '' };
                  const Icon = meta.icon;
                  return (
                    <div 
                      key={badge.badge_key} 
                      className={`glass-panel ${meta.glow}`}
                      style={{
                        padding: '24px',
                        borderRadius: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s',
                        cursor: 'default'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          background: meta.bg,
                          border: `1px solid rgba(255,255,255,0.08)`,
                          padding: '12px',
                          borderRadius: '16px',
                          color: meta.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 0 15px rgba(255,255,255,0.02)`
                        }}>
                          <Icon size={24} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>{badge.title}</h4>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--glow-green)', 
                            background: 'rgba(0, 255, 102, 0.08)', 
                            padding: '2px 8px', 
                            borderRadius: '10px', 
                            border: '1px solid rgba(0, 255, 102, 0.15)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '4px'
                          }}>
                            <Calendar size={12} />
                            {formatDate(badge.unlocked_at)}
                          </span>
                        </div>
                      </div>

                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        {badge.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Locked Badges section */}
          {locked.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} color="var(--text-muted)" />
                Locked Achievements ({locked.length})
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {locked.map((badge) => {
                  const meta = BADGE_ICONS[badge.badge_key] || { icon: Star, color: '#646a8a', bg: 'rgba(255,255,255,0.02)' };
                  const Icon = meta.icon;
                  return (
                    <div 
                      key={badge.badge_key} 
                      className="glass-panel"
                      style={{
                        padding: '24px',
                        borderRadius: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        opacity: 0.5,
                        cursor: 'not-allowed',
                        border: '1px dashed var(--space-border)',
                        background: 'rgba(0, 0, 0, 0.25)',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.75'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px dashed var(--space-border)',
                          padding: '12px',
                          borderRadius: '16px',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          <Icon size={24} />
                          <div style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            background: '#07070f',
                            borderRadius: '50%',
                            padding: '2px',
                            border: '1px solid var(--space-border)',
                            color: 'var(--text-muted)'
                          }}>
                            <Lock size={10} />
                          </div>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{badge.title}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Locked Objective</span>
                        </div>
                      </div>

                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        {badge.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}
