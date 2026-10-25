import React, { useState } from 'react';
import { Menu, X, ArrowUpRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { path: '/', label: 'الرئيسية' },
    { path: '/store', label: 'المتجر', isSpecial: true },
    { path: '/products', label: 'الحلول والخدمات' },
    { path: '/lab', label: 'المختبر الحي' },
    { path: '/ai/sales', label: 'مساعد ذكي' },
    { path: '/insights', label: 'المعرفة' },
    { path: '/contact', label: 'ابدأ مشروعك' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--vls-header-bg)] backdrop-blur-md border-b border-[var(--vls-border-color)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => handleNav('/')}
          className="flex items-center gap-3 text-right focus:outline-none cursor-pointer group"
          aria-label="Victoria Line Soft — الرئيسية"
        >
          <span className="w-10 h-10 rounded-xl bg-[#101318] dark:bg-white text-[#c8fa55] dark:text-[#080b16] font-black text-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            V
          </span>
          <div className="leading-tight">
            <span className="font-extrabold text-base tracking-wide text-[var(--vls-ink)] block">
              VICTORIA
            </span>
            <span className="text-[9px] font-semibold tracking-widest text-[var(--vls-ink-muted)] block">
              LINE SOFT
            </span>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav
          className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[var(--vls-ink-muted)]"
          aria-label="التنقل الرئيسي"
        >
          {links.map((link) => {
            const isActive =
              currentPath === link.path ||
              (link.path === '/insights' && currentPath.startsWith('/insights/'));
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`py-2 transition-all cursor-pointer relative flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[var(--vls-ink)] font-bold after:content-[""] after:absolute after:bottom-0 after:right-0 after:left-0 after:h-0.5 after:bg-[#9b8cff]'
                    : 'hover:text-[var(--vls-ink)]'
                }`}
              >
                <span>{link.label}</span>
                {link.isSpecial && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#9b8cff]/20 text-[#9b8cff] border border-[#9b8cff]/30">
                    جديد
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA / ThemeToggle / Admin */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Store Quick Icon (Mobile & Desktop) */}
          <button
            onClick={() => handleNav('/store')}
            title="متجر التطبيقات والحلول"
            className="p-2 text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)] rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="المتجر"
          >
            <ShoppingBag size={18} />
          </button>

          <button
            onClick={() => handleNav('/admin')}
            title="مركز الإدارة"
            className="p-2 text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)] rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer hidden sm:flex"
            aria-label="لوحة الإدارة"
          >
            <ShieldCheck size={18} />
          </button>

          <button
            onClick={() => handleNav('/contact')}
            className="hidden sm:inline-flex items-center gap-2 border border-[var(--vls-border-color)] rounded-full bg-[var(--vls-panel)] text-[var(--vls-ink)] hover:bg-[#9b8cff] hover:text-[#080b16] px-4 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <span>ناقش مشروعك</span>
            <ArrowUpRight size={14} />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex items-center gap-1.5 p-2 rounded-xl border border-[var(--vls-border-color)] bg-[var(--vls-panel)] text-[var(--vls-ink)] text-xs font-bold cursor-pointer"
            aria-expanded={mobileOpen}
            aria-label="تبديل القائمة"
          >
            <span>القائمة</span>
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-[var(--vls-border-color)] bg-[var(--vls-panel)] px-4 py-3 space-y-1 shadow-lg animate-fadeUp text-right">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNav(link.path)}
              className={`w-full text-right py-2.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                currentPath === link.path
                  ? 'bg-[#9b8cff]/15 text-[#9b8cff]'
                  : 'text-[var(--vls-ink)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span>{link.label}</span>
              {link.isSpecial && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#9b8cff] text-[#080b16]">
                  تسوق الآن
                </span>
              )}
            </button>
          ))}
          <div className="pt-2 border-t border-[var(--vls-border-color)] flex justify-between items-center px-2">
            <button
              onClick={() => handleNav('/admin')}
              className="text-xs text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)] flex items-center gap-1.5 py-2 cursor-pointer font-semibold"
            >
              <ShieldCheck size={16} />
              <span>دخول الإدارة</span>
            </button>
            <button
              onClick={() => handleNav('/contact')}
              className="inline-flex items-center gap-1.5 bg-[#9b8cff] text-[#080b16] px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer"
            >
              <span>ابدأ مشروعك</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
