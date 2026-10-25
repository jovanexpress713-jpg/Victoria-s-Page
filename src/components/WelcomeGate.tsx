import React, { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, ShoppingBag, Sparkles, Compass, X } from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { markWelcomeSeen } from '../services/uiEvents';

interface WelcomeGateProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string, scrollTo?: string) => void;
  onStartTour: () => void;
}

const INTENTS = [
  {
    id: 'project',
    icon: Rocket,
    title: 'أريد البدء بمشروع',
    desc: 'وجّهني لطلب عرض سعر واضح',
    path: '/contact',
  },
  {
    id: 'store',
    icon: ShoppingBag,
    title: 'أبحث عن حل جاهز',
    desc: 'متجر تطبيقات وتصاميم جاهزة للتسليم',
    path: '/store',
  },
  {
    id: 'work',
    icon: Sparkles,
    title: 'أستكشف أعمالكم',
    desc: 'معرض مشاريع حقيقية بنتائج ملموسة',
    path: '/',
    scrollTo: 'showcase',
  },
] as const;

/**
 * شاشة ترحيبية توجه الزائر لأول زيارة: تختصر الموقع إلى ثلاثة مسارات
 * واضحة مع خيار الجولة الإرشادية. تُحفظ المشاهدة حتى لا تتكرر.
 */
export const WelcomeGate: React.FC<WelcomeGateProps> = ({
  open,
  onClose,
  onNavigate,
  onStartTour,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    markWelcomeSeen();
    onClose();
  }, [onClose]);

  useFocusTrap(panelRef, open, handleClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 overflow-y-auto bg-[#05070f]/92 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
        >
          {/* خلفية مدارية بهوية العلامة */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#7163d7]/25 blur-[130px]" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-[#318eaa]/20 blur-[130px]" />
            <div className="absolute inset-0 flex items-center justify-center opacity-25">
              <div className="w-[560px] h-[220px] rounded-full border border-[#a69aff]/30 rotate-[-18deg] animate-orbit-slow" />
              <div className="absolute w-[420px] h-[300px] rounded-full border border-[#83efda]/20 rotate-[40deg] animate-orbit-reverse" />
            </div>
          </div>

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl rounded-[28px] border border-white/12 bg-[#0b1020]/95 shadow-2xl p-7 sm:p-10 text-right text-[#f7f8ff]"
          >
            <button
              onClick={handleClose}
              aria-label="إغلاق شاشة الترحيب"
              className="absolute top-4 left-4 p-2 rounded-xl text-[#a7b1c7] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c8fa55] to-[#9b8cff] text-[#080b16] font-black text-xl flex items-center justify-center shadow-lg">
                V
              </span>
              <div>
                <span className="block text-[10px] font-mono font-bold tracking-widest text-[#82efda]">
                  VICTORIA LINE SOFT · 2026
                </span>
                <h2 id="welcome-title" className="text-xl sm:text-2xl font-black">
                  أهلاً بك — خلّنا نوصلك لأسرع طريق
                </h2>
              </div>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-[#a7b1c7] leading-relaxed">
              استوديو رقمي مستقل: نبني مواقع ومتاجر وأنظمة إدارة وهويات بصرية وذكاءً اصطناعياً
              يخدم أهدافاً تجارية واضحة. اختر ما يشبهك اليوم وسنفتح لك الباب المناسب مباشرة.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {INTENTS.map((intent) => (
                <button
                  key={intent.id}
                  onClick={() => {
                    markWelcomeSeen();
                    onClose();
                    onNavigate(intent.path, 'scrollTo' in intent ? intent.scrollTo : undefined);
                  }}
                  className="group text-right p-4 rounded-2xl border border-white/12 bg-white/[0.04] hover:bg-white/[0.09] hover:border-[#9b8cff]/60 hover:-translate-y-0.5 transition-all cursor-pointer space-y-2"
                >
                  <span className="w-10 h-10 rounded-xl bg-[#9b8cff]/18 text-[#c3baff] flex items-center justify-center group-hover:bg-[#9b8cff]/30 transition-colors">
                    <intent.icon size={19} />
                  </span>
                  <strong className="block text-xs font-extrabold">{intent.title}</strong>
                  <small className="block text-[10px] text-[#9da9c0] leading-relaxed">
                    {intent.desc}
                  </small>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <button
                onClick={() => {
                  markWelcomeSeen();
                  onClose();
                  onStartTour();
                }}
                className="inline-flex items-center gap-2 bg-[#c8fa55] text-[#080b16] px-5 py-2.5 rounded-xl text-xs font-black hover:bg-[#d8ff7a] transition-colors cursor-pointer shadow-lg"
              >
                <Compass size={15} />
                <span>خذني في جولة إرشادية سريعة (٣٠ ثانية)</span>
              </button>
              <button
                onClick={handleClose}
                className="text-[11px] font-bold text-[#9da9c0] hover:text-white transition-colors cursor-pointer underline underline-offset-4"
              >
                تخطَّ الآن — أعرف طريقي
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
