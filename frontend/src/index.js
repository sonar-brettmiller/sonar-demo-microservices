import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// SECURITY HOTSPOT: Global error handler
// Mitigation: Only logs non-sensitive error information (no cookies/localStorage)
// Assumption: Error messages do not contain PII
globalThis.addEventListener('error', (event) => {
  console.error('Global error captured:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    timestamp: new Date().toISOString()
    // 🔒 SECURITY: Removed sensitive data (cookies, localStorage, userAgent)
  });
});

// SECURITY HOTSPOT: Unhandled promise rejection handler
// Mitigation: Only logs error details without sensitive context
// Assumption: Promise rejection reasons do not contain tokens/credentials
globalThis.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', {
    reason: event.reason?.message || event.reason,
    stack: event.reason?.stack,
    timestamp: new Date().toISOString()
    // 🔒 SECURITY: Limited to error details only
  });
});

// SECURITY HOTSPOT: Debug functions exposed globally
// Mitigation: Only available in development mode, limited functionality
// Assumption: NODE_ENV is properly set in production builds
if (process.env.NODE_ENV === 'development') {
  globalThis.DEBUG = {
    // 🔒 SECURITY: Limited to safe operations in development only
    clearAuthToken: () => {
      localStorage.removeItem('authToken');
      console.log('Auth token cleared');
    },
    getAppVersion: () => process.env.REACT_APP_VERSION || '1.0.0',
    isDevMode: () => true
  };
} else {
  // Production: No debug functions exposed
  globalThis.DEBUG = undefined;
}

// 🔒 SECURITY: Safe initialization logging
console.log('SonarSource Demo App initializing...');
if (process.env.NODE_ENV === 'development') {
  console.log('Debug mode enabled. Debug functions available at window.DEBUG');
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// SECURITY HOTSPOT: Performance measurement
// Mitigation: Only log non-sensitive timing metrics
// Assumption: Timing data does not reveal sensitive application behavior
if ('performance' in globalThis && process.env.NODE_ENV === 'development') {
  globalThis.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        console.log('Performance data:', {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart
          // 🔒 SECURITY: Removed potentially sensitive redirect/fetch timing
        });
      }
    }, 0);
  });
}

