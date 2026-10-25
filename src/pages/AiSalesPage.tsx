import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { processAIChat, AIResponse } from '../services/ai';
import { MotionReveal } from '../components/MotionReveal';
import { usePageMeta } from '../hooks/usePageMeta';

interface AiSalesPageProps {
  navigate: (path: string) => void;
}

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  meta?: string;
}

export const AiSalesPage: React.FC<AiSalesPageProps> = ({ navigate }) => {
  usePageMeta({ title: 'مساعد Victoria AI', description: 'محادثة ذكية تساعدك على توضيح فكرة مشروعك وترتيب أولوياتك والخطوة التالية المناسبة.' });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'أهلاً بك! أنا Victoria AI، المساعد الرقمي لشركة Victoria Line Soft. احكِ لي عن فكرتك أو المشكلة التي تريد حلها في عملك، وسأساعدك على ترتيبها خطوة بخطوة.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<AIResponse | null>(null);
  const chatLogRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'أريد موقعاً احترافياً يجلب عملاء لشركتنا',
    'أريد متجراً إلكترونياً لبيع المنتجات عبر الإنترنت',
    'أريد نظاماً ينظم فواتيري وعملياتي اليومية',
    'لدي فكرة تطبيق جوال وأريد معرفة خطوات البدء',
  ];

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await processAIChat(text, {
        conversation: newMessages.map((m) => ({ role: m.role, content: m.content })),
      });
      setLastResult(response);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply,
          meta: response.status === 'AI_LIVE' ? 'رد من Victoria AI' : 'رد إرشادي',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'تعذر الاتصال بالخدمة مؤقتاً. يمكنك إرسال تفاصيل مشروعك عبر نموذج التواصل الرسمي.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--vls-paper)] text-[var(--vls-ink)] min-h-screen py-10 sm:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero */}
        <MotionReveal yOffset={28}>
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[#6556d8] text-xs font-mono font-bold tracking-wider">
                VICTORIA AI · PROJECT DISCOVERY
              </span>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                خلّ فكرتك تتكلم.
                <br />
                <em className="not-italic text-[#7566e8]">ونرتبها معك.</em>
              </h1>
              <p className="text-sm text-[var(--vls-ink-muted)] leading-relaxed max-w-xl">
                مساعد استكشاف ذكي يساعدك على وصف فكرتك، تحديد الهدف التجاري، وفهم الخطوة التالية بدون تعقيدات أو مصطلحات تقنية مبهمة.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-full text-[11px] bg-[var(--vls-panel)] border border-[var(--vls-line)] text-[#657188]">
                  فهم الاحتياج
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] bg-[var(--vls-panel)] border border-[var(--vls-line)] text-[#657188]">
                  تحديد نطاق أولي
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] bg-[var(--vls-panel)] border border-[var(--vls-line)] text-[#657188]">
                  اقتراح الخطوة التالية
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 h-64 sm:h-72 rounded-3xl overflow-hidden bg-[#101729] shadow-xl relative border border-white/10">
              <svg className="w-full h-full object-cover" viewBox="0 0 720 420" role="img">
                <rect width="720" height="420" fill="#11172e" />
                <circle cx="360" cy="205" r="170" fill="#9d8cff" opacity=".08" />
                <g stroke="#8176d8" strokeOpacity=".65" strokeWidth="2">
                  <path d="M360 205L170 104M360 205L550 104M360 205L160 306M360 205L560 306M360 205L360 65M360 205L360 350" />
                </g>
                <g fill="#1d2849" stroke="#9d8cff" strokeWidth="2">
                  <rect x="85" y="62" width="170" height="84" rx="14" />
                  <rect x="465" y="62" width="170" height="84" rx="14" />
                  <rect x="70" y="265" width="180" height="84" rx="14" />
                  <rect x="470" y="265" width="180" height="84" rx="14" />
                </g>
                <g fontSize="11" fontWeight="700" textAnchor="middle" fill="#fff">
                  <text x="170" y="100">Business context</text>
                  <text x="550" y="100">Connected tools</text>
                  <text x="160" y="303">Human review</text>
                  <text x="560" y="303">Useful output</text>
                </g>
                <g transform="translate(287 150)">
                  <rect width="146" height="112" rx="22" fill="#111a34" stroke="#7ce6d8" strokeWidth="3" />
                  <circle cx="73" cy="40" r="22" fill="#8c7aff" opacity=".22" />
                  <text x="73" y="82" fontSize="13" fontWeight="800" textAnchor="middle" fill="#fff">
                    Victoria AI
                  </text>
                  <text x="73" y="98" fontSize="8" textAnchor="middle" fill="#aab6d4">
                    Assist, not magic
                  </text>
                </g>
              </svg>
              <div className="absolute bottom-4 right-4 text-white text-right">
                <b className="text-base font-bold block">الذكاء الاصطناعي لخدمة الهدف</b>
                <span className="text-[10px] text-[#d1d8e9]">DISCOVERY · CLARITY · NEXT STEP</span>
              </div>
            </div>
          </section>
        </MotionReveal>

        {/* Workspace */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Side Info */}
          <MotionReveal yOffset={20} className="lg:col-span-4">
            <aside className="rounded-3xl border border-[var(--vls-line)] bg-[var(--vls-panel)] p-6 shadow-sm space-y-6">
              <div>
                <span className="text-[#6556d8] text-xs font-bold block">كيف يساعدك؟</span>
                <h2 className="text-xl font-bold mt-1 text-[var(--vls-ink)]">حوّل الغموض إلى خطوات</h2>
                <p className="text-xs text-[var(--vls-ink-muted)] leading-relaxed mt-2">
                  لا تحتاج إلى مصطلحات تقنية. اكتب ما تريد تحقيقه كما تفكر فيه، حتى لو كانت الفكرة غير مكتملة بعد.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { num: '01', title: 'اشرح فكرتك', desc: 'ما المشكلة أو الفرصة التي تريد التعامل معها؟' },
                  { num: '02', title: 'حدّد النتيجة', desc: 'بيع أكثر، تنظيم العمل، أو تقوية العلامة.' },
                  { num: '03', title: 'احصل على خطوة تالية', desc: 'ملخص عملي قابل للنقاش الفوري.' },
                ].map((s, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="w-7 h-7 rounded-lg bg-[#f0eeff] text-[#6556d8] font-bold text-xs flex items-center justify-center shrink-0">
                      {s.num}
                    </span>
                    <div>
                      <b className="text-xs font-bold block text-[var(--vls-ink)]">{s.title}</b>
                      <span className="text-[11px] text-[#7b8699] leading-tight block">{s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {lastResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="p-4 rounded-2xl bg-[#f0f9ff] border border-[#bae6fd] space-y-2"
                  >
                    <span className="text-xs font-bold text-[#0369a1] block flex items-center gap-1.5">
                      <CheckCircle2 size={15} />
                      <span>تقييم الاستكشاف الأولي: {lastResult.lead_score}%</span>
                    </span>
                    <p className="text-[11px] text-[#0c4a6e] leading-relaxed">
                      الهدف المكتشف: <strong>{lastResult.lead.need || 'استكشاف عام'}</strong>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => navigate('/contact')}
                className="w-full bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] py-3 rounded-xl text-xs font-bold hover:bg-[var(--vls-btn-bg-hover)] transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>أرسل طلب مشروع رسمي</span>
                <ArrowUpRight size={14} />
              </button>

              <p className="text-[10px] text-[#94a3b8] leading-relaxed border-t border-[#f1f5f9] pt-3">
                لا تدخل كلمات مرور أو بيانات مالية حساسة. لا يعتبر الرد حجزاً أو التزاماً نهائياً قبل الاتفاق الرسمي مع الفريق.
              </p>
            </aside>
          </MotionReveal>

          {/* Chat Window */}
          <MotionReveal yOffset={24} className="lg:col-span-8">
            <div className="rounded-3xl border border-[var(--vls-line)] bg-[var(--vls-panel)] shadow-md overflow-hidden flex flex-col min-h-[560px]">
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-[#e7eaf3] bg-gradient-to-l from-[#fbfbff] to-[#f1f1ff]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a79aff] to-[#6556d8] text-white font-black text-lg flex items-center justify-center shadow-md">
                    V
                  </div>
                  <div>
                    <b className="text-xs font-extrabold text-[var(--vls-ink)] block">Victoria AI</b>
                    <small className="text-[10px] text-[#7d879b]">مساعد استكشاف المشاريع الرقمية</small>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[#27b68b] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#27b68b] animate-pulse" />
                  <span>المساعد الذكي متصل</span>
                </span>
              </div>

              {/* Chat Log */}
              <div
                ref={chatLogRef}
                className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[420px] bg-gradient-to-b from-white to-[#fbfcff]"
              >
                {messages.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-gradient-to-r from-[#7566e8] to-[#4d88e8] text-white rounded-bl-sm shadow-sm'
                          : 'bg-[#f0f2f9] text-[#39465f] rounded-br-sm'
                      }`}
                    >
                      {m.content}
                      {m.meta && (
                        <span className="block text-[9px] opacity-70 mt-1.5 font-mono">
                          {m.meta}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-[#7566e8] font-bold p-2 animate-pulse">
                    <Sparkles size={14} />
                    <span>Victoria AI يحلل فكرتك ويرتب الرد…</span>
                  </div>
                )}
              </div>

              {/* Dynamic Next Step Box */}
              <AnimatePresence>
                {lastResult && lastResult.next_step && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-6 mb-3 p-4 rounded-2xl bg-[#f1fff9] border border-[#ccebdd] text-[#176c50] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 overflow-hidden"
                  >
                    <div>
                      <b className="text-xs font-bold block">الخطوة المقترحة: {lastResult.next_step}</b>
                      <p className="text-[11px] text-[#1e5842] mt-0.5">
                        {lastResult.follow_up_question || 'أرسل تفاصيل المتطلبات للفريق لمراجعتها واعتماد العرض.'}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        navigate(
                          `/contact?service=${encodeURIComponent(
                            lastResult.lead.need || 'website'
                          )}&details=${encodeURIComponent(lastResult.reply)}`
                        )
                      }
                      className="bg-[#176c50] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#12543e] transition-all cursor-pointer shrink-0"
                    >
                      جهّز طلب مشروع ↗
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Prompts */}
              <div className="px-6 py-2 flex flex-wrap gap-2 border-t border-[#f0f2f7]">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(qp)}
                    className="px-3 py-1.5 rounded-full text-[10px] font-semibold bg-[#f8f9fd] border border-[#e0e5ef] text-[#59657a] hover:bg-[#f0eeff] hover:text-[#6556d8] transition-colors cursor-pointer"
                  >
                    {qp}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-4 border-t border-[#e8ecf3] flex gap-3 items-center bg-[var(--vls-panel)]"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="اكتب فكرتك أو استفسارك هنا..."
                  className="flex-1 resize-none px-4 py-3 rounded-xl border border-[#dce3ee] bg-[#fbfcff] text-xs outline-none focus:border-[#7566e8] transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="bg-gradient-to-r from-[#7566e8] to-[#4d88e8] text-white px-5 py-3 rounded-xl text-xs font-bold hover:shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>إرسال</span>
                  <Send size={13} />
                </button>
              </form>
            </div>
          </MotionReveal>
        </section>
      </div>
    </div>
  );
};
