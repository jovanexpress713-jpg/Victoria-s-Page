import React from 'react';
import { Database, ShieldCheck, Eye, Trash2, Mail } from 'lucide-react';
import { MotionReveal } from '../components/MotionReveal';
import { usePageMeta } from '../hooks/usePageMeta';
import { SITE } from '../config/site';
import { buildWhatsAppUrl } from '../services/storage';

interface PrivacyPageProps {
  navigate: (path: string) => void;
}

const STORED_ITEMS = [
  {
    key: 'vls_quotes_v2',
    what: 'طلبات عروض السعر التي ترسلها من نموذج التواصل',
    why: 'ليتمكن فريق الإدارة من متابعتها وإعداد العرض',
  },
  {
    key: 'vls_leads_v2',
    what: 'بيانات التواصل التي تشاركها طوعاً (اسم، هاتف، بريد، احتياج)',
    why: 'لتصنيف أولوية الطلب والتواصل المناسب',
  },
  {
    key: 'vls_interactions_v2',
    what: 'سجل محادثاتك مع المساعد الذكي داخل الموقع',
    why: 'لتحسين إجابات المساعد وجودة التأهيل',
  },
  {
    key: 'vls_store_orders_v2',
    what: 'طلبات الشراء من المتجر',
    why: 'لتجهيز الطلب وتأكيد الاستلام عبر واتساب',
  },
  {
    key: 'vls_theme / vls_welcome_v1',
    what: 'تفضيل السمة (داكن/فاتح) وحالة مشاهدة شاشة الترحيب',
    why: 'لتجربة استخدام مريحة بدون تكرار غير مرغوب',
  },
];

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ navigate }) => {
  usePageMeta({
    title: 'سياسة الخصوصية',
    description:
      'كيف يتعامل موقع Victoria Line Soft مع بياناتك: ما الذي يُحفظ، وأين، ولماذا، وكيف تمارس حقوقك.',
  });

  return (
    <div className="bg-[var(--vls-paper)] text-[var(--vls-ink)] min-h-screen py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <MotionReveal yOffset={24}>
          <header className="space-y-4">
            <span className="text-[var(--vls-accent)] text-xs font-mono font-bold tracking-wider">
              PRIVACY · الخصوصية
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
              خصوصيتك جزء من جودة المنتج
            </h1>
            <p className="text-sm text-[var(--vls-ink-muted)] leading-relaxed max-w-2xl">
              نجمع الحد الأدنى الضروري فقط لتقديم الخدمة، ونخزنه محلياً في متصفحك ما أمكن،
              ولا نبيع بياناتك ولا نشاركها مع معلنين. هذه الصفحة تشرح بالتفصيل ماذا يحدث
              لبياناتك وحقوقك الكاملة عليها.
            </p>
          </header>
        </MotionReveal>

        <MotionReveal yOffset={18}>
          <section className="space-y-4">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <Database size={18} className="text-[var(--vls-accent)]" />
              <span>ما الذي يُحفظ وأين؟</span>
            </h2>
            <p className="text-xs text-[var(--vls-ink-muted)] leading-relaxed">
              يعمل هذا الموقع بدون خوادم تتبع: البيانات التشغيلية تُحفظ في تخزين متصفحك
              (LocalStorage) على جهازك أنت، وتستخدمها لوحة الإدارة عند فتحها من الجهاز نفسه.
              الجدول التالي يوضّح كامل المفاتيح المستخدمة:
            </p>
            <div className="overflow-x-auto rounded-2xl border border-[var(--vls-line)]">
              <table className="w-full text-right text-xs">
                <thead className="bg-[var(--vls-panel)] text-[var(--vls-ink)]">
                  <tr>
                    <th className="p-3 font-extrabold">المفتاح</th>
                    <th className="p-3 font-extrabold">ماذا يحتوي</th>
                    <th className="p-3 font-extrabold">الغرض</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--vls-line)] bg-[var(--vls-paper)]">
                  {STORED_ITEMS.map((item) => (
                    <tr key={item.key}>
                      <td className="p-3 font-mono font-bold text-[var(--vls-accent-deep)]">
                        {item.key}
                      </td>
                      <td className="p-3 text-[var(--vls-ink)]">{item.what}</td>
                      <td className="p-3 text-[var(--vls-ink-muted)]">{item.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </MotionReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <MotionReveal yOffset={16}>
            <article className="h-full p-5 rounded-2xl border border-[var(--vls-line)] bg-[var(--vls-panel)] space-y-2">
              <ShieldCheck size={18} className="text-[var(--vls-accent)]" />
              <h3 className="text-sm font-extrabold">بدون تتبع إعلاني</h3>
              <p className="text-[11px] text-[var(--vls-ink-muted)] leading-relaxed">
                لا كوكيز تتبع، لا بصمات متصفح، لا مشاركة بيانات مع شبكات إعلانية أو وسطاء بيع.
              </p>
            </article>
          </MotionReveal>
          <MotionReveal yOffset={16}>
            <article className="h-full p-5 rounded-2xl border border-[var(--vls-line)] bg-[var(--vls-panel)] space-y-2">
              <Eye size={18} className="text-[var(--vls-accent)]" />
              <h3 className="text-sm font-extrabold">موارد خارجية محدودة</h3>
              <p className="text-[11px] text-[var(--vls-ink-muted)] leading-relaxed">
                الخطوط العربية (Google Fonts) وروابط واتساب فقط. صور المشاريع مستضافة محلياً مع
                الموقع ولا تُطلب من خدمات خارجية.
              </p>
            </article>
          </MotionReveal>
          <MotionReveal yOffset={16}>
            <article className="h-full p-5 rounded-2xl border border-[var(--vls-line)] bg-[var(--vls-panel)] space-y-2">
              <Trash2 size={18} className="text-[var(--vls-accent)]" />
              <h3 className="text-sm font-extrabold">حذف فوري بيدك</h3>
              <p className="text-[11px] text-[var(--vls-ink-muted)] leading-relaxed">
                مسح بيانات تصفح الموقع من متصفحك يحذف كل ما سبق نهائياً، أو اطلب ذلك منا مباشرة
                وسنؤكد التنفيذ.
              </p>
            </article>
          </MotionReveal>
        </div>

        <MotionReveal yOffset={18}>
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold">حقوقك وطلبات البيانات</h2>
            <p className="text-xs text-[var(--vls-ink-muted)] leading-relaxed">
              لك الحق في الاطلاع على بياناتك، وتصحيحها، وحذفها، وسحب موافقتك في أي وقت.
              لتمرين أي من هذه الحقوق تواصل معنا عبر واتساب أو من صفحة التواصل، وسنستجيب
              خلال مدة معقولة لا تتجاوز أسبوعاً.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] px-5 py-2.5 rounded-xl text-xs font-black hover:bg-[var(--vls-btn-bg-hover)] transition-colors"
              >
                <Mail size={14} />
                <span>طلب متعلق بالخصوصية</span>
              </a>
              <button
                onClick={() => navigate('/contact')}
                className="inline-flex items-center gap-2 border border-[var(--vls-line)] px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[var(--vls-hover-soft)] transition-colors cursor-pointer"
              >
                <span>صفحة التواصل</span>
              </button>
            </div>
          </section>
        </MotionReveal>

        <p className="text-[10px] text-[var(--vls-ink-muted)] border-t border-[var(--vls-line)] pt-5">
          آخر تحديث للسياسة: أكتوبر 2026 · {SITE.name}
        </p>
      </div>
    </div>
  );
};
