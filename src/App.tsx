import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ReadingProgress } from './components/ReadingProgress';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { StorePage } from './pages/StorePage';
import { LabPage } from './pages/LabPage';
import { AiSalesPage } from './pages/AiSalesPage';
import { InsightsPage } from './pages/InsightsPage';
import { InsightDetailPage } from './pages/InsightDetailPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { isAdminAuthenticated, buildWhatsAppUrl } from './services/storage';
import { ThemeProvider } from './context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

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

  const navigate = (path: string) => {
    // Check if it's external whatsapp
    if (path === '/whatsapp') {
      window.location.href = buildWhatsAppUrl();
      return;
    }

    const [pathname, search] = path.split('?');
    window.history.pushState({}, '', path);
    setCurrentPath(pathname || '/');
    setSearchParams(new URLSearchParams(search || ''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
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
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-right bg-[var(--vls-paper)] text-[var(--vls-ink)] transition-colors duration-200" dir="rtl">
      <ReadingProgress />
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1">
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
