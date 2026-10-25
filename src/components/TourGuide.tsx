import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, Compass } from 'lucide-react';

export interface TourStep {
  selector: string;
  title: string;
  body: string;
}

interface TourGuideProps {
  open: boolean;
  steps: TourStep[];
  onClose: () => void;
}

const PAD = 8;
const CARD_WIDTH = 340;
const CARD_HEIGHT_ESTIMATE = 210;

/**
 * جولة إرشادية Spotlight: تُبرز عنصراً حقيقياً في الصفحة خطوة بخطوة
 * مع بطاقة شرح قريبة منه، وتتخطى تلقائياً أي عنصر غير ظاهر (مثل قائمة سطح المكتب على الجوال).
 */
export const TourGuide: React.FC<TourGuideProps> = ({ open, steps, onClose }) => {
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rafRef = useRef(0);

  const visibleSteps = useMemo(() => steps, [steps]);

  // قياس موضع العنصر الحالي ومتابعته أثناء التمرير/تغيير الحجم
  useEffect(() => {
    if (!open) return;
    const step = visibleSteps[index];
    if (!step) {
      onClose();
      return;
    }

    const element = document.querySelector(step.selector);
    if (!element || element.getClientRects().length === 0) {
      // قد يكون القسم قيد التحميل الكسول: أعد المحاولة لفترة قبل التجاوز
      if (attempt < 12) {
        const timer = window.setTimeout(() => setAttempt((a) => a + 1), 250);
        return () => window.clearTimeout(timer);
      }
      // عنصر غير ظاهر في هذه الشاشة: جدولة الانتقال للتالي بأمان
      const skipTimer = window.setTimeout(() => {
        if (index < visibleSteps.length - 1) {
          setIndex(index + 1);
          setAttempt(0);
        } else {
          onClose();
        }
      }, 0);
      return () => window.clearTimeout(skipTimer);
    }

    element.scrollIntoView({ block: 'center', behavior: 'smooth' });

    const measure = () => {
      setRect(element.getBoundingClientRect());
      rafRef.current = window.requestAnimationFrame(measure);
    };
    measure();

    return () => window.cancelAnimationFrame(rafRef.current);
  }, [open, index, attempt, visibleSteps, onClose]);

  // إعادة ضبط الجولة عند الفتح (نمط ضبط الحالة أثناء الرسم)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setIndex(0);
      setAttempt(0);
    }
  }

  if (!open || !rect) return null;

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const spotTop = Math.max(rect.top - PAD, 8);
  const spotLeft = Math.max(rect.left - PAD, 8);
  const spotWidth = Math.min(rect.width + PAD * 2, viewportW - 16);
  const spotHeight = Math.min(rect.height + PAD * 2, viewportH - 16);

  const placeBelow = spotTop + spotHeight + CARD_HEIGHT_ESTIMATE < viewportH - 12;
  const cardTop = placeBelow
    ? spotTop + spotHeight + 14
    : Math.max(12, spotTop - CARD_HEIGHT_ESTIMATE - 14);
  const cardLeft = Math.min(
    Math.max(12, spotLeft + spotWidth / 2 - CARD_WIDTH / 2),
    viewportW - CARD_WIDTH - 12
  );

  const step = visibleSteps[index];
  const isLast = index === visibleSteps.length - 1;

  return (
    <div className="fixed inset-0 z-[150]" role="dialog" aria-modal="true" aria-label="جولة إرشادية">
      {/* طبقة تعتيم + فتحة Spotlight حول العنصر */}
      <motion.div
        initial={false}
        animate={{
          top: spotTop,
          left: spotLeft,
          width: spotWidth,
          height: spotHeight,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed rounded-2xl border-2 border-[#c8fa55]/80"
        style={{ boxShadow: '0 0 0 9999px rgba(4, 6, 14, 0.74)' }}
      />

      {/* بطاقة الشرح */}
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ top: cardTop, left: cardLeft, width: CARD_WIDTH }}
        className="fixed rounded-2xl border border-white/15 bg-[#0b1020]/97 backdrop-blur-xl p-5 shadow-2xl text-right text-[#f7f8ff] space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#82efda]">
            <Compass size={13} />
            <span>
              الخطوة {index + 1} من {visibleSteps.length}
            </span>
          </span>
          <div className="flex items-center gap-1" aria-hidden="true">
            {visibleSteps.map((s, i) => (
              <span
                key={s.selector}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === index ? 'bg-[#c8fa55]' : i < index ? 'bg-[#c8fa55]/40' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        <h3 className="text-sm font-extrabold">{step.title}</h3>
        <p className="text-[11px] text-[#a7b1c7] leading-relaxed">{step.body}</p>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={onClose}
            className="text-[10px] font-bold text-[#9da9c0] hover:text-white underline underline-offset-4 cursor-pointer"
          >
            تخطِّ الجولة
          </button>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                onClick={() => setIndex(index - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/15 text-[10px] font-bold hover:bg-white/10 cursor-pointer"
              >
                <ArrowRight size={12} />
                <span>السابق</span>
              </button>
            )}
            <button
              onClick={() => (isLast ? onClose() : setIndex(index + 1))}
              className="inline-flex items-center gap-1 bg-[#c8fa55] text-[#080b16] px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-[#d8ff7a] cursor-pointer"
            >
              {isLast ? (
                <>
                  <CheckCircle2 size={12} />
                  <span>إنهاء الجولة</span>
                </>
              ) : (
                <>
                  <span>التالي</span>
                  <ArrowLeft size={12} />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
