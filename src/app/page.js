'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import ParticleCanvas from '@/components/ParticleCanvas';
import { 
  Sparkles, BrainCircuit, Flame, Trophy, Users, 
  Plane, Smartphone, PenTool, BarChart3, Zap,
  ArrowRight, ChevronDown, Heart, Shield
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
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

  // If user is authenticated, show loading while redirect happens
  if (!loading && isAuthenticated) {
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
          Entering your cosmos...
        </p>
      </div>
    );
  }

  // Show loading spinner while auth state resolves
  if (loading) {
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

  const features = [
    {
      icon: BrainCircuit,
      title: 'AI Mood Decoder',
      description: 'Google Gemini analyzes your journal entries to score your mood (1–100), identify your dominant emotion, and extract sub-feelings — all in seconds.',
      color: 'var(--glow-cyan)',
      rgb: '0, 255, 255'
    },
    {
      icon: Flame,
      title: 'Quest Streaks',
      description: 'Build daily journaling streaks that keep you consistent. Track your longest streak and watch your flame grow as you level up your mindfulness habit.',
      color: 'var(--glow-gold)',
      rgb: '255, 170, 0'
    },
    {
      icon: Trophy,
      title: 'XP & Achievements',
      description: 'Earn 100 XP per entry, unlock milestone badges like "First Entry", "3-Day Streak", and "Emotion Master" — a gamified journey of self-discovery.',
      color: 'var(--glow-purple)',
      rgb: '138, 43, 226'
    },
    {
      icon: Users,
      title: 'Social Leaderboard',
      description: 'Connect with friends, compare your weekly XP on dynamic leaderboards, and compete to be the most mindful journaler in your circle.',
      color: 'var(--glow-green)',
      rgb: '0, 255, 102'
    },
    {
      icon: Plane,
      title: 'Airplane Mode',
      description: 'Journal offline with zero interruption. Entries are securely buffered in your browser\'s local vault and auto-sync when your connection returns.',
      color: 'var(--glow-pink)',
      rgb: '255, 0, 127'
    },
    {
      icon: Smartphone,
      title: 'Install as App',
      description: 'Add AuraQuest to your home screen as a native-feeling Progressive Web App. Works on iOS, Android, and desktop with instant load times.',
      color: 'var(--glow-blue)',
      rgb: '0, 136, 255'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Write',
      description: 'Open the distraction-free editor and pour out your thoughts. No rules, no judgement — just you and your words.',
      color: 'var(--glow-cyan)',
      rgb: '0, 255, 255'
    },
    {
      number: '2',
      title: 'Decode',
      description: 'Gemini AI instantly analyzes your reflection, scoring your emotional state and mapping the feelings behind every word.',
      color: 'var(--glow-purple)',
      rgb: '138, 43, 226'
    },
    {
      number: '3',
      title: 'Level Up',
      description: 'Earn XP, unlock achievement badges, build streaks, and climb the leaderboard. Self-reflection has never been this rewarding.',
      color: 'var(--glow-gold)',
      rgb: '255, 170, 0'
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Particle Background */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
          <ParticleCanvas density={40} />
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* HERO SECTION */}
        {/* ═══════════════════════════════════════════ */}
        <section className="landing-hero" style={{ position: 'relative', zIndex: 1 }}>
          {/* Decorative gradient orbs */}
          <div style={{
            position: 'absolute',
            top: '-120px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(138, 43, 226, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Logo icon */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, var(--glow-purple), var(--glow-pink))',
            boxShadow: '0 0 30px rgba(138, 43, 226, 0.5)',
            marginBottom: '28px'
          }}>
            <Sparkles size={36} color="#fff" />
          </div>

          {/* Main headline */}
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '20px',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Decode Your Emotions.{' '}
            <span className="landing-glow-text">Level Up Your Mind.</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            maxWidth: '560px',
            margin: '0 auto 40px auto',
            lineHeight: 1.7
          }}>
            AuraQuest is a gamified AI journal that transforms daily reflections into emotional insights, XP rewards, streaks, and achievements — powered by Google Gemini.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <Link href="/auth" className="glowing-btn" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              padding: '16px 32px',
              fontSize: '1.05rem'
            }}>
              <span>Start Your Quest</span>
              <ArrowRight size={18} />
            </Link>
            <a 
              href="#features" 
              className="glowing-btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                padding: '16px 28px',
                fontSize: '1.05rem'
              }}
            >
              <span>Explore Features</span>
              <ChevronDown size={18} />
            </a>
          </div>

          {/* Trust badges */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '48px',
            flexWrap: 'wrap'
          }}>
            {[
              { icon: Shield, text: '100% Free' },
              { icon: Zap, text: 'Powered by Gemini AI' },
              { icon: Heart, text: 'Open & Private' }
            ].map((badge, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
              }}>
                <badge.icon size={14} />
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* FEATURES SECTION */}
        {/* ═══════════════════════════════════════════ */}
        <section id="features" style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 20px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Section heading */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{
              fontSize: '0.85rem',
              color: 'var(--glow-cyan)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontWeight: 600,
              fontFamily: 'var(--font-display)'
            }}>
              Everything You Need
            </span>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              marginTop: '12px',
              marginBottom: '8px'
            }}>
              Features That Transform Journaling
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              maxWidth: '500px',
              margin: '0 auto',
              fontSize: '1rem',
              lineHeight: 1.6
            }}>
              From AI-powered analysis to gamified progression — every feature is designed to make self-reflection rewarding.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="feature-grid" style={{ marginTop: '40px' }}>
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="landing-card">
                  <div className="landing-card-icon" style={{
                    background: `rgba(${feat.rgb}, 0.1)`,
                    border: `1px solid rgba(${feat.rgb}, 0.2)`
                  }}>
                    <Icon size={22} color={feat.color} />
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '1.15rem'
                  }}>
                    {feat.title}
                  </h3>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: 1.6
                  }}>
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* HOW IT WORKS SECTION */}
        {/* ═══════════════════════════════════════════ */}
        <section style={{
          maxWidth: '900px',
          margin: '100px auto 0 auto',
          padding: '0 20px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{
              fontSize: '0.85rem',
              color: 'var(--glow-purple)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontWeight: 600,
              fontFamily: 'var(--font-display)'
            }}>
              Simple & Powerful
            </span>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              marginTop: '12px'
            }}>
              How It Works
            </h2>
          </div>

          <div className="how-it-works-grid">
            {steps.map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-number" style={{
                  background: `rgba(${step.rgb}, 0.15)`,
                  border: `1px solid rgba(${step.rgb}, 0.3)`,
                  color: step.color
                }}>
                  {step.number}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1.3rem',
                  marginBottom: '10px'
                }}>
                  {step.title}
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6
                }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* FINAL CTA BANNER */}
        {/* ═══════════════════════════════════════════ */}
        <section style={{
          maxWidth: '900px',
          margin: '100px auto 0 auto',
          padding: '0 20px',
          position: 'relative',
          zIndex: 1
        }}>
          <div className="cta-banner">
            {/* Decorative glow */}
            <div style={{
              position: 'absolute',
              top: '-80px',
              right: '-80px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(0, 255, 255, 0.08)',
              filter: 'blur(50px)',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-60px',
              left: '-60px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'rgba(138, 43, 226, 0.1)',
              filter: 'blur(50px)',
              pointerEvents: 'none'
            }} />

            <Sparkles size={32} color="var(--glow-cyan)" style={{ marginBottom: '20px' }} />
            
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              marginBottom: '16px'
            }}>
              Your Mind Is the Final Frontier
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.05rem',
              maxWidth: '480px',
              margin: '0 auto 32px auto',
              lineHeight: 1.7
            }}>
              Start journaling today and let AI decode the patterns in your emotions. It&apos;s free, private, and works offline.
            </p>
            <Link href="/auth" className="glowing-btn" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              padding: '16px 36px',
              fontSize: '1.1rem'
            }}>
              <span>Begin Your Quest</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* FOOTER */}
        {/* ═══════════════════════════════════════════ */}
        <footer className="landing-footer" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--glow-purple), var(--glow-pink))',
              borderRadius: '8px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={14} color="#fff" />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--text-secondary)'
            }}>
              AuraQuest
            </span>
          </div>
          <p>
            © {new Date().getFullYear()} AuraQuest. Built with Gemini AI.
          </p>
          <p style={{ marginTop: '6px', fontSize: '0.8rem' }}>
            A gamified mindfulness journal for the curious mind.
          </p>
        </footer>
      </div>
    </>
  );
}
