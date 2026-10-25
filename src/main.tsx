import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// تسجيل عامل الخدمة في الإنتاج فقط (PWA: عمل جزئي دون اتصال + تحميل أسرع)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('تعذّر تسجيل عامل الخدمة:', error);
    });
  });
}
