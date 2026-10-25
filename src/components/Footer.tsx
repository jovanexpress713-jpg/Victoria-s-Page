import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SITE } from '../config/site';
import { requestWelcome, requestTour } from '../services/uiEvents';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="border-t border-[var(--vls-line)] bg-[var(--vls-sunk)] text-[var(--vls-ink-muted)] text-xs py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
        {/* Brand */}
        <div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-right font-extrabold text-[var(--vls-ink)] text-sm cursor-pointer mb-2"
          >
            <span className="w-8 h-8 rounded-lg bg-[#101318] dark:bg-white text-[#c8fa55] dark:text-[#101318] font-black text-sm flex items-center justify-center">
              V
            </span>
            <strong>Victoria Line Soft</strong>
          </button>
          <p className="text-[11px] leading-relaxed text-[var(--vls-ink-muted)]">
            حلول رقمية وتصميم وتجارب ذكية للأعمال. نبني أدوات تنفع الناس وتخدم الأهداف التجارية.
          </p>
        </div>

        {/* Links */}
        <div className="md:col-span-2 flex flex-wrap gap-x-6 gap-y-2 items-center text-xs font-semibold">
          <button onClick={() => navigate('/store')} className="text-[#9b8cff] hover:underline cursor-pointer font-bold">
            متجر التطبيقات والحلول
          </button>
          <button onClick={() => navigate('/products')} className="hover:text-[#9b8cff] cursor-pointer">
            الخدمات
          </button>
          <button onClick={() => navigate('/lab')} className="hover:text-[#9b8cff] cursor-pointer">
            المختبر الحي
          </button>
          <button onClick={() => navigate('/ai/sales')} className="hover:text-[#9b8cff] cursor-pointer">
            مساعد المبيعات
          </button>
          <button onClick={() => navigate('/insights')} className="hover:text-[#9b8cff] cursor-pointer">
            مركز المعرفة
          </button>
          <button onClick={() => navigate('/contact')} className="hover:text-[#9b8cff] cursor-pointer">
            تواصل معنا
          </button>
          <button onClick={() => navigate('/admin')} className="text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)] cursor-pointer">
            بوابة الإدارة
          </button>
          <button onClick={() => navigate('/about')} className="hover:text-[#9b8cff] cursor-pointer">
            من نحن
          </button>
          <button onClick={() => navigate('/privacy')} className="hover:text-[#9b8cff] cursor-pointer">
            الخصوصية
          </button>
        </div>

        {/* Copyright & WhatsApp */}
        <div className="md:text-left flex flex-col md:items-end gap-2 text-[11px]">
          <span className="text-[var(--vls-ink-muted)]">© {SITE.foundedYear} {SITE.name}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={requestWelcome}
              className="underline underline-offset-4 hover:text-[var(--vls-ink)] cursor-pointer font-bold"
            >
              شاشة الترحيب
            </button>
            <button
              onClick={requestTour}
              className="underline underline-offset-4 hover:text-[var(--vls-ink)] cursor-pointer font-bold"
            >
              الجولة الإرشادية
            </button>
          </div>
          <a
            href={`https://wa.me/${SITE.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[var(--vls-accent-deep)] font-bold hover:underline"
          >
            <span>واتساب: {SITE.whatsappDisplay}</span>
            <ArrowUpRight size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
};
