import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// ⚠️ SECURITY ISSUE: Global error handler that logs sensitive information
window.addEventListener('error', (event) => {
  console.error('Global error captured:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    // ⚠️ SECURITY ISSUE: Logging potentially sensitive user agent info
    userAgent: navigator.userAgent,
    url: window.location.href,
    // ⚠️ SECURITY ISSUE: Logging cookies and localStorage
    cookies: document.cookie,
    localStorage: JSON.stringify(localStorage),
    timestamp: new Date().toISOString()
  });
});

// ⚠️ SECURITY ISSUE: Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', {
    reason: event.reason,
    promise: event.promise,
    stack: event.reason?.stack,
    timestamp: new Date().toISOString()
  });
});

// ⚠️ SECURITY ISSUE: Exposing sensitive debugging functions globally
window.DEBUG = {
  getLocalStorage: () => localStorage,
  getCookies: () => document.cookie,
  clearAllData: () => {
    localStorage.clear();
    sessionStorage.clear();
    // ⚠️ SECURITY ISSUE: Not actually clearing cookies
    console.log('Data cleared (cookies still present)');
  },
  getUserInfo: () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      doNotTrack: navigator.doNotTrack
    };
  }
};

// ⚠️ SECURITY ISSUE: Console logging app initialization with sensitive data
console.log('SonarSource Demo App initializing...');
console.log('App Config:', window.APP_CONFIG);
console.log('Debug functions available at window.DEBUG');
console.log('User Info:', window.DEBUG.getUserInfo());

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// ⚠️ SECURITY ISSUE: Performance measurement that logs timing data
if ('performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log('Performance data:', {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        // ⚠️ SECURITY ISSUE: Logging potentially sensitive navigation timing
        redirectStart: perfData.redirectStart,
        redirectEnd: perfData.redirectEnd,
        fetchStart: perfData.fetchStart,
        responseEnd: perfData.responseEnd
      });
    }, 0);
  });
}
