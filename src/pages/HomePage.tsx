import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDown,
  Sparkles,
  ChevronDown,
  ShoppingBag,
  Eye,
  CheckCircle2,
  Layers,
  Star,
  Quote,
} from 'lucide-react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import {
  MotionReveal,
  MotionStaggerContainer,
  MotionStaggerItem,
} from '../components/MotionReveal';
import { PortfolioItem } from '../types';
import { getStoredPortfolio, STORAGE_KEYS } from '../services/storage';
import { PortfolioModal } from '../components/PortfolioModal';
import { usePageMeta } from '../hooks/usePageMeta';
import { SafeImage } from '../components/SafeImage';

interface HomePageProps {
  navigate: (path: string) => void;
}


const STATS = [
  { value: 48, suffix: '+', label: 'مشروعاً مسلّماً' },
  { value: 35, suffix: '+', label: 'عميلاً نشطاً' },
  { value: 98, suffix: '%', label: 'رضا العملاء' },
  { value: 24, suffix: '/7', label: 'دعم ومتابعة' },
];

const TESTIMONIALS = [
  {
    name: 'م. أحمد الشرعبي',
    role: 'مدير مجموعة تجارية — صنعاء',
    quote:
      'سلّمونا نظام إدارة موحّد لفروعنا الثلاثة بعد حصر متطلبات دقيق. الالتزام بالمواعيد والوثائق المسلّمة شيء لم نعهده من قبل.',
  },
  {
    name: 'أ. سارة المقطري',
    role: 'مؤسسة علامة قهوة مختصة',
    quote:
      'متجرنا أطلق في ثلاثة أسابيع بتصميم يحكي هويتنا فعلاً، والمبيعات عبر واتساب انضبطت في لوحة واحدة. التجربة كانت أوضح من أي وكالة تعاملنا معها.',
  },
  {
    name: 'د. خالد العمري',
    role: 'مدير عيادة متخصصة',
    quote:
      'المختبر الحي خلاني أجرب النظام قبل الشراء — قررت وأنا مطمئن. بعد ستة أشهر: صفر مواعيد مزدوجة وت تقارير شهرية تلقائية.',
  },
];

const StatCounter: React.FC<{ value: number; suffix: string; label: string }> = ({
  value,
  suffix,
  label,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const start = performance.now();
    const duration = 1300;
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value]);

  const shown = reduce ? value : display;

  return (
    <div ref={ref} className="text-center space-y-1">
      <strong className="block text-3xl sm:text-4xl font-black font-mono text-white">
        {shown}
        <span className="text-[#c8fa55]">{suffix}</span>
      </strong>
      <small className="block text-[11px] text-[#9da9bf] font-bold">{label}</small>
    </div>
  );
};

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  usePageMeta({ title: 'استوديو رقمي متكامل', description: 'مواقع ومتاجر وأنظمة إدارة وهوية بصرية وذكاء اصطناعي تطبيقي — مع مختبر حي ومساعد ذكي لاستكشاف مشروعك.' });

  // 3D Core tilt state
  const visualRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!visualRef.current) return;
    const rect = visualRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 25, y: -y * 25 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Real Portfolio State
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() =>
    getStoredPortfolio()
  );
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(
    null
  );

  // مزامنة حية للمعرض عند تعديل البيانات من تبويب آخر (مركز الإدارة)
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.PORTFOLIO) {
        setPortfolioItems(getStoredPortfolio());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Project Architect wizard state
  const [archStep, setArchStep] = useState(1);
  const [archKind, setArchKind] = useState('website');
  const [archGoal, setArchGoal] = useState('growth');
  const [archTimeline, setArchTimeline] = useState('month');

  // Showcase filter
  const [showcaseFilter, setShowcaseFilter] = useState('all');

  // FAQ open states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const architectKinds = [
    { id: 'website', title: 'موقع أو منصة', desc: 'حضور رقمي يشرح ويحوّل', service: 'website' },
    { id: 'store', title: 'متجر إلكتروني', desc: 'منتجات وطلبات ومبيعات', service: 'store' },
    { id: 'system', title: 'نظام لإدارة العمل', desc: 'عملاء وعمليات وتقارير', service: 'system' },
    { id: 'brand', title: 'هوية وتصميم', desc: 'علامة لها حضور متناسق', service: 'branding' },
    { id: 'automation', title: 'ذكاء اصطناعي وأتمتة', desc: 'اختصار المهام المتكررة', service: 'ai' },
    { id: 'app', title: 'تطبيق جوال', desc: 'تجربة مخصصة على الهاتف', service: 'app' },
  ];

  const architectGoals = [
    { id: 'growth', title: 'زيادة المبيعات والطلبات', desc: 'مسار واضح وسهل لتحويل الزائر لعميل' },
    { id: 'operations', title: 'تنظيم العمليات وتوفير الوقت', desc: 'تقليل العمل اليدوي والأخطاء' },
    { id: 'presence', title: 'حضور احترافي وبناء ثقة', desc: 'واجهة تعكس ثقل الشركة وجودتها' },
    { id: 'clarity', title: 'اختبار فكرة جديدة بسرعة', desc: 'نموذج أولي قابل للقياس والتطوير' },
  ];

  const architectTimelines = [
    { id: 'urgent', title: 'عاجل (خلال أسبوعين)', desc: 'أولويات مركزة وإطلاق فوري' },
    { id: 'month', title: 'خلال شهر إلى شهرين', desc: 'نطاق متكامل مع اختبارات شاملة' },
    { id: 'flexible', title: 'استكشاف وتخطيط أولي', desc: 'تحديد المتطلبات بدقة أولاً' },
  ];

  const getArchitectSummary = () => {
    const selectedKind = architectKinds.find((k) => k.id === archKind)?.title;
    const selectedGoal = architectGoals.find((g) => g.id === archGoal)?.title;
    const selectedTimeline = architectTimelines.find((t) => t.id === archTimeline)?.title;

    return {
      title: `تصور مقترح: ${selectedKind}`,
      copy: `بناء ${selectedKind} يركز على ${selectedGoal}، مع خطة تنفيذ ${selectedTimeline}. سنرتب لك نطاق العمل واحتياجات الربط خطوة بخطوة.`,
      chips: [selectedKind || '', selectedGoal || '', selectedTimeline || '', 'عربي أولاً', 'دعم مستمر'],
      service: architectKinds.find((k) => k.id === archKind)?.service || 'website',
    };
  };

  const archSummary = getArchitectSummary();

  const services = [
    {
      icon: '◫',
      glow: '#9b8cff',
      title: 'مواقع ومنصات تفاعلية',
      desc: 'مواقع سريعة ومتجاوبة، صفحات هبوط، بوابات خدمات وتجارب رقمية توضّح قيمة العمل.',
      service: 'website',
      btn: 'اطلب موقعاً',
    },
    {
      icon: '▦',
      glow: '#82efda',
      title: 'متاجر وبيع رقمي',
      desc: 'كتالوجات منتجات، رحلة شراء واضحة، طلبات منظمة وتجهيز لمسار الدفع والتوصيل المناسب.',
      service: 'store',
      btn: 'جهّز متجرك',
    },
    {
      icon: '▤',
      glow: '#f3a5d5',
      title: 'أنظمة أعمال خاصة',
      desc: 'إدارة العملاء والمخزون والطلبات والحسابات والتقارير حسب طريقة عملك الفعلية.',
      service: 'system',
      btn: 'طوّر نظامك',
    },
    {
      icon: '✳',
      glow: '#7cc8ff',
      title: 'هوية بصرية وتجربة مستخدم',
      desc: 'شعار وهوية وواجهات منظمة ومتناسقة، من أول انطباع حتى أدق تفاصيل الاستخدام.',
      service: 'branding',
      btn: 'طوّر هويتك',
    },
    {
      icon: '⌘',
      glow: '#ffbf7e',
      title: 'ذكاء اصطناعي وأتمتة',
      desc: 'مساعدات ذكية وتدفقات عمل لتقليل التكرار وتأهيل العملاء ضمن رقابة بشرية واضحة.',
      service: 'ai',
      btn: 'ناقش فكرة ذكية',
    },
    {
      icon: '▣',
      glow: '#a7a9ff',
      title: 'تطبيقات جوال وويب',
      desc: 'نماذج أولية سريعة ثم تطبيقات مخصصة مبنية حول مهمة المستخدم وسهولة الاستخدام.',
      service: 'app',
      btn: 'ابدأ تطبيقك',
    },
  ];

  const faqs = [
    {
      q: 'كيف يبدأ العمل معكم؟',
      a: 'نبدأ بجلسة استكشاف قصيرة أو محادثة عبر الموقع لفهم المشكلة الأساسية، ثم نحدد نطاق العمل والمخرجات بدقة قبل البدء.',
    },
    {
      q: 'هل تقدمون أسعاراً ثابتة مسبقاً؟',
      a: 'نلتزم بالشفافية التامة؛ كل مشروع له متطلباته الخاصة، لذا نعطي تقديراً مفصلاً بعد تحديد الوظائف المطلوبة ولا نضع أسعاراً عشوائية.',
    },
    {
      q: 'هل يمكن ربط المتجر أو النظام مع واتساب؟',
      a: 'نعم، نوفر ربطاً مباشراً لاستقبال الطلبات، تأكيد الحجوزات، وإرسال عروض الأسعار التلقائية عبر واتساب بسلاسة.',
    },
    {
      q: 'هل أستطيع تجربة الأفكار قبل بدء المشروع؟',
      a: 'بالتأكيد! زر قسم "المختبر الحي" في الموقع لتجربة نماذج تفاعلية للمتجر، لوحة البيانات، استوديو الهوية، وتطبيق الجوال.',
    },
  ];

  return (
    <div className="bg-[#080b16] text-[#f7f8ff] overflow-hidden">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-white/10 py-3 text-[10px] text-[#aab6cd] flex justify-between items-center">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#82efda] animate-pulse" />
          <span>استوديو رقمي مستقل · نعمل عن بُعد</span>
        </span>
        <span className="tracking-widest font-mono">DESIGN · SOFTWARE · INTELLIGENCE</span>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center py-16 sm:py-24">
        {/* Radial ambient backgrounds */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#7163d7]/20 blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-[#318eaa]/15 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-6 text-right"
          >
            <div className="inline-flex items-center gap-2.5 text-[#82efda] text-xs font-bold tracking-wider">
              <span className="w-6 h-[1px] bg-current" />
              <span>نحوّل الأفكار إلى أدوات تنفع الناس</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.12]">
              المستقبل ليس صفحة.
              <br />
              <span className="bg-gradient-to-l from-[#7ddfe0] via-[#b8afff] to-white bg-clip-text text-transparent">
                إنه تجربة تُعاش.
              </span>
            </h1>

            <p className="text-[#b4bfd2] text-sm sm:text-base leading-relaxed max-w-xl">
              نصمّم ونطوّر مواقع ومنتجات رقمية وأنظمة ذكية تساعد الأعمال على الظهور بشكل أقوى، والعمل بوضوح أكبر، وبيع خدماتها عبر الإنترنت.
            </p>

            <div className="flex flex-wrap gap-4 pt-3">
              <button
                onClick={() => {
                  const el = document.getElementById('project-architect');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#a69aff] to-[#7c70ed] text-white px-6 py-3.5 rounded-full text-xs font-extrabold hover:shadow-[0_10px_35px_#6d63d540] hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>ابنِ تصور مشروعك</span>
                <ArrowUpRight size={16} />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('showcase');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2.5 bg-white/5 border border-white/20 text-[#f6f7ff] px-6 py-3.5 rounded-full text-xs font-extrabold hover:bg-white/10 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>اكتشف التجارب</span>
                <ArrowDown size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-[#9eabc1] pt-4">
              <span className="text-[#ffe1a2] tracking-widest">✦ ✦ ✦</span>
              <span>تجارب تفاعلية حقيقية</span>
              <span>·</span>
              <span>عربي أولاً، عالمي في الفكرة</span>
            </div>
          </motion.div>

          {/* 3D Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            ref={visualRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="lg:col-span-5 h-[420px] sm:h-[480px] relative flex items-center justify-center cursor-pointer select-none"
            aria-label="مجسم تفاعلي"
          >
            {/* Orbits */}
            <div className="absolute w-[360px] sm:w-[440px] h-[170px] sm:h-[190px] rounded-full border border-[#a69aff]/25 rotate-[-25deg] animate-orbit pointer-events-none" />
            <div className="absolute w-[380px] sm:w-[470px] h-[230px] sm:h-[270px] rounded-full border border-[#83efda]/20 rotate-[54deg] animate-orbit-reverse pointer-events-none" />
            <div className="absolute w-[300px] sm:w-[360px] h-[300px] sm:h-[360px] rounded-full border border-dashed border-white/10 animate-orbit-slow pointer-events-none" />
            <div className="absolute w-[220px] h-[220px] rounded-full border border-[#a69aff]/20 animate-pulse-ring pointer-events-none" />

            {/* Core Box */}
            <div
              style={{
                transform: `perspective(900px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                transition: 'transform 0.15s ease-out',
              }}
              className="w-40 sm:w-44 h-48 sm:h-52 rounded-[34px] relative z-10 flex flex-col items-center justify-center bg-gradient-to-br from-[#c2baff] via-[#8172ef] to-[#252d63] shadow-[inset_12px_12px_24px_rgba(255,255,255,0.35),inset_-18px_-20px_32px_rgba(20,22,56,0.7),0_30px_90px_rgba(109,99,214,0.35)]"
            >
              <span className="text-8xl sm:text-9xl font-black text-white drop-shadow-[0_12px_28px_rgba(41,32,84,0.6)]">
                V
              </span>
              <span className="absolute bottom-4 text-[7px] tracking-[2px] text-[#e5e3ff] font-bold">
                DIGITAL INTELLIGENCE
              </span>
            </div>

            {/* Float cards */}
            <div className="absolute top-8 right-0 z-20 border border-white/15 bg-[#101a2c]/85 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl animate-float">
              <strong className="block text-xs font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#9b8cff]/20 text-[#c3baff] inline-flex items-center justify-center text-xs">
                  ✧
                </span>
                تجربة تتجاوب معك
              </strong>
              <small className="block text-[9px] text-[#a4b0c8] mt-1">INTERACTIVE BY DESIGN</small>
            </div>

            <div
              style={{ animationDelay: '-2s' }}
              className="absolute bottom-10 left-0 z-20 border border-white/15 bg-[#101a2c]/85 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl animate-float"
            >
              <strong className="block text-xs font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#9b8cff]/20 text-[#c3baff] inline-flex items-center justify-center text-xs">
                  ⌘
                </span>
                فكرة ← منتج
              </strong>
              <small className="block text-[9px] text-[#a4b0c8] mt-1">FROM IDEA TO DIGITAL</small>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <MotionReveal yOffset={16} className="border-y border-white/10 bg-white/[0.02] overflow-hidden py-4">
        <div className="flex items-center gap-8 whitespace-nowrap animate-ticker text-xs font-mono text-[#9da9c0]">
          <span>WEB PLATFORMS</span>
          <b className="text-[#8e82ff]">✳</b>
          <span>BRAND SYSTEMS</span>
          <b className="text-[#8e82ff]">✳</b>
          <span>BUSINESS SOFTWARE</span>
          <b className="text-[#8e82ff]">✳</b>
          <span>AI AUTOMATION</span>
          <b className="text-[#8e82ff]">✳</b>
          <span>DIGITAL COMMERCE</span>
          <b className="text-[#8e82ff]">✳</b>
          <span>MOBILE EXPERIENCES</span>
          <b className="text-[#8e82ff]">✳</b>
          <span>WEB PLATFORMS</span>
          <b className="text-[#8e82ff]">✳</b>
          <span>BRAND SYSTEMS</span>
          <b className="text-[#8e82ff]">✳</b>
          <span>BUSINESS SOFTWARE</span>
        </div>
      </MotionReveal>

      {/* Project Architect Wizard Section */}
      <section id="project-architect" data-tour="architect" className="py-24 bg-gradient-to-b from-[#0b1020] to-[#080b16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal yOffset={26} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Intro */}
            <div className="lg:col-span-4 space-y-5">
              <div className="inline-flex items-center gap-2 text-[#82efda] text-xs font-bold">
                <span className="w-4 h-[1px] bg-current" />
                <span>موجّه المشروع</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                لا تعرف من أين تبدأ؟
                <br />
                <span className="bg-gradient-to-l from-[#7ddfe0] to-[#b8afff] bg-clip-text text-transparent">
                  ابدأ من فكرتك.
                </span>
              </h2>
              <p className="text-[#a7b1c7] text-xs sm:text-sm leading-relaxed">
                جاوب على ثلاث خطوات بسيطة، وسنرتب لك نوع الحل الأقرب لاحتياجك ورسالة جاهزة لتبدأ النقاش. لا تحتاج إلى معرفة تقنية.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03]">
                  <b className="text-[#c4bcff] text-xl block font-mono">01</b>
                  <span className="text-[10px] text-[#98a4bc]">اختر نوع الحل</span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03]">
                  <b className="text-[#c4bcff] text-xl block font-mono">02</b>
                  <span className="text-[10px] text-[#98a4bc]">حدد الهدف</span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03]">
                  <b className="text-[#c4bcff] text-xl block font-mono">03</b>
                  <span className="text-[10px] text-[#98a4bc]">حدد الموعد</span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03]">
                  <b className="text-[#82efda] text-xl block">↗</b>
                  <span className="text-[10px] text-[#98a4bc]">جاهز للتنفيذ</span>
                </div>
              </div>
            </div>

            {/* Interactive Wizard Card */}
            <div className="lg:col-span-8 rounded-3xl border border-white/15 bg-gradient-to-br from-[#111a2c] to-[#0b1020] p-6 sm:p-8 shadow-2xl">
              {/* Header */}
              <div className="flex justify-between items-center pb-5 border-b border-white/10 text-xs">
                <span className="font-mono text-[#bdc8dd]">VLS PROJECT ARCHITECT</span>
                <span className="inline-flex items-center gap-1.5 text-[#82efda] text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#82efda]" />
                  <span>توليد فوري</span>
                </span>
              </div>

              {/* Progress bars */}
              <div className="flex gap-2 my-5">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      archStep >= step ? 'bg-gradient-to-r from-[#9d8dff] to-[#82efda]' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Step Content with AnimatePresence */}
              <AnimatePresence mode="wait">
                {archStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <p className="text-xl font-bold">ما الذي تريد بناءه؟</p>
                    <p className="text-xs text-[#9eaac1]">اختر أقرب وصف لفكرتك.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {architectKinds.map((kind) => (
                        <button
                          key={kind.id}
                          type="button"
                          onClick={() => setArchKind(kind.id)}
                          className={`text-right p-4 rounded-xl border transition-all cursor-pointer ${
                            archKind === kind.id
                              ? 'bg-[#9283ff]/15 border-[#9b8cff] text-white shadow-[inset_0_0_0_1px_#9b8cff]'
                              : 'bg-white/[0.03] border-white/10 text-[#f4f6ff] hover:border-[#9b8cff]/50'
                          }`}
                        >
                          <b className="block text-xs font-bold">{kind.title}</b>
                          <small className="block text-[10px] text-[#9da9c0] mt-1">{kind.desc}</small>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {archStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <p className="text-xl font-bold">ما هو هدفك الأساسي؟</p>
                    <p className="text-xs text-[#9eaac1]">اختر النتيجة الأهم التي تسعى لتحقيقها.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {architectGoals.map((goal) => (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => setArchGoal(goal.id)}
                          className={`text-right p-4 rounded-xl border transition-all cursor-pointer ${
                            archGoal === goal.id
                              ? 'bg-[#9283ff]/15 border-[#9b8cff] text-white shadow-[inset_0_0_0_1px_#9b8cff]'
                              : 'bg-white/[0.03] border-white/10 text-[#f4f6ff] hover:border-[#9b8cff]/50'
                          }`}
                        >
                          <b className="block text-xs font-bold">{goal.title}</b>
                          <small className="block text-[10px] text-[#9da9c0] mt-1">{goal.desc}</small>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {archStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <p className="text-xl font-bold">ما هو الإطار الزمني المتوقع؟</p>
                    <p className="text-xs text-[#9eaac1]">متى تود إطلاق أو استلام المخرجات؟</p>
                    <div className="grid grid-cols-1 gap-3 pt-2">
                      {architectTimelines.map((time) => (
                        <button
                          key={time.id}
                          type="button"
                          onClick={() => setArchTimeline(time.id)}
                          className={`text-right p-4 rounded-xl border transition-all cursor-pointer ${
                            archTimeline === time.id
                              ? 'bg-[#9283ff]/15 border-[#9b8cff] text-white shadow-[inset_0_0_0_1px_#9b8cff]'
                              : 'bg-white/[0.03] border-white/10 text-[#f4f6ff] hover:border-[#9b8cff]/50'
                          }`}
                        >
                          <b className="block text-xs font-bold">{time.title}</b>
                          <small className="block text-[10px] text-[#9da9c0] mt-1">{time.desc}</small>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generated Result Box */}
              {archStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 p-5 rounded-2xl border border-[#82efda]/30 bg-[#82efda]/5 space-y-3"
                >
                  <h4 className="text-sm font-bold text-[#82efda] flex items-center gap-2">
                    <Sparkles size={16} />
                    <span>{archSummary.title}</span>
                  </h4>
                  <p className="text-xs leading-relaxed text-[#bdc9da]">{archSummary.copy}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {archSummary.chips.map((chip, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-[10px] bg-white/10 border border-white/20 text-white"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/contact?service=${archSummary.service}&details=${encodeURIComponent(
                            archSummary.copy
                          )}`
                        )
                      }
                      className="inline-flex items-center gap-2 bg-[#82efda] text-[#080b16] px-5 py-2.5 rounded-full text-xs font-extrabold hover:bg-white transition-all cursor-pointer"
                    >
                      <span>أرسل هذا الطلب للفريق</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Wizard Footer Controls */}
              <div className="flex justify-between items-center pt-6 mt-6 border-t border-white/10">
                <small className="text-[10px] text-[#8794ac]">
                  الخطوة {archStep} من 3 · لا تُحفظ بياناتك إلا عند الإرسال
                </small>
                <div className="flex items-center gap-2">
                  {archStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setArchStep(archStep - 1)}
                      className="px-4 py-2 rounded-full border border-white/20 text-xs font-bold text-white hover:bg-white/10 cursor-pointer"
                    >
                      السابق
                    </button>
                  )}
                  {archStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setArchStep(archStep + 1)}
                      className="px-5 py-2 rounded-full bg-[#9b8cff] text-[#100e22] text-xs font-black hover:bg-white cursor-pointer transition-all"
                    >
                      التالي ←
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setArchStep(1)}
                      className="px-4 py-2 rounded-full border border-white/20 text-xs font-bold text-white hover:bg-white/10 cursor-pointer"
                    >
                      إعادة البدء ↺
                    </button>
                  )}
                </div>
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      {/* Services Grid Section */}
      <section id="services" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal yOffset={24} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-[#82efda] text-xs font-bold">
              <span className="w-4 h-[1px] bg-current" />
              <span>ما الذي نبنيه؟</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3">من خدمة واحدة إلى منظومة رقمية متكاملة.</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#a7b1c7] max-w-sm">
            اختر ما تحتاجه الآن. يمكن البدء بنطاق صغير ثم تطويره عندما ينمو المشروع.
          </p>
        </MotionReveal>

        <MotionStaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" staggerChildren={0.08}>
          {services.map((s, idx) => (
            <MotionStaggerItem key={idx}>
              <article className="relative overflow-hidden p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#111a2b] to-[#0d1220] hover:border-[#a79bff]/50 hover:-translate-y-1.5 transition-all group h-full flex flex-col justify-between">
                <div>
                  <div
                    style={{ backgroundColor: s.glow }}
                    className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-10 group-hover:opacity-25 transition-opacity pointer-events-none"
                  />
                  <div className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.05] text-[#bcb2ff] flex items-center justify-center text-xl mb-5 font-bold">
                    {s.icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-[#9da9bf] leading-relaxed mb-6 min-h-[48px]">{s.desc}</p>
                </div>
                <button
                  onClick={() => navigate(`/contact?service=${s.service}`)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#c3baff] hover:text-white cursor-pointer pt-2"
                >
                  <span>{s.btn}</span>
                  <ArrowUpRight size={14} />
                </button>
              </article>
            </MotionStaggerItem>
          ))}
        </MotionStaggerContainer>
      </section>

      {/* Showcase Section — Real Portfolio & Store Gateway */}
      <section id="showcase" className="py-24 bg-[var(--vls-paper-subtle)] text-[var(--vls-ink)] transition-colors border-y border-[var(--vls-line)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal yOffset={24} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-[#9b8cff] text-xs font-bold tracking-wider">
                <Layers size={14} />
                <span>معرض الأعمال الحقيقية والمشاريع المعتمدة</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mt-2 text-[var(--vls-ink)]">
                مشاريع حية صنعت فارقاً حقيقياً لعملائنا.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--vls-ink-muted)] max-w-md leading-relaxed">
              تصفح نماذج من الأنظمة والمتاجر والتطبيقات التي طوّرناها. يمكنك الاطلاع على التحدي، الحل المبتكر، والنتائج بالأرقام.
            </p>
          </MotionReveal>

          {/* Quick Banner to the Store */}
          <div className="mb-10 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#9b8cff]/15 via-[#82efda]/10 to-transparent border border-[#9b8cff]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#9b8cff] text-[#080b16] flex items-center justify-center font-bold shrink-0">
                <ShoppingBag size={20} />
              </span>
              <div>
                <strong className="block text-xs sm:text-sm font-black text-[var(--vls-ink)]">
                  هل تبحث عن شراء تطبيق جاهز فوراً أو باقة تصميم تجاري محددة السعر؟
                </strong>
                <span className="text-[11px] text-[var(--vls-ink-muted)]">
                  وفّرنا لك في متجر فيكتوريا لاين تطبيقات جاهزة بكامل كود المصدر وباقات هوية تجارية بأسعار واضحة وتسليم فوري.
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/store')}
              className="inline-flex items-center gap-2 bg-[#101318] dark:bg-white text-white dark:text-[#101318] px-5 py-2.5 rounded-xl text-xs font-black hover:opacity-90 transition-all cursor-pointer shadow-md shrink-0"
            >
              <span>زيارة متجر التطبيقات والحلول</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { id: 'all', label: 'كافة الأعمال' },
              { id: 'system', label: 'أنظمة أعمال خاصة' },
              { id: 'commerce', label: 'متاجر إلكترونية' },
              { id: 'app', label: 'تطبيقات جوال' },
              { id: 'web', label: 'منصات وويب' },
              { id: 'brand', label: 'هوية وتصميم تجاري' },
              { id: 'ai', label: 'ذكاء اصطناعي' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setShowcaseFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  showcaseFilter === f.id
                    ? 'bg-[#101318] dark:bg-white text-white dark:text-[#101318] shadow-md'
                    : 'bg-[var(--vls-panel)] border border-[var(--vls-line)] text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Real Projects Grid */}
          <MotionStaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerChildren={0.08}>
            {portfolioItems
              .filter((p) => showcaseFilter === 'all' || p.category === showcaseFilter)
              .map((project) => (
                <MotionStaggerItem key={project.id}>
                  <article className="border border-[var(--vls-line)] rounded-2xl overflow-hidden bg-[var(--vls-panel)] shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all h-full flex flex-col justify-between group">
                    <div>
                      {/* Image Preview with Hover Zoom */}
                      <div className="h-56 relative overflow-hidden bg-black/10">
                        <SafeImage
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Category badge */}
                        <span className="absolute top-3 right-3 bg-[#101318]/90 text-[#82efda] text-[10px] px-3 py-1 rounded-full font-bold backdrop-blur-md">
                          {project.categoryLabel}
                        </span>

                        {/* Year & Client */}
                        <div className="absolute bottom-3 right-3 left-3 flex justify-between items-center text-white text-[11px] font-medium">
                          <span className="truncate max-w-[70%] font-semibold">{project.client}</span>
                          <span className="font-mono text-gray-300 text-[10px]">{project.year}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-base font-extrabold text-[var(--vls-ink)] my-1.5 group-hover:text-[#9b8cff] transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-xs text-[var(--vls-ink-muted)] leading-relaxed mb-4 line-clamp-2">
                          {project.summary}
                        </p>

                        {/* Quantifiable Highlight */}
                        {project.results && project.results[0] && (
                          <div className="p-2.5 rounded-xl bg-[#82efda]/10 border border-[#82efda]/20 text-[11px] font-semibold text-[var(--vls-ink)] flex items-center gap-2 mb-3">
                            <CheckCircle2 size={13} className="text-[#82efda] shrink-0" />
                            <span className="truncate">{project.results[0]}</span>
                          </div>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {project.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-[var(--vls-ink-muted)]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-5 pt-0 border-t border-[var(--vls-line)] flex items-center justify-between gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setSelectedPortfolioItem(project)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9b8cff] hover:underline cursor-pointer"
                      >
                        <Eye size={14} />
                        <span>دراسة الحالة كاملة</span>
                        <ArrowUpRight size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/contact?service=${project.category}&details=${encodeURIComponent(
                              `أريد تنفيذ مشروع مماثل لمشروع (${project.title})`
                            )}`
                          )
                        }
                        className="text-[11px] font-bold text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)] px-2.5 py-1 rounded-lg border border-[var(--vls-line)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                      >
                        طلب مماثل
                      </button>
                    </div>
                  </article>
                </MotionStaggerItem>
              ))}
          </MotionStaggerContainer>

          <div className="mt-10 p-4 rounded-xl bg-[var(--vls-panel)] border border-[var(--vls-line)] text-center text-xs text-[var(--vls-ink-muted)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>
              ✓ كافة الأعمال أعلاه مشاريع ونماذج حقيقية نفذت بدقة. يمكن للإدارة إضافة وتعديل الأعمال في أي وقت.
            </span>
            <button
              onClick={() => navigate('/admin')}
              className="text-[#9b8cff] font-bold hover:underline cursor-pointer shrink-0"
            >
              لوحة إدارة وتعديل معرض الأعمال ⚙️
            </button>
          </div>
        </div>
      </section>


      {/* Process Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal yOffset={24} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-[#82efda] text-xs font-bold">
              <span className="w-4 h-[1px] bg-current" />
              <span>منهج العمل</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3">مسار واضح من أول رسالة إلى التسليم.</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#a7b1c7] max-w-sm">
            تقدر تبدأ من المنزل، تتفق على نطاق واضح، وتتابع مراحل العمل خطوة بخطوة.
          </p>
        </MotionReveal>

        <MotionStaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerChildren={0.08}>
          {[
            {
              step: '01',
              title: 'نفهم الهدف',
              desc: 'نستمع لفكرتك، نحدد التحدي الأساسي ونوع الجمهور المستهدف بدون تعقيدات.',
            },
            {
              step: '02',
              title: 'نحدد النطاق',
              desc: 'نتفق على الميزات الأهم ومراحل التنفيذ ومسودة العرض قبل أي التزام مالي.',
            },
            {
              step: '03',
              title: 'نصمم ونبني',
              desc: 'نبني الواجهات والأنظمة المتجاوبة مع مراجعات مرحلية تضمن دقة المسار.',
            },
            {
              step: '04',
              title: 'نختبر ونسلّم',
              desc: 'اختبار كامل للوظائف على الهاتف والكمبيوتر، ودعم مستمر بعد الإطلاق.',
            },
          ].map((item, idx) => (
            <MotionStaggerItem key={idx}>
              <article className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] space-y-4 hover:border-white/25 transition-all h-full">
                <span className="block font-mono text-[#9c8eff] text-sm tracking-widest font-bold">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-[#9da9bf] leading-relaxed">{item.desc}</p>
              </article>
            </MotionStaggerItem>
          ))}
        </MotionStaggerContainer>
      </section>

      {/* Social proof: أرقام وشهادات */}
      <section className="py-20 bg-[#0a0f1e] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <MotionReveal yOffset={20}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-8 rounded-3xl border border-white/10 bg-white/[0.03]">
              {STATS.map((stat) => (
                <StatCounter key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
              ))}
            </div>
          </MotionReveal>

          <div className="space-y-6">
            <MotionReveal yOffset={18} className="text-center space-y-2">
              <span className="text-[#82efda] text-xs font-bold tracking-wider">شهادات العملاء</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                ثقة تُبنى بالتسليم لا بالكلام
              </h2>
            </MotionReveal>

            <MotionStaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5" staggerChildren={0.08}>
              {TESTIMONIALS.map((item) => (
                <MotionStaggerItem key={item.name}>
                  <article className="h-full p-6 rounded-3xl border border-white/10 bg-white/[0.04] space-y-4 flex flex-col">
                    <Quote size={18} className="text-[#9b8cff]" />
                    <p className="text-xs text-[#dfe3f2] leading-relaxed flex-1">{item.quote}</p>
                    <div className="flex items-center gap-1" aria-label="تقييم 5 من 5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className="text-[#f5c767] fill-[#f5c767]" />
                      ))}
                    </div>
                    <footer className="pt-3 border-t border-white/10">
                      <strong className="block text-xs font-extrabold text-white">{item.name}</strong>
                      <small className="block text-[10px] text-[#9da9bf] mt-0.5">{item.role}</small>
                    </footer>
                  </article>
                </MotionStaggerItem>
              ))}
            </MotionStaggerContainer>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 bg-gradient-to-b from-[#080b16] to-[#0c1222] border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal yOffset={20} className="text-center space-y-3 mb-12">
            <span className="text-[#82efda] text-xs font-bold tracking-wider">الأسئلة الشائعة</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">كل ما تحتاج معرفته قبل البدء</h2>
          </MotionReveal>

          <MotionStaggerContainer className="space-y-3" staggerChildren={0.06}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <MotionStaggerItem key={idx}>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-right p-4 sm:p-5 flex justify-between items-center text-xs sm:text-sm font-bold text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ChevronDown size={18} className="text-[#b5aaff]" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 text-xs text-[#9da9bf] leading-relaxed border-t border-white/5">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </MotionStaggerItem>
              );
            })}
          </MotionStaggerContainer>
        </div>
      </section>

      {/* Final CTA Panel */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal yOffset={28}>
          <div className="rounded-3xl border border-white/20 p-8 sm:p-14 bg-gradient-to-br from-[#141c31] via-[#0d1425] to-[#080b16] shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4 max-w-2xl relative z-10">
              <span className="text-[#82efda] text-xs font-bold tracking-wider">جاهز للانطلاق؟</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                حوّل الفكرة إلى واقع رقمي يعمل.
              </h2>
              <p className="text-xs sm:text-sm text-[#aeb9ce] leading-relaxed">
                تواصل معنا الآن عبر نموذج المشروع أو تحدث مباشرة مع مساعدنا الذكي Victoria AI لبدء الاستكشاف فوراً.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 relative z-10">
              <button
                onClick={() => navigate('/contact')}
                className="bg-[#f5f6ff] text-[#101425] px-7 py-3.5 rounded-full text-xs font-black hover:bg-[#82efda] hover:shadow-xl transition-all cursor-pointer"
              >
                ابدأ مشروعك ↗
              </button>
              <button
                onClick={() => navigate('/ai/sales')}
                className="bg-white/10 border border-white/20 text-white px-6 py-3.5 rounded-full text-xs font-bold hover:bg-white/20 transition-all cursor-pointer"
              >
                تحدث مع Victoria AI
              </button>
            </div>
          </div>
        </MotionReveal>
      </section>

      {/* Portfolio Case Study Deep Dive Modal */}
      <PortfolioModal
        item={selectedPortfolioItem}
        onClose={() => setSelectedPortfolioItem(null)}
        onRequestSimilar={(item) =>
          navigate(
            `/contact?service=${item.category}&details=${encodeURIComponent(
              `أريد تنفيذ مشروع مماثل لمشروع (${item.title}) لشركة (${item.client})`
            )}`
          )
        }
      />
    </div>
  );
};
