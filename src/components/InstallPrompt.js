'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share2, Plus, X, Smartphone } from 'lucide-react';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if dismissed recently
    const dismissedTime = localStorage.getItem('auraquest_install_prompt_dismissed');
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    if (dismissedTime && now - parseInt(dismissedTime) < oneWeek) {
      return; // Do not show if dismissed in the last 7 days
    }

    // Detect if already running in standalone mode (installed)
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return; // Already installed, do not show prompt
    }

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      // iOS doesn't support beforeinstallprompt. Check if Safari is being used.
      if (!isStandalone) {
        // Delay slightly for astronomical entrance effect
        const timer = setTimeout(() => setShowIOSPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    } else {
      // Android / Desktop Chrome / Edge support beforeinstallprompt
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        // Delay slightly for astronomical entrance effect
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      } else {
        console.log('User dismissed the PWA install prompt');
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    });
  };

  const handleDismiss = () => {
    localStorage.setItem('auraquest_install_prompt_dismissed', Date.now().toString());
    setShowPrompt(false);
    setShowIOSPrompt(false);
  };

  if (!showPrompt && !showIOSPrompt) return null;

  return (
    <div className="install-prompt-overlay">
      <div className="glass-panel install-prompt-card glow-joy">
        <button className="close-btn" onClick={handleDismiss} aria-label="Dismiss prompt">
          <X size={16} />
        </button>

        <div className="prompt-header">
          <div className="app-icon-glow">
            <Smartphone className="phone-icon" size={24} />
          </div>
          <div>
            <h3>Bring AuraQuest Home</h3>
            <p className="subtitle">Install our app for offline sync, daily streaks, and instant AI mood mapping.</p>
          </div>
        </div>

        {showPrompt && (
          <div className="prompt-actions">
            <button className="glowing-btn-secondary dismiss-btn" onClick={handleDismiss}>
              <span>Maybe Later</span>
            </button>
            <button className="glowing-btn install-action-btn" onClick={handleInstallClick}>
              <Download size={16} style={{ marginRight: '8px' }} />
              <span>Install App</span>
            </button>
          </div>
        )}

        {showIOSPrompt && (
          <div className="ios-instructions">
            <div className="divider"></div>
            <p className="instruction-step">
              <Share2 size={16} className="ios-step-icon" />
              <span>1. Tap the <strong>Share</strong> button at the bottom of Safari.</span>
            </p>
            <p className="instruction-step">
              <Plus size={16} className="ios-step-icon" />
              <span>2. Select <strong>Add to Home Screen</strong> from the list.</span>
            </p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .install-prompt-overlay {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 10000;
          max-width: 420px;
          width: calc(100% - 48px);
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .install-prompt-card {
          padding: 20px !important;
          border-radius: 16px !important;
          background: rgba(11, 12, 22, 0.85) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6) !important;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .close-btn:hover {
          color: var(--text-primary);
        }

        .prompt-header {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .app-icon-glow {
          background: linear-gradient(135deg, var(--glow-purple), var(--glow-cyan));
          padding: 10px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
          flex-shrink: 0;
        }

        .phone-icon {
          color: #fff;
        }

        .prompt-header h3 {
          font-size: 1.1rem;
          color: #fff;
          margin-bottom: 4px;
        }

        .subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .prompt-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 4px;
        }

        .dismiss-btn {
          padding: 8px 16px !important;
          font-size: 0.9rem !important;
          border-radius: 8px !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: var(--text-secondary) !important;
          cursor: pointer;
        }

        .install-action-btn {
          padding: 8px 16px !important;
          font-size: 0.9rem !important;
          border-radius: 8px !important;
          display: flex;
          align-items: center;
          box-shadow: 0 4px 10px rgba(138, 43, 226, 0.3) !important;
        }

        .ios-instructions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 4px;
        }

        .divider {
          height: 1px;
          background: var(--space-border);
          width: 100%;
        }

        .instruction-step {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .ios-step-icon {
          color: var(--glow-cyan);
          flex-shrink: 0;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 480px) {
          .install-prompt-overlay {
            bottom: 16px;
            left: 16px;
            right: 16px;
            width: calc(100% - 32px);
          }
          
          .prompt-actions {
            flex-direction: row;
            justify-content: space-between;
          }
          
          .dismiss-btn, .install-action-btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}} />
    </div>
  );
}
