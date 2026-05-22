'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Trophy, Users, Edit3, LayoutDashboard } from 'lucide-react';

export default function BottomNavbar() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Only render bottom nav if the user is authenticated
  if (!isAuthenticated) return null;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/new-entry', label: 'Write', icon: Edit3 },
    { path: '/social', label: 'Social', icon: Users },
    { path: '/achievements', label: 'Trophy', icon: Trophy }
  ];

  return (
    <nav className="bottom-nav mobile-only">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="bottom-nav-icon-container">
              <Icon 
                size={20} 
                color={isActive ? 'var(--glow-cyan)' : 'var(--text-secondary)'} 
                style={{
                  filter: isActive ? 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.4))' : 'none',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
