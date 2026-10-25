import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveQuote } from '../services/storage';
import { processAIChat } from '../services/ai';
import { MotionReveal } from '../components/MotionReveal';
import { usePageMeta } from '../hooks/usePageMeta';

interface ContactPageProps {
  initialService?: string;
  initialDetails?: string;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  initialService = '',
  initialDetails = '',
}) => {
  usePageMeta({ title: 'تواصل معنا وابدأ مشروعك', description: 'أرسل طلب عرض سعر أو ناقش فكرتك مع المساعد الذكي — نوضح لك الخطوة التالية بدون التزام.' });

  // Quote form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(initialService || '');
  const [details, setDetails] = useState(initialDetails || '');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [quoteSaved, setQuoteSaved] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  // Embedded AI chat state
  const [visitorName, setVisitorName] = useState('');
  const [visitorCompany, setVisitorCompany] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [aiChatLog, setAiChatLog] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'مرحباً! اشرح لي فكرتك أو المشكلة التي تواجهك، وسأساعدك على ترتيب نقطة البداية.',
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // حقل فخ للبوتات: أي تعبئة له تُنهِي الإرسال بنجاح وهمي بدون حفظ
    if (honeypot.trim()) {
      setQuoteSaved(true);
      return;
    }
    if (!name.trim() || !phone.trim() || !service.trim()) {
      setQuoteError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 9 || phoneDigits.length > 15) {
      setQuoteError('يرجى إدخال رقم هاتف/واتساب صحيح (من 9 إلى 15 رقماً).');
      return;
    }
    if (!consent) {
      setQuoteError('يرجى الموافقة على استخدام البيانات للتواصل بشأن الطلب');
      return;
    }

    try {
      saveQuote({
        name,
        phone,
        service,
        details,
      });
      setQuoteSaved(true);
      setQuoteError('');
      setName('');
      setPhone('');
      setDetails('');
      setConsent(false);
    } catch {
      setQuoteError('حدث خطأ أثناء حفظ الطلب. يرجى المحاولة لاحقاً.');
    }
  };

  const handleSendAI = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = aiMessage.trim();
    if (!msg || aiLoading) return;

    setAiMessage('');
    const newLog = [...aiChatLog, { role: 'user' as const, text: msg }];
    setAiChatLog(newLog);
    setAiLoading(true);

    try {
      const response = await processAIChat(msg, {
        name: visitorName,
        company: visitorCompany,
        phone: visitorPhone,
        email: visitorEmail,
        conversation: newLog.map((l) => ({ role: l.role, content: l.text })),
      });
      setAiChatLog((prev) => [...prev, { role: 'assistant', text: response.reply }]);
    } catch {
      setAiChatLog((prev) => [
        ...prev,
        { role: 'assistant', text: 'سأساعدك في تحديد الخطوة التالية. يمكنك أيضاً إرسال النموذج أعلاه.' },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-[var(--vls-paper)] text-[var(--vls-ink)] min-h-screen py-10 sm:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Intro */}
        <MotionReveal yOffset={28}>
          <section className="max-w-3xl space-y-4">
            <span className="text-[var(--vls-accent)] text-xs font-mono font-bold tracking-wider">
              خلّنا نفهم احتياجك
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              فكرتك تستحق
              <br />
              <em className="not-italic text-[var(--vls-accent)]">خطة واضحة.</em>
            </h1>
            <p className="text-sm sm:text-base text-[var(--vls-ink-muted)] leading-relaxed">
              تقدر تبدأ بمحادثة إرشادية مع المساعد الذكي، أو ترسل طلب مشروع مباشر. سنوضح لك الخطوة التالية، ولن نعرض سعراً نهائياً قبل فهم نطاق العمل بدقة.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs font-bold text-[#59634b]">
              <span>✓ لا تحتاج خبرة تقنية</span>
              <span>✓ لا توجد أسعار وهمية</span>
              <span>✓ متابعة واضحة للطلب</span>
            </div>
          </section>
        </MotionReveal>

        {/* Success Alert */}
        <AnimatePresence>
          {quoteSaved && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="p-5 rounded-2xl bg-[var(--vls-accent-soft)] border border-[var(--vls-accent)]/40 text-[var(--vls-ink)] space-y-1.5 flex items-start gap-3 shadow-sm"
            >
              <CheckCircle2 size={20} className="text-[var(--vls-accent)] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-extrabold">وصل طلبك إلى النظام بنجاح!</strong>
                <p className="text-xs text-[#58684a] leading-relaxed">
                  شكراً لتواصلك. تم حفظ تفاصيل طلبك في لوحة الإدارة وسيقوم فريق Victoria Line Soft بمراجعته وإعداد مسودة العرض والتواصل معك عبر واتساب.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quote Form */}
          <MotionReveal yOffset={24} className="lg:col-span-7">
            <section className="rounded-3xl border border-[var(--vls-line)] bg-[var(--vls-panel)] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-[var(--vls-line-soft)] pb-4">
                <span className="text-xs font-mono font-bold text-[var(--vls-accent)]">01 · طلب مشروع</span>
                <h2 className="text-2xl font-black text-[var(--vls-ink)] mt-1">أرسل تفاصيل البداية</h2>
                <p className="text-xs text-[var(--vls-ink-muted)] mt-1">
                  املأ المعلومات الأساسية لتسجيل طلبك ومراجعته من فريق الشركة.
                </p>
              </div>

              {quoteError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold"
                >
                  {quoteError}
                </div>
              )}

              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                {/* حقل فخ مخفي عن البشر وظاهر للبوتات */}
                <div className="hidden" aria-hidden="true">
                  <label>
                    اترك هذا الحقل فارغاً
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--vls-ink)] mb-1.5">
                    الاسم الكريم *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={120}
                    placeholder="اسمك أو اسم المسؤول عن المشروع"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs outline-none focus:border-[#647f20] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--vls-ink)] mb-1.5">
                    رقم الهاتف أو واتساب *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={40}
                    placeholder="مثال: 967771119726"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs outline-none focus:border-[#647f20] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--vls-ink)] mb-1.5">
                    الخدمة المطلوبة *
                  </label>
                  <select
                    required
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs outline-none focus:border-[#647f20] transition-colors cursor-pointer"
                  >
                    <option value="">اختر الخدمة</option>
                    <option value="website">موقع أو منصة رقمية</option>
                    <option value="store">متجر إلكتروني</option>
                    <option value="app">تطبيق جوال أو ويب</option>
                    <option value="system">نظام لإدارة العمل</option>
                    <option value="branding">هوية بصرية وتصميم</option>
                    <option value="ai">ذكاء اصطناعي أو أتمتة</option>
                    <option value="guidance">استكشاف وتوجيه عام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--vls-ink)] mb-1.5">
                    اشرح لنا ما تحتاجه
                  </label>
                  <textarea
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    maxLength={4000}
                    placeholder="ما المشكلة التي تريد حلها؟ وما أهم شيء يجب أن يفعله المشروع؟"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs outline-none focus:border-[#647f20] transition-colors leading-relaxed"
                  />
                </div>

                <label className="flex items-start gap-2.5 pt-2 text-xs text-[var(--vls-ink-muted)] cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 accent-[#647f20]"
                  />
                  <span>أوافق على استخدام بياناتي للرد على هذا الطلب والتواصل بشأنه عبر واتساب أو الهاتف.</span>
                </label>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] py-3.5 rounded-full text-xs font-bold hover:bg-[var(--vls-btn-bg-hover)] transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>إرسال طلب المشروع</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>

                <p className="text-[10px] text-[var(--vls-ink-muted)] text-center pt-1">
                  لا تدخل كلمات مرور أو بيانات مالية حساسة في هذا النموذج.
                </p>
              </form>
            </section>
          </MotionReveal>

          {/* Embedded AI Assistant */}
          <MotionReveal yOffset={24} delay={0.1} className="lg:col-span-5">
            <section className="rounded-3xl border border-[var(--vls-line)] bg-[var(--vls-panel)] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--vls-line-soft)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#101318] text-[#c8fa55] font-black text-sm flex items-center justify-center">
                    V
                  </div>
                  <strong className="text-xs font-bold text-[var(--vls-ink)]">Victoria AI Assistant</strong>
                </div>
                <span className="text-[10px] text-[var(--vls-accent)] font-bold">جاهز للاستكشاف</span>
              </div>

              {/* Quick lead capture inputs */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="اسمك (اختياري)"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[var(--vls-line)] text-[11px] bg-[var(--vls-input-bg)] outline-none"
                />
                <input
                  type="text"
                  placeholder="اسم الشركة (اختياري)"
                  value={visitorCompany}
                  onChange={(e) => setVisitorCompany(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[var(--vls-line)] text-[11px] bg-[var(--vls-input-bg)] outline-none"
                />
                <input
                  type="tel"
                  placeholder="رقم واتساب (اختياري)"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[var(--vls-line)] text-[11px] bg-[var(--vls-input-bg)] outline-none"
                />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني (اختياري)"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[var(--vls-line)] text-[11px] bg-[var(--vls-input-bg)] outline-none"
                />
              </div>

              {/* Chat Messages */}
              <div className="h-64 overflow-y-auto rounded-xl p-3 bg-[var(--vls-input-bg)] border border-[var(--vls-line)] space-y-3">
                {aiChatLog.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`p-3 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                      c.role === 'user'
                        ? 'bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] mr-auto rounded-bl-sm'
                        : 'bg-[var(--vls-accent-soft)] text-[#30382c] ml-auto rounded-br-sm border-r-2 border-[#9dc83d]'
                    }`}
                  >
                    {c.text}
                  </motion.div>
                ))}
                {aiLoading && (
                  <div className="text-[11px] text-[var(--vls-accent)] flex items-center gap-1.5 font-bold animate-pulse p-1">
                    <Sparkles size={13} />
                    <span>جارٍ التفكير والرد…</span>
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSendAI} className="flex gap-2">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="اكتب استفسارك هنا..."
                  className="flex-1 px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-panel)] text-xs outline-none focus:border-[#647f20]"
                />
                <button
                  type="submit"
                  disabled={!aiMessage.trim() || aiLoading}
                  className="bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[var(--vls-btn-bg-hover)] disabled:opacity-50 cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>إرسال</span>
                  <Send size={12} />
                </button>
              </form>

              <p className="text-[10px] text-[var(--vls-ink-muted)] leading-relaxed pt-1">
                يساعدك المساعد على تحديد الاحتياج بدقة، ولن يتم اعتماد أي التزام قبل موافقتك.
              </p>
            </section>
          </MotionReveal>
        </div>
      </div>
    </div>
  );
};
