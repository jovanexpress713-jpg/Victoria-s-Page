import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import {
  MotionReveal,
  MotionStaggerContainer,
  MotionStaggerItem,
} from '../components/MotionReveal';
import { usePageMeta } from '../hooks/usePageMeta';
import { SafeImage } from '../components/SafeImage';

interface ProductsPageProps {
  navigate: (path: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ navigate }) => {
  usePageMeta({ title: 'الحلول والخدمات', description: 'كتالوج خدمات Victoria Line Soft: مواقع ومتاجر، أنظمة وتطبيقات، هوية وتصميم، وذكاء اصطناعي تطبيقي.' });

  const [filter, setFilter] = useState('all');

  const catalog = [
    {
      category: 'web',
      number: '01 / WEB',
      icon: '◫',
      image: '/projects/service-web.jpg',
      title: 'المواقع والمنصات الرقمية',
      desc: 'مواقع تعريفية وصفحات خدمات ومنصات مخصصة بتجربة واضحة على الهاتف والكمبيوتر، مهيأة للظهور في محركات البحث وبناء الانطباع الاحترافي.',
      scope: 'حسب نطاق المشروع',
      service: 'website',
    },
    {
      category: 'web',
      number: '02 / COMMERCE',
      icon: '▦',
      image: '/projects/service-store.jpg',
      title: 'المتاجر الإلكترونية',
      desc: 'عرض المنتجات والطلبات ورحلة شراء واضحة، مع تحديد احتياجات الدفع والتوصيل والربط مع واتساب قبل التنفيذ لضمان سهولة الإدارة.',
      scope: 'حسب نطاق المشروع',
      service: 'store',
    },
    {
      category: 'software',
      number: '03 / APP',
      icon: '▣',
      image: '/projects/service-app.jpg',
      title: 'التطبيقات والمنتجات الرقمية',
      desc: 'تجارب ويب أو جوال مصممة حول مهمة المستخدم واحتياجات المنتج الفعلية، نبدأ فيها بنموذج واجهات اختباري يقلل الهدر ويسرّع الإطلاق.',
      scope: 'حسب نطاق المشروع',
      service: 'app',
    },
    {
      category: 'software',
      number: '04 / SYSTEM',
      icon: '◈',
      image: '/projects/service-system.jpg',
      title: 'أنظمة إدارة الأعمال',
      desc: 'تنظيم العملاء والطلبات والعمليات والتقارير في سير عمل يمكن مراجعته وتطويره، مما يريح فريقك من التشتت بين ملفات إكسل والرسائل المتفرقة.',
      scope: 'حسب نطاق المشروع',
      service: 'system',
    },
    {
      category: 'creative',
      number: '05 / BRAND',
      icon: '✳',
      image: '/projects/service-brand.jpg',
      title: 'الهوية البصرية والتصميم',
      desc: 'هوية متناسقة وواجهات وعناصر بصرية تخدم شخصية العلامة وتطبيقاتها على المنتجات الرقمية والمطبوعات لبناء حضور لا يُنسى.',
      scope: 'حسب نطاق المشروع',
      service: 'branding',
    },
    {
      category: 'ai',
      number: '06 / AI',
      icon: '✧',
      image: '/projects/service-ai.jpg',
      title: 'الذكاء الاصطناعي والأتمتة',
      desc: 'استكشاف مهام مناسبة للأتمتة ومساعدات ذكية ضمن حدود واضحة وإشراف بشري لفرز الاستفسارات وتأهيل العملاء دون وعود وهمية.',
      scope: 'يتطلب التحقق من التكاملات',
      service: 'ai',
    },
    {
      category: 'creative',
      number: '07 / GUIDANCE',
      icon: '?',
      title: 'لسه مش محدد احتياجك؟',
      desc: 'استخدم موجّه المشروع التفاعلي أو تواصل مع مساعد Victoria AI لترتيب فكرتك خطوة بخطوة وإعداد ملخص واضح.',
      scope: 'خطوة استكشافية مجانية',
      service: 'guidance',
      isGuidance: true,
    },
  ];

  const filteredCatalog = catalog.filter((item) => filter === 'all' || item.category === filter);

  return (
    <div className="bg-[var(--vls-paper)] text-[var(--vls-ink)] min-h-screen py-10 sm:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero */}
        <MotionReveal yOffset={28}>
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-[var(--vls-accent)] text-xs font-bold tracking-wider">
                حلول عملية · تجربة واضحة · تطوير قابل للنمو
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                التقنية التي تناسب عملك،
                <br />
                <em className="not-italic text-[var(--vls-accent)]">لا العكس.</em>
              </h1>
              <p className="text-sm sm:text-base text-[var(--vls-ink-muted)] leading-relaxed max-w-lg">
                استكشف مجالات التطوير، قارن نوع الحل الذي تحتاجه، ثم انتقل إلى تجربة تفاعلية أو جهّز طلب مشروعك. نبدأ من الهدف ونختار الوظائف المناسبة بدل بيع خصائص لا تحتاجها.
              </p>
              <div className="flex flex-wrap gap-4 pt-3">
                <button
                  onClick={() => navigate('/lab')}
                  className="bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] px-6 py-3 rounded-full text-xs font-bold hover:bg-[var(--vls-btn-bg-hover)] transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>جرّب المنتجات الحية</span>
                  <ArrowUpRight size={15} />
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="text-xs font-bold text-[#59634b] hover:text-[var(--vls-ink)] px-4 py-3 cursor-pointer"
                >
                  ناقش مشروعك ←
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 h-72 sm:h-96 rounded-3xl overflow-hidden bg-[#11182f] shadow-xl relative border border-[#6675a8]/40">
              <svg className="w-full h-full object-cover" viewBox="0 0 720 420" role="img">
                <defs>
                  <linearGradient id="pxbg" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#11182f" />
                    <stop offset="1" stopColor="#26345b" />
                  </linearGradient>
                </defs>
                <rect width="720" height="420" fill="url(#pxbg)" />
                <circle cx="530" cy="105" r="190" fill="#8c7cff" opacity=".12" />
                <rect x="50" y="48" width="620" height="324" rx="20" fill="#0b1225" stroke="#6675a8" strokeOpacity=".7" />
                <text x="80" y="84" fontSize="11" letterSpacing="2" fill="#7ce6d8">PRODUCT STUDIO / VLS</text>
                <text x="80" y="119" fontSize="25" fontWeight="800" fill="#fff">From concept to capability.</text>
                <g transform="translate(80 154)">
                  <rect width="158" height="166" rx="13" fill="#1b2747" stroke="#8f80f3" />
                  <text x="19" y="111" fontSize="13" fontWeight="700" fill="#fff">Strategy</text>
                  <text x="19" y="133" fontSize="9" fill="#aab6d1">Goals · Scope</text>
                </g>
                <g transform="translate(282 154)">
                  <rect width="158" height="166" rx="13" fill="#1b2747" stroke="#7ce6d8" />
                  <text x="19" y="111" fontSize="13" fontWeight="700" fill="#fff">Build</text>
                  <text x="19" y="133" fontSize="9" fill="#aab6d1">Design · Engineering</text>
                </g>
                <g transform="translate(484 154)">
                  <rect width="156" height="166" rx="13" fill="#1b2747" stroke="#f0a8dc" />
                  <text x="19" y="111" fontSize="13" fontWeight="700" fill="#fff">Improve</text>
                  <text x="19" y="133" fontSize="9" fill="#aab6d1">Test · Learn · Iterate</text>
                </g>
              </svg>
              <div className="absolute top-4 left-4 bg-[#111827]/85 text-white text-[10px] px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-md">
                DESIGN → BUILD → IMPROVE
              </div>
              <div className="absolute bottom-5 right-5 text-white text-right">
                <b className="block text-lg font-bold">من الفكرة إلى الاستخدام</b>
                <span className="text-[11px] text-[#d1d9ec]">حلول رقمية تصنع فرقاً عملياً</span>
              </div>
            </div>
          </section>
        </MotionReveal>

        {/* Catalog */}
        <section className="space-y-8">
          <MotionReveal yOffset={20} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-[var(--vls-accent)] text-xs font-bold tracking-wider">ماذا يمكننا بناؤه؟</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">خدمات مترابطة، من الفكرة إلى التشغيل</h2>
            </div>
            <p className="text-xs text-[var(--vls-ink-muted)] max-w-sm">
              اختر المجال الذي يناسبك. تختلف التكلفة والمدة حسب نطاق كل مشروع، والتفاصيل النهائية تُحدد بعد مراجعة احتياجك.
            </p>
          </MotionReveal>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'كل الخدمات' },
              { id: 'web', label: 'مواقع ومتاجر' },
              { id: 'software', label: 'أنظمة وتطبيقات' },
              { id: 'creative', label: 'هوية وتصميم' },
              { id: 'ai', label: 'ذكاء اصطناعي' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filter === f.id
                    ? 'bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] shadow-sm'
                    : 'bg-[var(--vls-panel)] border border-[#dce2ed] text-[#566178] hover:bg-black/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Cards Grid with Framer Motion Stagger & AnimatePresence */}
          <MotionStaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" staggerChildren={0.07}>
            <AnimatePresence mode="popLayout">
              {filteredCatalog.map((item) => (
                <MotionStaggerItem key={item.title}>
                  <article
                    className={`group flex flex-col justify-between p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg h-full overflow-hidden ${
                      item.isGuidance
                        ? 'bg-[#edf2e3] border-[var(--vls-line)]'
                        : 'bg-[var(--vls-panel)] border-[var(--vls-line)] hover:border-[#c7d6ad]'
                    }`}
                  >
                    <div>
                      {item.image && (
                        <div className="relative -m-6 mb-4 h-40 overflow-hidden shrink-0">
                          <div className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.08]">
                            <SafeImage
                              src={item.image}
                              alt={`نموذج من ${item.title}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-[var(--vls-panel)] via-transparent to-transparent pointer-events-none" />
                          <span className="absolute top-3 right-4 text-[10px] font-black text-white/95 bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-lg tracking-wider">
                            {item.number}
                          </span>
                          <div className="absolute bottom-3 right-4 w-10 h-10 rounded-xl bg-[var(--vls-panel)]/85 backdrop-blur-md text-[var(--vls-accent)] flex items-center justify-center text-lg font-bold shadow-md border border-[var(--vls-line)]">
                            {item.icon}
                          </div>
                        </div>
                      )}
                      {!item.image && (
                        <span className="text-[10px] font-black text-[#8b9384] tracking-wider block">
                          {item.number}
                        </span>
                      )}
                      {!item.image && (
                        <div className="w-11 h-11 rounded-xl bg-[var(--vls-accent-soft)] text-[var(--vls-accent)] flex items-center justify-center text-xl font-bold my-3">
                          {item.icon}
                        </div>
                      )}
                      <h3 className="text-base font-extrabold text-[var(--vls-ink)] mb-2">{item.title}</h3>
                      <p className="text-xs text-[var(--vls-ink-muted)] leading-relaxed mb-6">{item.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-[var(--vls-line-soft)] flex justify-between items-center text-xs">
                      <span className="text-[10px] text-[var(--vls-ink-muted)]">{item.scope}</span>
                      <button
                        onClick={() =>
                          navigate(
                            item.isGuidance
                              ? '/#project-architect'
                              : `/contact?service=${item.service}`
                          )
                        }
                        className="font-extrabold text-[var(--vls-accent)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{item.isGuidance ? 'ابنِ تصورك' : 'ناقش هذا الحل'}</span>
                        <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </article>
                </MotionStaggerItem>
              ))}
            </AnimatePresence>
          </MotionStaggerContainer>
        </section>

        {/* Live Lab Banner */}
        <MotionReveal yOffset={24}>
          <section className="rounded-3xl bg-gradient-to-r from-[#171d32] to-[#2c2859] text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold">لا تتخيل المنتج فقط. جرّبه.</h2>
              <p className="text-xs sm:text-sm text-[#b9c3d9]">
                متجر مصغّر، لوحة بيانات تشغيلية، استوديو هوية، وتجربة جوال تفاعلية مباشرة داخل المتصفح.
              </p>
            </div>
            <button
              onClick={() => navigate('/lab')}
              className="bg-[#c8fa55] text-[var(--vls-ink)] px-6 py-3 rounded-full text-xs font-black hover:bg-[var(--vls-panel)] transition-all cursor-pointer shrink-0"
            >
              افتح المختبر الحي ↗
            </button>
          </section>
        </MotionReveal>

        {/* 4-Step Methodology */}
        <section className="space-y-8 border-t border-[var(--vls-line)] pt-14">
          <MotionReveal yOffset={20}>
            <div>
              <span className="text-[var(--vls-accent)] text-xs font-bold tracking-wider">منهجية العمل</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">كل خطوة واضحة قبل التي بعدها</h2>
            </div>
          </MotionReveal>

          <MotionStaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerChildren={0.08}>
            {[
              {
                step: '01',
                title: 'فهم الاحتياج',
                desc: 'نحدد الهدف والمستخدمين والمشكلة الأساسية بدقة.',
              },
              {
                step: '02',
                title: 'تحديد النطاق',
                desc: 'نتفق على الوظائف والأولويات وما يحتاج إلى تأكيد.',
              },
              {
                step: '03',
                title: 'التصميم والتطوير',
                desc: 'نبني تجربة متجاوبة مع مراجعات مرحلية واضحة.',
              },
              {
                step: '04',
                title: 'الاختبار والتسليم',
                desc: 'نختبر الوظائف ضمن النطاق المتفق عليه قبل الإطلاق.',
              },
            ].map((p, idx) => (
              <MotionStaggerItem key={idx}>
                <div className="p-5 rounded-2xl bg-[var(--vls-panel)] border border-[var(--vls-line)] space-y-2 h-full">
                  <b className="text-sm font-mono text-[#7566e8]">{p.step}</b>
                  <h3 className="text-sm font-bold text-[var(--vls-ink)]">{p.title}</h3>
                  <p className="text-xs text-[var(--vls-ink-muted)] leading-relaxed">{p.desc}</p>
                </div>
              </MotionStaggerItem>
            ))}
          </MotionStaggerContainer>
        </section>

        {/* Bottom CTA */}
        <MotionReveal yOffset={24}>
          <section className="rounded-3xl bg-[#c8fa55] p-8 sm:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--vls-ink)]">فكرتك جاهزة للخطوة الأولى؟</h2>
              <p className="text-xs sm:text-sm text-[#4e5b36]">
                أرسل وصفاً بسيطاً، وسنساعدك على تحديد النطاق المناسب بدون تعقيدات.
              </p>
            </div>
            <button
              onClick={() => navigate('/contact')}
              className="bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] px-7 py-3.5 rounded-full text-xs font-black hover:bg-[var(--vls-btn-bg-hover)] transition-all cursor-pointer shrink-0"
            >
              ابدأ مشروعك ↗
            </button>
          </section>
        </MotionReveal>
      </div>
    </div>
  );
};
