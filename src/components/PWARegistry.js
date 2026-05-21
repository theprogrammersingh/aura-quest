'use client';

import { useEffect } from 'react';

export default function PWARegistry() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('ServiceWorker registration successful with scope: ', reg.scope);

          // Trigger manual update check immediately on mount / visit / refresh
          reg.update().catch((err) => {
            console.warn('Failed to check for ServiceWorker updates on mount:', err);
          });
        })
        .catch((err) => {
          console.error('ServiceWorker registration failed: ', err);
        });

      // Listen for when a new service worker takes control and reload the page
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('New service worker took control. Reloading...');
          window.location.reload();
        }
      });
    }
  }, []);

  return null;
}
