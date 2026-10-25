import React, { useRef } from 'react';
import { X, CheckCircle2, ArrowUpRight, MessageSquare, ExternalLink, Calendar, Building, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioItem } from '../types';
import { buildWhatsAppUrl } from '../services/storage';
import { SafeImage } from './SafeImage';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface PortfolioModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
  onRequestSimilar: (item: PortfolioItem) => void;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  item,
  onClose,
  onRequestSimilar,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, !!item, onClose);

  if (!item) return null;

  const whatsappInquiryUrl = buildWhatsAppUrl(
    undefined,
    `مرحباً فيكتوريا لاين، شاهدت مشروعكم المتميز "${item.title}" في معرض الأعمال وأود طلب مشروع مماثل لشركتنا.`
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-3xl bg-[#0d1323] text-[#f7f8ff] border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col my-auto text-right"
          dir="rtl"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="تفاصيل المشروع"
        >
          {/* Header image banner */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden shrink-0 bg-[#080b16]">
            <SafeImage
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1323] via-[#0d1323]/50 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/80 transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X size={20} />
            </button>

            {/* Category & Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="bg-[#9b8cff] text-[#080b16] font-bold text-xs px-3.5 py-1 rounded-full shadow-md">
                {item.categoryLabel}
              </span>
              {item.featured && (
                <span className="bg-[#82efda]/20 border border-[#82efda]/40 text-[#82efda] text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 backdrop-blur-md">
                  <Sparkles size={12} />
                  <span>مشروع مميز</span>
                </span>
              )}
            </div>

            {/* Title on image */}
            <div className="absolute bottom-4 right-6 left-6">
              <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                {item.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#82efda] font-medium mt-1">
                {item.subtitle}
              </p>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-6 py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-[#a7b1c7]">
              <div className="flex items-center gap-2">
                <Building size={16} className="text-[#9b8cff]" />
                <span>العميل: <strong className="text-white">{item.client}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#82efda]" />
                <span>سنة الإنجاز: <strong className="text-white">{item.year}</strong></span>
              </div>
            </div>

            {/* Summary */}
            <div>
              <h3 className="text-xs font-extrabold text-[#9b8cff] tracking-wider uppercase mb-2">
                نظرة عامة على المشروع
              </h3>
              <p className="text-sm leading-relaxed text-[#c3ccdc]">
                {item.summary}
              </p>
            </div>

            {/* Challenge & Solution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <span className="text-xs font-bold text-[#f3a5d5] block">التحدي الأساسي:</span>
                <p className="text-xs leading-relaxed text-[#a7b1c7]">
                  {item.challenge}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <span className="text-xs font-bold text-[#82efda] block">الحل المنفذ:</span>
                <p className="text-xs leading-relaxed text-[#a7b1c7]">
                  {item.solution}
                </p>
              </div>
            </div>

            {/* Quantifiable Results */}
            {item.results && item.results.length > 0 && (
              <div>
                <h3 className="text-xs font-extrabold text-[#82efda] tracking-wider uppercase mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>النتائج والأثر المحقق بالأرقام</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {item.results.map((res, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-[#82efda]/5 border border-[#82efda]/20 text-xs font-semibold text-[#f7f8ff] flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#82efda] mt-2 shrink-0" />
                      <span>{res}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags / Stack */}
            <div>
              <h4 className="text-xs font-bold text-[#838eac] mb-2.5">التقنيات المستخدمة:</h4>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#cad4e6] font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 sm:p-6 bg-[#080b16] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onRequestSimilar(item)}
                className="inline-flex items-center gap-2 bg-[#9b8cff] hover:bg-white text-[#080b16] font-extrabold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer shadow-md"
              >
                <span>طلب مشروع مماثل</span>
                <ArrowUpRight size={15} />
              </button>

              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold text-xs px-4 py-3 rounded-xl transition-all"
              >
                <MessageSquare size={15} />
                <span>استفسار واتساب فوري</span>
              </a>
            </div>

            {item.demoUrl && (
              <a
                href={item.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#8796b2] hover:text-white transition-colors"
              >
                <span>معاينة حية</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
