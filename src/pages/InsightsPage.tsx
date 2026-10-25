import React, { useState } from 'react';
import { Search, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { INSIGHTS, BUSINESS_CHECK_RECOMMENDATIONS } from '../data/insights';
import {
  MotionReveal,
  MotionStaggerContainer,
  MotionStaggerItem,
} from '../components/MotionReveal';
import { usePageMeta } from '../hooks/usePageMeta';
import { SafeImage } from '../components/SafeImage';

interface InsightsPageProps {
  navigate: (path: string) => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ navigate }) => {
  usePageMeta({ title: 'مركز المعرفة والرؤى', description: 'مقالات عملية عن الذكاء الاصطناعي والتجارة الإلكترونية والأمن الرقمي وتأثيرها على الأعمال.' });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedCheck, setSelectedCheck] = useState<keyof typeof BUSINESS_CHECK_RECOMMENDATIONS | null>(
    null
  );

  const categories = ['الكل', 'الذكاء الاصطناعي', 'التجارة الإلكترونية', 'الأمن الرقمي'];

  const filteredArticles = INSIGHTS.filter((article) => {
    const matchesCategory =
      selectedCategory === 'الكل' || article.category === selectedCategory;
    const matchesSearch =
      searchTerm.trim() === '' ||
      `${article.title} ${article.summary} ${article.category}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const checkOptions = [
    { key: 'store' as const, icon: '🛍️', title: 'أريد زيادة الطلبات والمبيعات', sub: 'متجر وتجربة شراء' },
    { key: 'system' as const, icon: '📊', title: 'شغلي مشتت بين ملفات ورسائل', sub: 'نظام ولوحة تحكم' },
    { key: 'ai' as const, icon: '✳', title: 'أريد خدمة أسرع وأتمتة', sub: 'مساعد ذكي وسير عمل' },
    { key: 'security' as const, icon: '🛡️', title: 'أحتاج تنظيم البيانات والصلاحيات', sub: 'أمان وحوكمة' },
  ];

  return (
    <div className="bg-[var(--vls-paper)] text-[var(--vls-ink)] min-h-screen py-10 sm:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero */}
        <MotionReveal yOffset={28}>
          <section className="relative overflow-hidden pt-4 pb-10 border-b border-[var(--vls-line)]">
            {/* Orbit element */}
            <div className="absolute left-6 top-6 w-44 h-44 rounded-full border border-[var(--vls-accent)] animate-orbit-slow pointer-events-none opacity-40 shadow-[0_0_0_28px_rgba(200,250,85,0.08)]" />

            <div className="max-w-3xl space-y-4">
              <span className="text-[var(--vls-accent)] text-xs font-mono font-bold tracking-wider">
                VICTORIA INSIGHTS · 2026
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                افهم ما يتغيّر.
                <br />
                <em className="not-italic text-[var(--vls-accent)]">واستعد للخطوة التالية.</em>
              </h1>
              <p className="text-sm sm:text-base text-[var(--vls-ink-muted)] leading-relaxed">
                مقالات وأفكار عملية عن الذكاء الاصطناعي، والتجارة الإلكترونية، والأنظمة الرقمية، والأمن التقني — وما الذي تعنيه هذه الاتجاهات لعملك فعلاً.
              </p>
            </div>
          </section>
        </MotionReveal>

        {/* Toolbar & Filters */}
        <section className="space-y-8">
          <MotionReveal yOffset={18}>
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن موضوع، مثل: الذكاء الاصطناعي أو المتاجر..."
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-panel)] text-xs outline-none focus:border-[#647f20] transition-colors"
                />
                <Search
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--vls-ink-muted)]"
                />
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap gap-2 items-center">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] shadow'
                        : 'bg-[var(--vls-panel)] border border-[var(--vls-line)] text-[#60676d] hover:bg-black/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <span className="text-xs text-[var(--vls-ink-muted)] font-mono mr-2">
                  ({filteredArticles.length} مقالات)
                </span>
              </div>
            </div>
          </MotionReveal>

          {/* Articles Grid */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-[var(--vls-line)] rounded-2xl bg-white/50 text-[var(--vls-ink-muted)] space-y-2">
              <p className="font-bold text-sm">لم نجد موضوعاً مطابقاً لبحثك.</p>
              <p className="text-xs">جرّب كلمة بحث أخرى أو اختر تصنيفاً مختلفاً.</p>
            </div>
          ) : (
            <MotionStaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerChildren={0.08}>
              {filteredArticles.map((article) => (
                <MotionStaggerItem key={article.slug}>
                  <article
                    onClick={() => navigate(`/insights/${article.slug}`)}
                    className="rounded-2xl border border-[var(--vls-line)] bg-[var(--vls-panel)] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all cursor-pointer flex flex-col justify-between group h-full"
                  >
                    <div>
                      {/* Cover Image */}
                      <div className="h-48 relative overflow-hidden bg-[#111725]">
                        <SafeImage
                          src={article.image}
                          alt={article.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md border border-white/60 text-[var(--vls-accent)] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                          {article.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div className="text-[10px] text-[var(--vls-ink-muted)] font-mono">
                          {article.date} · {article.read_time}
                        </div>
                        <h3 className="text-base font-extrabold text-[var(--vls-ink)] group-hover:text-[var(--vls-accent)] transition-colors leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-xs text-[var(--vls-ink-muted)] leading-relaxed line-clamp-3">
                          {article.summary}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--vls-accent)] group-hover:underline">
                        <span>اقرأ المقال</span>
                        <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </article>
                </MotionStaggerItem>
              ))}
            </MotionStaggerContainer>
          )}
        </section>

        {/* Quick Business Check Widget */}
        <section className="rounded-3xl border border-[var(--vls-line)] bg-[var(--vls-panel)] p-6 sm:p-10 shadow-sm space-y-8">
          <MotionReveal yOffset={20}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[var(--vls-line-soft)] pb-6">
              <div>
                <span className="text-[var(--vls-accent)] text-xs font-mono font-bold tracking-wider">
                  A QUICK BUSINESS CHECK
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-1">ما هو أول شيء يحتاجه عملك؟</h2>
              </div>
              <p className="text-xs text-[var(--vls-ink-muted)] max-w-md leading-relaxed">
                اختر التحدي الأقرب إلى واقعك الحالي، وسنقترح عليك خطوة بداية عملية ومقالة استرشادية تناسبك.
              </p>
            </div>
          </MotionReveal>

          <MotionStaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerChildren={0.06}>
            {checkOptions.map((opt) => {
              const isSelected = selectedCheck === opt.key;
              return (
                <MotionStaggerItem key={opt.key}>
                  <button
                    type="button"
                    onClick={() => setSelectedCheck(opt.key)}
                    className={`text-right p-4 rounded-2xl border transition-all cursor-pointer w-full h-full ${
                      isSelected
                        ? 'bg-[var(--vls-accent-soft)] border-[#647f20] shadow-sm'
                        : 'bg-[var(--vls-input-bg)] border-[var(--vls-line)] hover:bg-[var(--vls-accent-soft)]/50'
                    }`}
                  >
                    <span className="text-2xl block mb-2">{opt.icon}</span>
                    <strong className="block text-xs font-bold text-[var(--vls-ink)]">{opt.title}</strong>
                    <small className="block text-[10px] text-[var(--vls-ink-muted)] mt-1">{opt.sub}</small>
                  </button>
                </MotionStaggerItem>
              );
            })}
          </MotionStaggerContainer>

          {/* Recommendation Box */}
          <AnimatePresence>
            {selectedCheck && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="p-6 rounded-2xl bg-[var(--vls-accent-soft)] border border-[#c7d6ad] space-y-3"
              >
                <span className="text-[10px] font-mono font-bold text-[var(--vls-accent)] tracking-wider block">
                  YOUR RECOMMENDED NEXT STEP
                </span>
                <h3 className="text-base font-extrabold text-[var(--vls-ink)]">
                  {BUSINESS_CHECK_RECOMMENDATIONS[selectedCheck].title}
                </h3>
                <p className="text-xs text-[#4a5538] leading-relaxed max-w-2xl">
                  {BUSINESS_CHECK_RECOMMENDATIONS[selectedCheck].text}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate(BUSINESS_CHECK_RECOMMENDATIONS[selectedCheck].link)}
                    className="inline-flex items-center gap-2 bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[var(--vls-btn-bg-hover)] transition-all cursor-pointer"
                  >
                    <span>{BUSINESS_CHECK_RECOMMENDATIONS[selectedCheck].label}</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};
