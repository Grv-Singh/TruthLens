import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Register TruthLens PWA Offline Shell Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignore in non-HTTPS dev environments if blocked
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <App />
);
