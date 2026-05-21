'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/auth');
      }
    }
  }, [isAuthenticated, loading, router]);

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
