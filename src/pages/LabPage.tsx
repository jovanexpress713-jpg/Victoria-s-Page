import React, { useState, useRef } from 'react';
import { ArrowDown, Check, Minus, ShoppingBag, BarChart3, Palette, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionReveal } from '../components/MotionReveal';

interface CartItem {
  name: string;
  price: number;
  qty: number;
}

export const LabPage: React.FC = () => {
  // Orb 3D tilt
  const orbStageRef = useRef<HTMLDivElement>(null);
  const [orbTilt, setOrbTilt] = useState({ x: 0, y: 0 });

  const handleOrbMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!orbStageRef.current) return;
    const rect = orbStageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setOrbTilt({ x: x * 55, y: -y * 45 });
  };

  const handleOrbLeave = () => {
    setOrbTilt({ x: 0, y: 0 });
  };

  // Demo tabs
  const [activeTab, setActiveTab] = useState<'shop' | 'dashboard' | 'brand' | 'mobile'>('shop');

  // Tab 1: Shop state
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const shopProducts = [
    { name: 'Nova Phone X', desc: 'هاتف ذكي · تصميم تجريبي', price: 120, type: 'phone' },
    { name: 'Pulse Watch', desc: 'ساعة ذكية · تصميم تجريبي', price: 65, type: 'watch' },
    { name: 'Studio Headset', desc: 'سماعة رأس · تصميم تجريبي', price: 49, type: 'headset' },
  ];

  const addToCart = (product: { name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev[product.name];
      return {
        ...prev,
        [product.name]: {
          name: product.name,
          price: product.price,
          qty: (existing?.qty || 0) + 1,
        },
      };
    });
    setAddedItem(product.name);
    setTimeout(() => setAddedItem(null), 1000);
  };

  const removeFromCart = (name: string) => {
    setCart((prev) => {
      const current = prev[name];
      if (!current) return prev;
      if (current.qty <= 1) {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      }
      return {
        ...prev,
        [name]: { ...current, qty: current.qty - 1 },
      };
    });
  };

  const clearCart = () => setCart({});

  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  // Tab 2: Dashboard state
  const [dashRange, setDashRange] = useState<'week' | 'month'>('week');

  const dashData = {
    week: {
      orders: '128',
      sales: '$4,820',
      customers: '86',
      rate: '72%',
      bars: [
        { label: 'س', h: 32 },
        { label: 'ح', h: 54 },
        { label: 'ن', h: 44 },
        { label: 'ث', h: 72 },
        { label: 'ر', h: 61 },
        { label: 'خ', h: 87 },
        { label: 'ج', h: 69 },
      ],
      note: 'عرض 7 أيام — أرقام تجريبية لتوضيح حركة العمليات.',
    },
    month: {
      orders: '512',
      sales: '$18,460',
      customers: '294',
      rate: '68%',
      bars: [
        { label: '1', h: 42 },
        { label: '5', h: 61 },
        { label: '10', h: 50 },
        { label: '15', h: 76 },
        { label: '20', h: 67 },
        { label: '25', h: 91 },
        { label: '30', h: 80 },
      ],
      note: 'عرض 30 يوماً مجمّعاً — أرقام تجريبية لتوضيح حركة العمليات.',
    },
  };

  const activeDash = dashData[dashRange];

  // Tab 3: Brand studio state
  const [brandName, setBrandName] = useState('NOVA STUDIO');
  const [brandTagline, setBrandTagline] = useState('نصنع تجربة تترك أثراً');
  const [brandColor, setBrandColor] = useState('#7566e8');

  const brandColors = [
    { label: 'بنفسجي', hex: '#7566e8' },
    { label: 'تركوازي', hex: '#147d92' },
    { label: 'نحاسي', hex: '#c45b36' },
    { label: 'أخضر', hex: '#2f704d' },
    { label: 'كحلي', hex: '#1b2b49' },
  ];

  const brandWords = (brandName.trim() || 'YOUR BRAND').toUpperCase().split(/\s+/);
  const brandSymbol = (brandWords[0] || 'V').charAt(0);

  // Tab 4: Mobile screen state
  const [mobileScreen, setMobileScreen] = useState<'home' | 'tasks' | 'profile'>('home');

  const mobileScreens = {
    home: {
      title: 'أهلاً بك 👋',
      desc: 'كل ما تحتاجه، في مكان واحد.',
      card: 'لوحة البداية',
      copy: 'ملخصك اليومي، مهامك، وتنبيهاتك في واجهة واحدة نظيفة.',
    },
    tasks: {
      title: 'مهامك اليوم 📋',
      desc: 'رتّب أولوياتك وتابع التقدم.',
      card: '3 مهام قيد العمل',
      copy: 'مراجعة الطلبات · تحديث المحتوى · متابعة العملاء المتبقين.',
    },
    profile: {
      title: 'حسابك الشخصي 👤',
      desc: 'بياناتك وإعدادات تجربتك.',
      card: 'ملف المستخدم',
      copy: 'إدارة الحساب والإشعارات والتفضيلات وسجل الأنشطة.',
    },
  };

  const currentScreen = mobileScreens[mobileScreen];

  return (
    <div className="bg-[#080d18] text-[#f4f6fb] min-h-screen py-12 sm:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Section */}
        <MotionReveal yOffset={28}>
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-[#83e5e1] text-xs font-mono font-bold tracking-wider">
                VICTORIA LINE SOFT · LIVE PRODUCT LAB
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                لا تكتفِ بمشاهدة التصميم.
                <br />
                <span className="text-[#8d7bff]">جرّبه بنفسك.</span>
              </h1>
              <p className="text-[#a4b0c4] text-xs sm:text-sm leading-relaxed max-w-xl">
                هذه مساحة تجارب تفاعلية تعمل محلياً داخل المتصفح: أضف منتجات إلى السلة، استكشف لوحة بيانات تجريبية، عدّل هوية بصرية، وتنقّل داخل شاشات تطبيق جوال مصغر.
              </p>
              <div className="pt-2">
                <a
                  href="#live-demos"
                  className="inline-flex items-center gap-2 bg-[#7566e8] text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-[#8d7bff] transition-all"
                >
                  <span>ابدأ التجربة</span>
                  <ArrowDown size={14} />
                </a>
              </div>
            </div>

            {/* 3D Orb Stage */}
            <div
              ref={orbStageRef}
              onMouseMove={handleOrbMove}
              onMouseLeave={handleOrbLeave}
              className="lg:col-span-5 h-72 sm:h-96 rounded-3xl border border-[#26334a] bg-gradient-to-br from-[#111b2d] to-[#090e18] relative flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
            >
              {/* Ambient rings */}
              <div className="absolute w-72 h-28 rounded-full border border-[#9c8eff]/30 rotate-[-25deg] pointer-events-none" />
              <div className="absolute w-80 h-36 rounded-full border border-[#83e5e1]/25 rotate-[38deg] pointer-events-none" />

              {/* 3D Orb */}
              <div
                style={{
                  transform: `perspective(800px) rotateY(${orbTilt.x}deg) rotateX(${orbTilt.y}deg) translateZ(15px)`,
                  transition: 'transform 0.12s ease-out',
                }}
                className="w-40 h-40 rounded-[42px] bg-gradient-to-br from-[#a89bff] via-[#5141c8] to-[#1d2a62] shadow-[inset_-16px_-18px_28px_rgba(23,27,75,0.7),inset_10px_10px_20px_rgba(255,255,255,0.3),0_25px_60px_rgba(0,0,0,0.5)] flex items-center justify-center relative z-10"
              >
                <span className="text-7xl font-black text-white drop-shadow-[0_8px_20px_rgba(23,18,59,0.7)]">
                  V
                </span>
              </div>

              <span className="absolute bottom-4 text-[10px] tracking-widest text-[#d8def0] font-mono">
                حرّك المؤشر لتدوير المجسم ↗
              </span>
            </div>
          </section>
        </MotionReveal>

        {/* Interactive Demos Section */}
        <section id="live-demos" className="space-y-8">
          <MotionReveal yOffset={20}>
            <div>
              <span className="text-[#83e5e1] text-xs font-mono font-bold tracking-wider">
                INTERACTIVE DEMOS / 01—04
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-1">أربع تجارب، وليست أربع صور</h2>
            </div>
          </MotionReveal>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-3 border-b border-[#26334a]" role="tablist">
            {[
              { id: 'shop', label: 'متجر تفاعلي', icon: ShoppingBag },
              { id: 'dashboard', label: 'لوحة أعمال', icon: BarChart3 },
              { id: 'brand', label: 'استوديو الهوية', icon: Palette },
              { id: 'mobile', label: 'تطبيق جوال', icon: Smartphone },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#8d7bff] text-white shadow-md'
                      : 'bg-[#101827] text-[#bdc7d8] border border-[#26334a] hover:bg-white/5'
                  }`}
                  role="tab"
                  aria-selected={isActive}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* TAB 1: SHOP */}
            {activeTab === 'shop' && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl border border-[#26334a] bg-[#0e1625] overflow-hidden shadow-2xl"
              >
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#26334a] bg-[#121c2d] text-xs">
                  <span className="font-bold">VLS SELECT · متجر تجريبي</span>
                  <span className="inline-flex items-center gap-1.5 text-[#5ce0ac] text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-[#5ce0ac] animate-pulse" />
                    <span>التفاعل يعمل محلياً في السلة</span>
                  </span>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Product Catalog */}
                  <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {shopProducts.map((p, idx) => (
                      <article
                        key={idx}
                        className="border border-[#26334a] rounded-2xl bg-[#121d2f] overflow-hidden flex flex-col justify-between"
                      >
                        <div className="h-36 bg-gradient-to-br from-[#1c2942] to-[#111a2b] flex items-center justify-center relative">
                          {p.type === 'phone' && (
                            <div className="w-16 h-24 rounded-2xl border-2 border-[#b8c6e7] bg-gradient-to-br from-[#414e74] to-[#11182a] shadow-lg -rotate-6 flex items-center justify-center">
                              <div className="w-12 h-18 rounded-xl bg-gradient-to-br from-[#a9a0ff] to-[#252a6a]" />
                            </div>
                          )}
                          {p.type === 'watch' && (
                            <div className="w-14 h-18 rounded-2xl bg-[#aab7d3] rotate-6 flex items-center justify-center shadow-lg">
                              <div className="w-10 h-10 rounded-full border-4 border-[#8ee6d7] bg-[#0e1b2e]" />
                            </div>
                          )}
                          {p.type === 'headset' && (
                            <div className="w-16 h-14 border-4 border-[#b8aaff] border-b-transparent rounded-t-full flex items-end justify-between px-1">
                              <div className="w-3.5 h-5 bg-[#8b73df] rounded" />
                              <div className="w-3.5 h-5 bg-[#8b73df] rounded" />
                            </div>
                          )}
                        </div>

                        <div className="p-4 space-y-2">
                          <strong className="block text-xs font-bold">{p.name}</strong>
                          <small className="block text-[10px] text-[#96a4bb]">{p.desc}</small>
                          <div className="flex justify-between items-center pt-2">
                            <b className="text-xs text-white">${p.price}</b>
                            <button
                              onClick={() => addToCart(p)}
                              className="bg-[#7566e8] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#8d7bff] transition-all cursor-pointer"
                            >
                              {addedItem === p.name ? (
                                <span className="flex items-center gap-1">
                                  <Check size={12} /> أُضيف
                                </span>
                              ) : (
                                'أضف للسلة +'
                              )}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Live Cart Sidebar */}
                  <aside className="lg:col-span-4 border border-[#28354c] rounded-2xl p-5 bg-[#0a111e] space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold">سلة مشترياتك</h3>
                      <span className="text-xs font-mono text-[#83e5e1]">({cartCount}) عناصر</span>
                    </div>

                    <div className="divide-y divide-[#243047] min-h-[140px] max-h-56 overflow-y-auto">
                      {cartItems.length === 0 ? (
                        <p className="text-[11px] text-[#93a2bb] py-8 text-center">
                          السلة فارغة. أضف منتجاً لتجربة الحساب الفوري.
                        </p>
                      ) : (
                        cartItems.map((item, idx) => (
                          <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold block">{item.name}</span>
                              <span className="text-[10px] text-[#93a2bb]">
                                ${item.price} × {item.qty}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">${item.price * item.qty}</span>
                              <button
                                onClick={() => removeFromCart(item.name)}
                                className="p-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                                title="تقليل الكمية"
                              >
                                <Minus size={12} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#243047] flex justify-between items-center text-sm font-bold">
                      <span>الإجمالي</span>
                      <span className="text-[#83e5e1] font-mono text-base">${cartTotal}</span>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        onClick={clearCart}
                        disabled={cartItems.length === 0}
                        className="w-full py-2 rounded-xl border border-white/10 text-xs font-bold text-[#bdc7d8] hover:bg-white/5 disabled:opacity-40 cursor-pointer"
                      >
                        تفريغ السلة
                      </button>
                    </div>

                    <p className="text-[10px] text-[#718096] leading-relaxed pt-2">
                      ملاحظة: المنتجات والأسعار لأغراض العرض التفاعلي؛ لا توجد عمليات دفع حقيقية هنا.
                    </p>
                  </aside>
                </div>
              </motion.div>
            )}

            {/* TAB 2: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl border border-[#26334a] bg-[#0e1625] p-6 space-y-6 shadow-2xl"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white">ملخص أداء العمليات (تجريبي)</h3>
                    <p className="text-xs text-[#97a5ba] mt-0.5">{activeDash.note}</p>
                  </div>
                  <div className="flex rounded-lg border border-[#26334a] bg-[#131e30] p-1">
                    <button
                      onClick={() => setDashRange('week')}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                        dashRange === 'week' ? 'bg-[#7566e8] text-white' : 'text-[#bfc9da]'
                      }`}
                    >
                      7 أيام
                    </button>
                    <button
                      onClick={() => setDashRange('month')}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                        dashRange === 'month' ? 'bg-[#7566e8] text-white' : 'text-[#bfc9da]'
                      }`}
                    >
                      30 يوماً
                    </button>
                  </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-[#29364c] bg-[#121d2e]">
                    <small className="block text-[10px] text-[#97a5ba]">الطلبات التجريبية</small>
                    <strong className="block text-2xl font-bold font-mono my-1 text-white">
                      {activeDash.orders}
                    </strong>
                    <em className="text-[10px] text-[#64ddb0] not-italic">↑ 12.4% عن الفترة السابقة</em>
                  </div>
                  <div className="p-4 rounded-xl border border-[#29364c] bg-[#121d2e]">
                    <small className="block text-[10px] text-[#97a5ba]">إجمالي المبيعات</small>
                    <strong className="block text-2xl font-bold font-mono my-1 text-white">
                      {activeDash.sales}
                    </strong>
                    <em className="text-[10px] text-[#64ddb0] not-italic">↑ 8.2% نمو الإيراد</em>
                  </div>
                  <div className="p-4 rounded-xl border border-[#29364c] bg-[#121d2e]">
                    <small className="block text-[10px] text-[#97a5ba]">عملاء العرض</small>
                    <strong className="block text-2xl font-bold font-mono my-1 text-white">
                      {activeDash.customers}
                    </strong>
                    <em className="text-[10px] text-[#64ddb0] not-italic">↑ 6.1% عملاء جدد</em>
                  </div>
                  <div className="p-4 rounded-xl border border-[#29364c] bg-[#121d2e]">
                    <small className="block text-[10px] text-[#97a5ba]">معدل الإكمال</small>
                    <strong className="block text-2xl font-bold font-mono my-1 text-white">
                      {activeDash.rate}
                    </strong>
                    <em className="text-[10px] text-[#64ddb0] not-italic">↑ 3.4% إنجاز الطلبات</em>
                  </div>
                </div>

                {/* Dynamic Bar Chart */}
                <div className="p-6 rounded-2xl border border-[#29364c] bg-[#111d36]">
                  <span className="text-xs text-[#aebbe0] font-bold block mb-4">
                    حركة النشاط والمبيعات ({dashRange === 'week' ? 'أسبوعي' : 'شهري'})
                  </span>
                  <div className="h-44 flex items-end gap-3 sm:gap-6 border-b border-[#29364c] pb-3 pt-4">
                    {activeDash.bars.map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${bar.h}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                          className="w-full max-w-[42px] rounded-t-md bg-gradient-to-t from-[#6154d8] to-[#9d91ff] group-hover:to-[#82efda] transition-colors relative"
                        >
                          <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] bg-black px-1.5 py-0.5 rounded text-white font-mono transition-opacity">
                            {bar.h}%
                          </span>
                        </motion.div>
                        <span className="text-[10px] text-[#91a0b8] mt-2 font-mono">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: BRAND STUDIO */}
            {activeTab === 'brand' && (
              <motion.div
                key="brand"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl border border-[#26334a] bg-[#0e1625] p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-2xl"
              >
                {/* Controls */}
                <div className="lg:col-span-5 border border-[#29364c] rounded-2xl p-6 bg-[#0a111e] space-y-4">
                  <strong className="text-sm font-bold text-white block">استوديو تخصيص الهوية</strong>
                  <div>
                    <label className="block text-xs text-[#b9c5d8] mb-1">اسم العلامة التجارية</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      maxLength={35}
                      className="w-full px-3 py-2 rounded-xl border border-[#34425b] bg-[#121d2e] text-white text-xs outline-none focus:border-[#7566e8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#b9c5d8] mb-1">العبارة التعريفية (Tagline)</label>
                    <input
                      type="text"
                      value={brandTagline}
                      onChange={(e) => setBrandTagline(e.target.value)}
                      maxLength={70}
                      className="w-full px-3 py-2 rounded-xl border border-[#34425b] bg-[#121d2e] text-white text-xs outline-none focus:border-[#7566e8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#b9c5d8] mb-2">اختر اللون الرئيسي</label>
                    <div className="flex gap-2">
                      {brandColors.map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => setBrandColor(c.hex)}
                          style={{ backgroundColor: c.hex }}
                          className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                            brandColor === c.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                          }`}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-[#718096] pt-2">
                    المعاينة في الجانب الآخر تتغير فوراً لتظهر تأثير الألوان والاسم على هوية العمل.
                  </p>
                </div>

                {/* Dynamic Live Preview */}
                <div
                  style={{ backgroundColor: `${brandColor}15` }}
                  className="lg:col-span-7 rounded-2xl p-8 border border-white/10 min-h-[320px] flex flex-col justify-between transition-colors shadow-inner"
                >
                  <div>
                    <div
                      style={{ backgroundColor: brandColor }}
                      className="w-16 h-16 rounded-2xl text-white font-black text-2xl flex items-center justify-center shadow-lg transition-colors"
                    >
                      {brandSymbol}
                    </div>
                    <div className="text-[10px] tracking-widest text-[#aab3cc] font-mono mt-4">
                      BRAND IDENTITY / LIVE
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-extrabold text-white my-3 leading-tight">
                      {brandWords.map((word, i) => (
                        <span key={i} className="block">
                          {word}
                        </span>
                      ))}
                    </h3>
                    <p className="text-xs text-[#cbd5e1] max-w-sm leading-relaxed">{brandTagline}</p>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex justify-between items-center text-xs">
                    <b className="font-mono text-white tracking-wider">{brandName.toUpperCase()}</b>
                    <span
                      style={{ backgroundColor: brandColor }}
                      className="text-white text-[10px] px-3 py-1.5 rounded-full font-bold transition-colors"
                    >
                      DISCOVER ↗
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: MOBILE APP */}
            {activeTab === 'mobile' && (
              <motion.div
                key="mobile"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl border border-[#26334a] bg-[#0e1625] p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-2xl"
              >
                <div className="lg:col-span-6 space-y-4">
                  <span className="text-[#83e5e1] text-xs font-mono font-bold tracking-wider">
                    ONE APP · MULTIPLE STATES
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold">التجربة لا تتوقف عند الشاشة الأولى</h3>
                  <p className="text-xs sm:text-sm text-[#a4b0c4] leading-relaxed">
                    تنقّل بين الواجهات المصغرة داخل الهاتف التجريبي وشاهد كيف تتبدل الشاشات. يمثل هذا النموذج أسلوبنا في بناء واجهات مركزة تخدم المستخدم مباشرة.
                  </p>
                  <div className="pt-2 text-xs text-[#8d7bff] font-bold">
                    ✓ تنقل لحظي بدون إعادة تحميل
                  </div>
                </div>

                {/* Smartphone Mockup */}
                <div className="lg:col-span-6 flex justify-center">
                  <div className="w-64 sm:w-72 rounded-[40px] border-8 border-[#303b53] p-4 bg-[#f7f8ff] text-[#1b2440] shadow-2xl min-h-[460px] flex flex-col justify-between">
                    <div>
                      {/* Dynamic Island */}
                      <div className="w-20 h-4 bg-[#303b53] rounded-full mx-auto mb-4" />
                      <span className="text-[9px] font-mono font-bold text-[#716b9f] block">
                        VLS MOBILE CONCEPT
                      </span>
                      <h4 className="text-lg font-black text-[#1b2440] mt-1">{currentScreen.title}</h4>
                      <p className="text-[11px] text-[#68748d] leading-relaxed mb-4">{currentScreen.desc}</p>

                      <div className="rounded-2xl p-4 bg-[#ebeaff] space-y-2 min-h-[140px]">
                        <strong className="block text-xs font-bold text-[#2d286a]">
                          {currentScreen.card}
                        </strong>
                        <p className="text-[11px] text-[#555a7d] leading-relaxed">{currentScreen.copy}</p>
                      </div>
                    </div>

                    {/* Navigation Switcher */}
                    <div className="space-y-3 pt-4">
                      <div className="flex gap-1 bg-[#e8eaff] p-1 rounded-xl">
                        {(['home', 'tasks', 'profile'] as const).map((sc) => (
                          <button
                            key={sc}
                            onClick={() => setMobileScreen(sc)}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-colors ${
                              mobileScreen === sc ? 'bg-[#7566e8] text-white shadow' : 'text-[#3e4770]'
                            }`}
                          >
                            {sc === 'home' ? 'الرئيسية' : sc === 'tasks' ? 'المهام' : 'حسابي'}
                          </button>
                        ))}
                      </div>

                      <div className="bg-[#7566e8] text-white text-center py-2.5 rounded-xl text-xs font-bold shadow-sm">
                        ابدأ الآن ↗
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-[11px] text-[#64748b] text-center pt-4">
            ملاحظة مهنية: جميع البيانات داخل هذه الصفحة مصطنعة لأغراض العرض التفاعلي. الهدف إظهار إمكانات التجربة الحية داخل المتصفح.
          </p>
        </section>
      </div>
    </div>
  );
};
