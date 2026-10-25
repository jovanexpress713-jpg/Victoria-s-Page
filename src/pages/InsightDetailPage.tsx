import React from 'react';
import { ArrowRight, ArrowUpRight, ExternalLink, BookOpen } from 'lucide-react';
import { INSIGHTS } from '../data/insights';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  MotionReveal,
  MotionStaggerContainer,
  MotionStaggerItem,
} from '../components/MotionReveal';
import { SafeImage } from '../components/SafeImage';

interface InsightDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const InsightDetailPage: React.FC<InsightDetailPageProps> = ({ slug, navigate }) => {
  const article = INSIGHTS.find((a) => a.slug === slug);
  usePageMeta({
    title: article ? article.title : 'المقال غير موجود',
    description: article?.summary,
  });

  if (!article) {
    return (
      <div className="bg-[var(--vls-paper)] min-h-screen py-24 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-[var(--vls-ink)]">المقال غير موجود</h2>
          <p className="text-xs text-[var(--vls-ink-muted)]">ربما تم نقل الرابط أو تعديله.</p>
          <button
            onClick={() => navigate('/insights')}
            className="inline-flex items-center gap-2 bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[var(--vls-btn-bg-hover)] cursor-pointer"
          >
            <span>العودة لمركز المعرفة</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  const related = INSIGHTS.filter((a) => a.slug !== slug).slice(0, 2);

  return (
    <div className="bg-[var(--vls-paper)] text-[var(--vls-ink)] min-h-screen py-10 sm:py-16 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => navigate('/insights')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--vls-accent)] hover:underline cursor-pointer"
        >
          <ArrowRight size={14} />
          <span>العودة إلى مركز المعرفة</span>
        </button>

        {/* Article Header */}
        <MotionReveal yOffset={24}>
          <header className="space-y-4">
            <div className="text-xs font-mono font-bold text-[var(--vls-accent)] tracking-wider">
              {article.tag} · {article.category}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-[var(--vls-ink)]">
              {article.title}
            </h1>
            <p className="text-sm sm:text-base text-[var(--vls-ink-muted)] leading-relaxed max-w-3xl">
              {article.summary}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-[var(--vls-ink-muted)] font-mono pt-2 border-b border-[var(--vls-line)] pb-6">
              <span>{article.date}</span>
              <span>·</span>
              <span>{article.read_time} قراءة</span>
            </div>
          </header>
        </MotionReveal>

        {/* Cover Photo */}
        <MotionReveal yOffset={20}>
          <div className="h-64 sm:h-[420px] rounded-3xl overflow-hidden border border-[var(--vls-line)] shadow-md bg-[#111725]">
            <SafeImage
              src={article.image}
              alt={article.title}
              eager
              className="w-full h-full object-cover"
            />
          </div>
        </MotionReveal>

        {/* Article Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Body */}
          <div className="lg:col-span-8 space-y-10">
            {article.sections.map((section, idx) => (
              <MotionReveal key={idx} yOffset={20} className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-black text-[var(--vls-ink)] border-r-4 border-[#647f20] pr-3">
                  {section.heading}
                </h2>
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-xs sm:text-sm text-[#4f585e] leading-loose">
                    {p}
                  </p>
                ))}
              </MotionReveal>
            ))}

            {/* Source Reference Card */}
            <MotionReveal yOffset={18}>
              <div className="p-5 rounded-2xl border border-[var(--vls-line)] bg-[var(--vls-panel)] space-y-2">
                <strong className="text-xs font-bold text-[var(--vls-ink)] block flex items-center gap-1.5">
                  <BookOpen size={14} className="text-[var(--vls-accent)]" />
                  <span>مصدر للقراءة والتوسع</span>
                </strong>
                <p className="text-[11px] text-[var(--vls-ink-muted)] leading-relaxed">
                  يقدم هذا المقال قراءة تحليلية لاتجاهات وتقارير عالمية منشورة، ولا يعتبر نصيحة قانونية أو تدقيقاً تقنياً منفصلاً.
                </p>
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--vls-accent)] hover:underline pt-1"
                >
                  <span>{article.source_title}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </MotionReveal>
          </div>

          {/* Sticky Takeaways Sidebar */}
          <aside className="lg:col-span-4 sticky top-24 space-y-6">
            <MotionReveal yOffset={24}>
              <div className="rounded-3xl border border-[var(--vls-line)] bg-[var(--vls-panel)] p-6 shadow-sm space-y-4">
                <span className="text-[10px] font-mono font-bold text-[var(--vls-accent)] tracking-wider block">
                  KEY TAKEAWAYS
                </span>
                <h3 className="text-base font-extrabold text-[var(--vls-ink)]">الخلاصة العملية</h3>
                <ul className="space-y-2.5 text-xs text-[#525a60]">
                  {article.takeaways.map((point, idx) => (
                    <li key={idx} className="flex gap-2 items-start leading-relaxed">
                      <span className="text-[var(--vls-accent)] font-bold text-sm shrink-0">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-[var(--vls-line-soft)]">
                  <button
                    onClick={() => navigate('/contact')}
                    className="w-full bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] py-3 rounded-full text-xs font-bold hover:bg-[var(--vls-btn-bg-hover)] transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <span>ناقش احتياج شركتك</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </MotionReveal>
          </aside>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="border-t border-[var(--vls-line)] pt-12 space-y-6">
            <MotionReveal yOffset={20}>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-mono font-bold text-[var(--vls-accent)]">KEEP EXPLORING</span>
                  <h2 className="text-2xl font-black mt-1">قد يهمك أيضاً</h2>
                </div>
                <button
                  onClick={() => navigate('/insights')}
                  className="text-xs font-bold text-[var(--vls-accent)] hover:underline cursor-pointer"
                >
                  كل المقالات ↗
                </button>
              </div>
            </MotionReveal>

            <MotionStaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerChildren={0.1}>
              {related.map((item) => (
                <MotionStaggerItem key={item.slug}>
                  <article
                    onClick={() => navigate(`/insights/${item.slug}`)}
                    className="rounded-2xl border border-[var(--vls-line)] bg-[var(--vls-panel)] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between h-full"
                  >
                    <div className="h-40 overflow-hidden bg-[#111725]">
                      <SafeImage
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5 space-y-2">
                      <h3 className="text-sm font-bold text-[var(--vls-ink)] leading-snug">{item.title}</h3>
                      <p className="text-xs text-[var(--vls-ink-muted)] line-clamp-2">{item.summary}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--vls-accent)] pt-2">
                        <span>اقرأ المقال</span>
                        <ArrowUpRight size={13} />
                      </span>
                    </div>
                  </article>
                </MotionStaggerItem>
              ))}
            </MotionStaggerContainer>
          </section>
        )}
      </div>
    </div>
  );
};
