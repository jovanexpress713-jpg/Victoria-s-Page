import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ReadingProgress } from './components/ReadingProgress';
import { ErrorBoundary } from './components/ErrorBoundary';
import { isAdminAuthenticated, migrateLegacySession } from './services/auth';
import { buildWhatsAppUrl } from './services/storage';
import { ThemeProvider } from './context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

// تحميل كسول للصفحات الثقيلة: الحزمة الأولى تصبح أصغر ووقت التحميل أسرع.
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const ProductsPage = lazy(() =>
  import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage }))
);
const StorePage = lazy(() => import('./pages/StorePage').then((m) => ({ default: m.StorePage })));
const LabPage = lazy(() => import('./pages/LabPage').then((m) => ({ default: m.LabPage })));
const AiSalesPage = lazy(() =>
  import('./pages/AiSalesPage').then((m) => ({ default: m.AiSalesPage }))
);
const InsightsPage = lazy(() =>
  import('./pages/InsightsPage').then((m) => ({ default: m.InsightsPage }))
);
const InsightDetailPage = lazy(() =>
  import('./pages/InsightDetailPage').then((m) => ({ default: m.InsightDetailPage }))
);
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const AdminLoginPage = lazy(() =>
  import('./pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const PageLoader: React.FC = () => (
  <div
    className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[var(--vls-paper)] text-[var(--vls-ink)]"
    role="status"
    aria-live="polite"
  >
    <span className="w-12 h-12 rounded-2xl bg-[var(--vls-btn-bg)] text-[var(--vls-accent)] font-black text-xl flex items-center justify-center animate-pulse">
      V
    </span>
    <span className="text-[11px] font-bold text-[var(--vls-ink-muted)]">جارٍ تحميل القسم…</span>
  </div>
);

export const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => {
    return new URLSearchParams(window.location.search);
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return isAdminAuthenticated();
  });

  useEffect(() => {
    migrateLegacySession();
  }, []);

  const navigate = (path: string) => {
    // External WhatsApp deep-link
    if (path === '/whatsapp') {
      window.location.href = buildWhatsAppUrl();
      return;
    }

    const [pathname, search] = path.split('?');
    const cleanPath = (pathname || '/').replace(/\/+$/, '') || '/';
    window.history.pushState({}, '', `${cleanPath}${search ? `?${search}` : ''}`);
    setCurrentPath(cleanPath);
    setSearchParams(new URLSearchParams(search || ''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
      setCurrentPath(path);
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Determine which page to render
  const renderContent = () => {
    // Insight detail route: /insights/:slug
    if (currentPath.startsWith('/insights/')) {
      const slug = currentPath.replace('/insights/', '').trim();
      if (!slug) return <InsightsPage navigate={navigate} />;
      return <InsightDetailPage slug={slug} navigate={navigate} />;
    }

    switch (currentPath) {
      case '/':
        return <HomePage navigate={navigate} />;
      case '/store':
        return <StorePage navigate={navigate} />;
      case '/products':
        return <ProductsPage navigate={navigate} />;
      case '/lab':
        return <LabPage />;
      case '/ai/sales':
        return <AiSalesPage navigate={navigate} />;
      case '/insights':
        return <InsightsPage navigate={navigate} />;
      case '/contact':
        return (
          <ContactPage
            initialService={searchParams.get('service') || ''}
            initialDetails={searchParams.get('details') || ''}
          />
        );
      case '/admin':
        if (!isAdminLoggedIn) {
          return (
            <AdminLoginPage
              onSuccess={() => setIsAdminLoggedIn(true)}
              navigate={navigate}
            />
          );
        }
        return (
          <AdminPage
            onLogout={() => setIsAdminLoggedIn(false)}
            navigate={navigate}
          />
        );
      case '/admin/login':
        return (
          <AdminLoginPage
            onSuccess={() => {
              setIsAdminLoggedIn(true);
              navigate('/admin');
            }}
            navigate={navigate}
          />
        );
      default:
        return <NotFoundPage navigate={navigate} />;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans antialiased text-right bg-[var(--vls-paper)] text-[var(--vls-ink)] transition-colors duration-200"
      dir="rtl"
    >
      <ReadingProgress />
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main id="main-content" className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPath}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer navigate={navigate} />
      <FloatingWhatsApp />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
