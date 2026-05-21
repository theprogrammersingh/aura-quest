'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Flame, Sparkles, Trophy, Users, Edit3, LogOut, WifiOff, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  if (!isAuthenticated) return null;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/new-entry', label: 'Write Entry', icon: Edit3 },
    { path: '/social', label: 'Social Hub', icon: Users },
    { path: '/achievements', label: 'Achievements', icon: Trophy }
  ];

  // Calculate XP percentage to next level (500 XP per level)
  const xpInCurrentLevel = user?.xp ? (user.xp % 500) : 0;
  const xpProgressPercent = Math.min((xpInCurrentLevel / 500) * 100, 100);

  return (
    <nav className="glass-panel" style={{
      borderRadius: '0 0 24px 24px',
      margin: '0 auto 24px auto',
      maxWidth: '1200px',
      padding: '16px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      zIndex: 100,
      position: 'sticky',
      top: 0
    }}>
      {/* Brand Logo */}
      <Link href="/dashboard" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        color: '#fff'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--glow-purple), var(--glow-pink))',
          borderRadius: '50%',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(138, 43, 226, 0.4)'
        }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '1.4rem',
          letterSpacing: '0.05em',
          background: 'linear-gradient(90deg, #fff, var(--text-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          AuraQuest
        </span>
      </Link>

      {/* Primary Navigation Links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'nowrap'
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                fontSize: '0.95rem',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: isActive ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} />
              <span className="nav-label" style={{ display: 'inline' }}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Stats & Offline Sync & Logout */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* Offline Badge */}
        {!isOnline && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--glow-pink)',
            background: 'rgba(255, 0, 127, 0.1)',
            padding: '6px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 0, 127, 0.2)',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 600
          }}>
            <WifiOff size={14} />
            <span>Offline</span>
          </div>
        )}

        {/* User Stats Ring/Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Level Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Level {user?.level || 1}
            </span>
            <div style={{
              width: '90px',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              overflow: 'hidden',
              marginTop: '4px'
            }}>
              <div style={{
                height: '100%',
                width: `${xpProgressPercent}%`,
                background: 'linear-gradient(90deg, var(--glow-cyan), var(--glow-purple))',
                borderRadius: '3px',
                transition: 'width 0.5s ease-out'
              }} />
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {xpInCurrentLevel}/500 XP
            </span>
          </div>

          {/* Streak Flame */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 170, 0, 0.1)',
            border: '1px solid rgba(255, 170, 0, 0.2)',
            padding: '6px 12px',
            borderRadius: '12px',
            color: 'var(--glow-gold)',
            boxShadow: '0 0 10px rgba(255, 170, 0, 0.05)'
          }}>
            <Flame size={16} fill="var(--glow-gold)" />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.95rem'
            }}>
              {user?.current_streak || 0}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            logout();
            router.push('/auth');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
