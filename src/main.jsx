import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { trackSessionStart, trackSessionEnd } from './utils/analytics.js';
import './index.css';

// Initialize i18n
import './i18n';

// Track session start
trackSessionStart();

// Track session end on page unload
window.addEventListener('beforeunload', trackSessionEnd);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);

