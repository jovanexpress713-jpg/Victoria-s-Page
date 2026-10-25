import React from 'react';
import { Target, Eye, HeartHandshake, ShieldCheck, ArrowUpRight, Gem } from 'lucide-react';
import { MotionReveal, MotionStaggerContainer, MotionStaggerItem } from '../components/MotionReveal';
import { usePageMeta } from '../hooks/usePageMeta';
import { SITE } from '../config/site';

interface AboutPageProps {
  navigate: (path: string) => void;
}

const VALUES = [
  {
    icon: Target,
    title: 'الهدف قبل الأداة',
    body: 'لا نبيع تقنيات؛ نحل مشاكل تجارية قابلة للقياس. كل قرار تصميمي وبرمجي يبدأ من سؤال: كيف يخدم هذا نمو عميلنا؟',
  },
  {
    icon: Eye,
    title: 'وضوح كامل',
    body: 'نطاق عمل مكتوب، جدول زمني معلن، وسعر مبني على حصر متطلبات حقيقي — لا وعود مطاطية ولا تكاليف مفاجئة.',
  },
  {
    icon: HeartHandshake,
    title: 'شراكة لا تنفيذ',
    body: 'نعمل كامتداد لفريقك: تدريب، توثيق، ودعم بعد التسليم يضمن أن الأداة تُستخدم فعلاً ولا تُهجر.',
  },
  {
    icon: ShieldCheck,
    title: 'جودة تُقاس',
    body: 'اختبارات آلية، فحص أنواع، ومعايير وصولية وأداء في كل تسليم — لأن الثقة تُبنى بالأدلة لا بالشعارات.',
  },
];

const JOURNEY = [
  {
    year: '2024',
    title: 'البداية كفرصة مستقلة',
    body: 'مشاريع تصميم وتطوير محدودة لعملاء محليين، وبناء منهجية العمل الأربع مراحل.',
  },
  {
    year: '2025',
    title: 'التحول إلى استوديو',
    body: 'فريق متعدد التخصصات، وأول أنظمة إدارة مخصصة للمتاجر والعيادات في اليمن والخليج.',
  },
  {
    year: '2026',
    title: 'منصة Victoria Line Soft',
    body: 'إطلاق المتجر الرقمي والمختبر الحي والمساعد الذكي — خدماتنا أصبحت قابلة للتجربة قبل الشراء.',
  },
];

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  usePageMeta({
    title: 'من نحن',
    description:
      'قصة Victoria Line Soft وقيمها ومنهجها: استوديو رقمي مستقل يبني أدوات تنفع الناس وتخدم الأهداف التجارية.',
  });

  return (
    <div className="bg-[var(--vls-paper)] text-[var(--vls-ink)] min-h-screen py-12 sm:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero */}
        <MotionReveal yOffset={28}>
          <section className="relative max-w-3xl space-y-5">
            <div className="absolute -top-10 -left-10 w-52 h-52 rounded-full border border-[var(--vls-accent)]/30 animate-orbit-slow pointer-events-none opacity-50" />
            <span className="text-[var(--vls-accent)] text-xs font-mono font-bold tracking-wider">
              ABOUT · من نحن
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              استوديو رقمي مستقل
              <br />
              <em className="not-italic text-[var(--vls-accent)]">يبني أدوات تنفع الناس.</em>
            </h1>
            <p className="text-sm sm:text-base text-[var(--vls-ink-muted)] leading-relaxed max-w-2xl">
              بدأنا من قناعة بسيطة: التقنية في منطقتنا تُباع كوعود لا كأدوات. لذلك أسسنا
              {' '}{SITE.name} لتكون عكس ذلك تماماً — كل مشروع يبدأ من هدف تجاري مكتوب، ويُسلَّم
              بأدلة تشغيل ونتائج قابلة للقياس، ويدعمه شريك يفهم سياق السوق المحلي وطموح السوق العالمي.
            </p>
          </section>
        </MotionReveal>

        {/* Values */}
        <section className="space-y-6">
          <MotionReveal yOffset={18}>
            <h2 className="text-2xl sm:text-3xl font-black">قيم نلتزم بها في كل تسليم</h2>
          </MotionReveal>
          <MotionStaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5" staggerChildren={0.08}>
            {VALUES.map((value) => (
              <MotionStaggerItem key={value.title}>
                <article className="h-full p-6 rounded-3xl border border-[var(--vls-line)] bg-[var(--vls-panel)] shadow-sm space-y-3 hover:-translate-y-1 transition-transform">
                  <span className="w-11 h-11 rounded-2xl bg-[var(--vls-accent-soft)] text-[var(--vls-accent-deep)] flex items-center justify-center">
                    <value.icon size={20} />
                  </span>
                  <h3 className="text-base font-extrabold">{value.title}</h3>
                  <p className="text-xs text-[var(--vls-ink-muted)] leading-relaxed">{value.body}</p>
                </article>
              </MotionStaggerItem>
            ))}
          </MotionStaggerContainer>
        </section>

        {/* Journey */}
        <section className="space-y-6">
          <MotionReveal yOffset={18}>
            <h2 className="text-2xl sm:text-3xl font-black">رحلتنا</h2>
          </MotionReveal>
          <div className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:right-[15px] before:w-px before:bg-[var(--vls-line)]">
            {JOURNEY.map((step) => (
              <MotionReveal key={step.year} yOffset={16}>
                <div className="relative pr-12 space-y-1">
                  <span className="absolute right-0 top-1 w-8 h-8 rounded-full bg-[var(--vls-panel)] border-2 border-[var(--vls-accent)] text-[var(--vls-accent)] text-[10px] font-black flex items-center justify-center">
                    {step.year.slice(2)}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[var(--vls-ink-muted)]">
                    {step.year}
                  </span>
                  <h3 className="text-base font-extrabold">{step.title}</h3>
                  <p className="text-xs text-[var(--vls-ink-muted)] leading-relaxed max-w-2xl">
                    {step.body}
                  </p>
                </div>
              </MotionReveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <MotionReveal yOffset={20}>
          <section className="relative overflow-hidden rounded-[32px] border border-[var(--vls-line)] bg-[var(--vls-panel)] p-8 sm:p-12 text-center space-y-5">
            <div className="absolute inset-0 pointer-events-none opacity-60" aria-hidden="true">
              <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-[#7163d7]/15 blur-[100px]" />
              <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-[#318eaa]/12 blur-[100px]" />
            </div>
            <span className="relative inline-flex items-center gap-2 text-[var(--vls-accent)] text-xs font-mono font-bold tracking-wider">
              <Gem size={14} />
              <span>خطوتك التالية</span>
            </span>
            <h2 className="relative text-2xl sm:text-4xl font-black">
              عندك فكرة؟ خلّنا نحوّلها لأداة تشتغل.
            </h2>
            <p className="relative text-xs sm:text-sm text-[var(--vls-ink-muted)] max-w-xl mx-auto leading-relaxed">
              جرّب المختبر الحي لتراها بعينك، أو أرسل لنا فكرة مشروعك وسنعود إليك بخطة واضحة
              ونطاق عمل دقيق.
            </p>
            <div className="relative flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/contact')}
                className="inline-flex items-center gap-2 bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] px-6 py-3 rounded-xl text-xs font-black hover:bg-[var(--vls-btn-bg-hover)] transition-colors cursor-pointer"
              >
                <span>ابدأ مشروعك</span>
                <ArrowUpRight size={15} />
              </button>
              <button
                onClick={() => navigate('/lab')}
                className="inline-flex items-center gap-2 border border-[var(--vls-line)] px-6 py-3 rounded-xl text-xs font-bold hover:bg-[var(--vls-hover-soft)] transition-colors cursor-pointer"
              >
                <span>جرّب المختبر الحي</span>
              </button>
            </div>
          </section>
        </MotionReveal>
      </div>
    </div>
  );
};
