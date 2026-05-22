'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Flame, Sparkles, Trophy, Users, Edit3, LogOut, WifiOff, LayoutDashboard, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
    <>
      <nav style={{
        background: 'rgba(11, 12, 22, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--space-border)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}>
        {/* Main bar row */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}>
          {/* Left: Brand Logo */}
          <Link href="/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: '#fff',
            flexShrink: 0,
          }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--glow-purple), var(--glow-pink))',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(138, 43, 226, 0.4)',
              flexShrink: 0,
            }}>
              <Sparkles size={17} color="#fff" />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.25rem',
              letterSpacing: '0.04em',
              background: 'linear-gradient(90deg, #fff, var(--text-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              AuraQuest
            </span>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <div className="desktop-only" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
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
                    gap: '7px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-display)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.88rem',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: Stats + Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
          }}>
            {/* Offline Badge */}
            {!isOnline && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: 'var(--glow-pink)',
                background: 'rgba(255, 0, 127, 0.1)',
                padding: '5px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 0, 127, 0.2)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
              }}>
                <WifiOff size={13} />
                <span>Offline</span>
              </div>
            )}

            {/* Level + XP (Desktop) */}
            <div className="desktop-only" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1 }}>
                Level {user?.level || 1}
              </span>
              <div style={{
                width: '80px',
                height: '5px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginTop: '4px',
              }}>
                <div style={{
                  height: '100%',
                  width: `${xpProgressPercent}%`,
                  background: 'linear-gradient(90deg, var(--glow-cyan), var(--glow-purple))',
                  borderRadius: '3px',
                  transition: 'width 0.5s ease-out',
                }} />
              </div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1 }}>
                {xpInCurrentLevel}/500 XP
              </span>
            </div>

            {/* Level Badge (Mobile) */}
            <div className="mobile-only" style={{
              background: 'rgba(0, 255, 255, 0.1)',
              border: '1px solid rgba(0, 255, 255, 0.2)',
              padding: '5px 9px',
              borderRadius: '8px',
              color: 'var(--glow-cyan)',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              lineHeight: 1,
            }}>
              Lvl {user?.level || 1}
            </div>

            {/* Streak Flame */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 170, 0, 0.1)',
              border: '1px solid rgba(255, 170, 0, 0.2)',
              padding: '5px 10px',
              borderRadius: '10px',
              color: 'var(--glow-gold)',
            }}>
              <Flame size={14} fill="var(--glow-gold)" />
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.88rem',
              }}>
                {user?.current_streak || 0}
              </span>
            </div>

            {/* Logout (Desktop) */}
            <button
              className="desktop-only"
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
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              title="Sign Out"
            >
              <LogOut size={17} />
            </button>

            {/* Hamburger Toggle (Mobile) */}
            <button
              className="mobile-only"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              style={{
                background: mobileMenuOpen ? 'rgba(255, 255, 255, 0.08)' : 'none',
                border: 'none',
                color: mobileMenuOpen ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Dropdown Menu Panel */}
      <div
        className="mobile-only"
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          zIndex: 999,
          background: 'rgba(11, 12, 22, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--space-border)',
          padding: mobileMenuOpen ? '16px 20px 20px 20px' : '0 20px',
          maxHeight: mobileMenuOpen ? '400px' : '0',
          overflow: 'hidden',
          opacity: mobileMenuOpen ? 1 : 0,
          transition: 'max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, padding 0.3s ease',
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
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
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontFamily: 'var(--font-display)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.95rem',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                border: isActive ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={18} color={isActive ? 'var(--glow-cyan)' : 'var(--text-muted)'} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--space-border)', margin: '6px 0' }} />

        {/* XP Progress in mobile menu */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          fontSize: '0.85rem',
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>Level {user?.level || 1}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '80px',
              height: '5px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${xpProgressPercent}%`,
                background: 'linear-gradient(90deg, var(--glow-cyan), var(--glow-purple))',
                borderRadius: '3px',
              }} />
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              {xpInCurrentLevel}/500 XP
            </span>
          </div>
        </div>

        {/* Logout in mobile menu */}
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            logout();
            router.push('/auth');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'rgba(255, 0, 127, 0.06)',
            border: '1px solid rgba(255, 0, 127, 0.12)',
            color: 'var(--glow-pink)',
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            width: '100%',
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Backdrop overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div
          className="mobile-only"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 998,
            background: 'rgba(0, 0, 0, 0.4)',
          }}
        />
      )}
    </>
  );
}
