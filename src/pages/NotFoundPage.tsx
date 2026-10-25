import React from 'react';
import { Compass, ArrowRight, MessageSquare } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { buildWhatsAppUrl } from '../services/storage';
import { NAV_LINKS } from '../config/site';

interface NotFoundPageProps {
  navigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigate }) => {
  usePageMeta({
    title: 'الصفحة غير موجودة',
    description: 'الرابط الذي فتحته غير متاح. عد إلى الصفحة الرئيسية أو تصفح أقسام الموقع.',
  });

  return (
    <div className="bg-[var(--vls-paper)] text-[var(--vls-ink)] min-h-[75vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="relative inline-flex">
          <span className="text-[86px] sm:text-[110px] font-black bg-gradient-to-l from-[#9b8cff] via-[#82efda] to-[#9b8cff] bg-clip-text text-transparent leading-none">
            404
          </span>
          <span className="absolute -top-3 -left-6 w-12 h-12 rounded-2xl bg-[var(--vls-panel)] border border-[var(--vls-line)] flex items-center justify-center text-[var(--vls-accent)] animate-float">
            <Compass size={22} />
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black">يبدو أن هذا الرابط غير موجود</h1>
          <p className="text-xs sm:text-sm text-[var(--vls-ink-muted)] leading-relaxed">
            ربما تغيّر عنوان الصفحة أو كُتب الرابط بشكل خاطئ. يمكنك العودة للرئيسية أو اختيار
            قسم من الأقسام التالية مباشرة.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {NAV_LINKS.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="px-4 py-2 rounded-full border border-[var(--vls-line)] bg-[var(--vls-panel)] text-xs font-bold hover:border-[var(--vls-accent)] hover:text-[var(--vls-accent)] transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] px-6 py-3 rounded-xl text-xs font-black hover:opacity-90 transition-opacity cursor-pointer"
          >
            <ArrowRight size={15} />
            <span>العودة للرئيسية</span>
          </button>
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--vls-accent)] hover:underline"
          >
            <MessageSquare size={14} />
            <span>أبلغنا عن الرابط عبر واتساب</span>
          </a>
        </div>
      </div>
    </div>
  );
};
