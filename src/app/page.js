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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AuraQuest",
    "url": "https://auraquest.app",
    "applicationCategory": "Mindfulness & Mental Health Application",
    "operatingSystem": "All",
    "description": "AuraQuest is a gamified Progressive Web App (PWA) AI Journal & Mood Tracker that decodes daily emotional reflections, highlights mindfulness milestones, and connects friends on dynamic Weekly XP Leaderboards.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "features": [
      "AI Sentiment Analysis",
      "Daily Mood Scoring",
      "Mindfulness Streak Tracking",
      "Milestone Achievements Unlocking",
      "Weekly XP Friend Leaderboard",
      "IndexedDB Offline Caching & Auto-Sync"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
    </>
  );
}
