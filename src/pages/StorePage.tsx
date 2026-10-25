import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle,
  Clock,
  ArrowUpRight,
  MessageSquare,
  ShieldCheck,
  Plus,
  Minus,
  Trash2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreProduct, CartItem, StoreOrder } from '../types';
import {
  getStoredStoreProducts,
  createStoreOrder,
  buildStoreWhatsAppUrl,
  buildSingleProductWhatsAppUrl,
} from '../services/storage';
import { usePageMeta } from '../hooks/usePageMeta';
import { SafeImage } from '../components/SafeImage';

interface StorePageProps {
  navigate: (path: string) => void;
}

export const StorePage: React.FC<StorePageProps> = () => {
  usePageMeta({ title: 'متجر التطبيقات والحلول الجاهزة', description: 'منتجات رقمية جاهزة للتسليم: نقاط بيع، تطبيقات توصيل، قوالب متاجر، وهويات بصرية — بأسعار واضحة وتسليم سريع.' });

  const [products] = useState<StoreProduct[]>(() => getStoredStoreProducts());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [completedOrder, setCompletedOrder] = useState<StoreOrder | null>(null);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart calculations
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const addToCart = (product: StoreProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id === productId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || cart.length === 0) return;

    const orderData = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      items: cart.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      })),
      totalPrice: cartTotal,
      currency: '$',
      notes: customerNotes.trim() || undefined,
      status: 'new' as const,
    };

    const newOrder = createStoreOrder(orderData);
    setCompletedOrder(newOrder);
    setCart([]);
    setIsCheckoutOpen(false);

    // Open WhatsApp order link
    const whatsappUrl = buildStoreWhatsAppUrl(newOrder);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[var(--vls-paper)] text-[var(--vls-ink)] pb-24 transition-colors">
      {/* Top Hero */}
      <section className="relative py-16 sm:py-24 border-b border-[var(--vls-line)] bg-gradient-to-b from-[#0d1323] to-[var(--vls-paper)] text-white overflow-hidden">
        {/* Glow dots */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-[#9b8cff]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[#82efda]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-[#82efda] font-bold mb-4">
            <ShoppingBag size={14} />
            <span>متجر فيكتوريا لاين سوفت · حلول جاهزة للإطلاق الفوري</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4">
            تطبيقات جاهزة، تصاميم تجارية،
            <br />
            <span className="bg-gradient-to-l from-[#82efda] via-[#9b8cff] to-white bg-clip-text text-transparent">
              ومنتجات برمجية تملكها بالكامل.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#a7b1c7] max-w-2xl leading-relaxed mb-8">
            اختصر شهوراً من التطوير. اختر منتجاً برمجياً جاهزاً بكامل كود المصدر، باقة هوية تجارية
            متكاملة، أو بوت مبيعات ذكي يعمل مع واتساب مباشرة مع دعم فني وتركيب مجاني.
          </p>

          {/* Quick guarantees */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#cad4e6]">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <CheckCircle size={16} className="text-[#82efda] shrink-0" />
              <span>ملكية تجارية وكود كامل</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <Clock size={16} className="text-[#9b8cff] shrink-0" />
              <span>تسليم وتشغيل سريع (24-48 ساعة)</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#82efda] shrink-0" />
              <span>دعم فني وتحديثات مجانية</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <MessageSquare size={16} className="text-[#25D366] shrink-0" />
              <span>طلب مباشر وفوري عبر واتساب</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'كافة المعروضات' },
              { id: 'app', label: 'تطبيقات جاهزة للشراء' },
              { id: 'design', label: 'تصاميم وهوية تجارية' },
              { id: 'product', label: 'منتجات ذكاء اصطناعي وأتمتة' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#101318] dark:bg-white text-white dark:text-[#101318] shadow-md'
                    : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--vls-ink)] border border-[var(--vls-line)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search box & Cart trigger */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن تطبيق، نظام، أو تصميم..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[var(--vls-panel)] border border-[var(--vls-line)] text-xs focus:outline-none focus:border-[#9b8cff] transition-colors"
              />
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9b8cff] text-[#080b16] font-bold text-xs hover:bg-white transition-all shadow-md cursor-pointer shrink-0"
            >
              <ShoppingBag size={16} />
              <span>السلة</span>
              {cartItemsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#101318] text-white text-[10px] flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-2xl bg-[var(--vls-panel)] border border-[var(--vls-line)]">
            <p className="text-sm text-[var(--vls-ink-muted)] mb-3">
              لا توجد منتجات مطابقة لبحثك الحالي.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-[#9b8cff] hover:underline cursor-pointer"
            >
              إعادة تعيين التصفية
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const inCart = cart.some((i) => i.product.id === product.id);

              return (
                <motion.article
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl overflow-hidden bg-[var(--vls-panel)] border border-[var(--vls-line)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-52 w-full overflow-hidden bg-black/10">
                      <SafeImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#101318]/90 text-white backdrop-blur-md">
                          {product.categoryLabel}
                        </span>
                        {product.badge && (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#82efda] text-[#080b16]">
                            {product.badge}
                          </span>
                        )}
                      </div>

                      {/* Delivery time */}
                      <span className="absolute bottom-3 right-3 text-[10px] text-white/90 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-md flex items-center gap-1 font-medium">
                        <Clock size={11} className="text-[#82efda]" />
                        <span>{product.deliveryDays}</span>
                      </span>

                      {/* Rating */}
                      {product.rating && (
                        <span className="absolute bottom-3 left-3 text-[10px] text-white/90 bg-black/60 px-2 py-1 rounded-md backdrop-blur-md flex items-center gap-1 font-mono">
                          <span className="text-yellow-400">★</span>
                          <span>{product.rating}</span>
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-base font-extrabold text-[var(--vls-ink)] mb-1.5 line-clamp-1 group-hover:text-[#9b8cff] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[var(--vls-ink-muted)] leading-relaxed mb-4 line-clamp-2">
                        {product.shortDesc}
                      </p>

                      {/* Feature Checklist */}
                      <div className="space-y-1.5 mb-5 border-t border-[var(--vls-line)] pt-3">
                        {product.features.slice(0, 3).map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-[11px] text-[var(--vls-ink-muted)]"
                          >
                            <CheckCircle
                              size={13}
                              className="text-[#82efda] shrink-0 mt-0.5"
                            />
                            <span className="line-clamp-1">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Footer */}
                  <div className="p-5 pt-0 border-t border-[var(--vls-line)] mt-auto">
                    <div className="flex items-baseline justify-between pt-3 mb-4">
                      <div>
                        <div className="text-lg font-black text-[var(--vls-ink)] flex items-baseline gap-1">
                          <span>{product.price}</span>
                          <span className="text-xs font-semibold text-[var(--vls-ink-muted)]">
                            {product.currency}
                          </span>
                        </div>
                        {product.originalPrice && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {product.originalPrice} {product.currency}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedProduct(product)}
                        className="text-xs font-bold text-[#9b8cff] hover:underline cursor-pointer"
                      >
                        عرض التفاصيل والمخرجات ↗
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          inCart
                            ? 'bg-[#82efda] text-[#080b16]'
                            : 'bg-[#101318] dark:bg-white text-white dark:text-[#101318] hover:opacity-90'
                        }`}
                      >
                        <ShoppingBag size={14} />
                        <span>{inCart ? 'في السلة ✓' : 'أضف للسلة'}</span>
                      </button>

                      <a
                        href={buildSingleProductWhatsAppUrl(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 transition-all text-center"
                      >
                        <MessageSquare size={14} />
                        <span>طلب فوري</span>
                      </a>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-[#0d1323] text-white border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col my-auto text-right"
              dir="rtl"
            >
              {/* Header image */}
              <div className="relative h-60 w-full overflow-hidden shrink-0 bg-black">
                <SafeImage
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1323] via-[#0d1323]/40 to-transparent" />
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 left-4 p-2 rounded-full bg-black/60 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-4 right-6 left-6">
                  <span className="text-[10px] font-bold text-[#82efda] bg-white/10 px-2.5 py-1 rounded-full">
                    {selectedProduct.categoryLabel}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
                    {selectedProduct.name}
                  </h2>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-[#9b8cff] uppercase tracking-wider mb-2">
                    الوصف الشامل
                  </h3>
                  <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
                    {selectedProduct.fullDesc}
                  </p>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-xs font-bold text-[#82efda] uppercase tracking-wider mb-3">
                    المزايا والوظائف المضمنة
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedProduct.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#e2e8f0] flex items-start gap-2"
                      >
                        <CheckCircle size={14} className="text-[#82efda] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What you get */}
                <div>
                  <h3 className="text-xs font-bold text-[#f3a5d5] uppercase tracking-wider mb-3">
                    ماذا ستستلم عند الشراء؟
                  </h3>
                  <div className="space-y-2">
                    {selectedProduct.deliverables.map((deliv, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-[#cbd5e1] flex items-center gap-2"
                      >
                        <ShieldCheck size={15} className="text-[#f3a5d5] shrink-0" />
                        <span>{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 bg-[#080b16] border-t border-white/10 flex items-center justify-between gap-4 shrink-0">
                <div>
                  <div className="text-lg font-black text-white flex items-baseline gap-1">
                    <span>{selectedProduct.price}</span>
                    <span className="text-xs text-[#82efda]">{selectedProduct.currency}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block">{selectedProduct.deliveryDays}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="inline-flex items-center gap-2 bg-[#9b8cff] text-[#080b16] hover:bg-white font-extrabold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    <ShoppingBag size={15} />
                    <span>إضافة إلى السلة</span>
                  </button>

                  <a
                    href={buildSingleProductWhatsAppUrl(selectedProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-[#080b16] font-bold text-xs px-4 py-3 rounded-xl transition-all"
                  >
                    <MessageSquare size={15} />
                    <span>طلب فوري واتساب</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md bg-[var(--vls-panel)] border-r border-[var(--vls-line)] shadow-2xl h-full flex flex-col z-10 text-right"
              dir="rtl"
            >
              {/* Cart Header */}
              <div className="p-5 border-b border-[var(--vls-line)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} className="text-[#9b8cff]" />
                  <h3 className="text-base font-extrabold text-[var(--vls-ink)]">
                    سلة الطلبات ({cartItemsCount})
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--vls-ink)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="p-5 flex-1 overflow-y-auto space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm font-bold text-[var(--vls-ink)] mb-1">السلة فارغة حالياً</p>
                    <p className="text-xs text-[var(--vls-ink-muted)] mb-4">
                      تصفح المعروضات واختر التطبيق أو التصميم المناسب لنشاطك.
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="text-xs font-bold text-[#9b8cff] hover:underline cursor-pointer"
                    >
                      تصفح المنتجات الآن
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3.5 rounded-xl border border-[var(--vls-line)] bg-black/[0.02] dark:bg-white/[0.02] flex items-center gap-3"
                    >
                      <SafeImage
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[var(--vls-ink)] truncate">
                          {item.product.name}
                        </h4>
                        <span className="text-[11px] text-[var(--vls-ink-muted)] block">
                          {item.product.price} {item.product.currency}
                        </span>
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 cursor-pointer"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-xs font-mono font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="p-1 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 cursor-pointer"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-[var(--vls-line)] bg-black/[0.02] dark:bg-white/[0.02] space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold text-[var(--vls-ink)]">
                    <span>إجمالي الطلب:</span>
                    <span className="text-base font-extrabold text-[#9b8cff]">
                      {cartTotal} $
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--vls-ink-muted)]">
                    * يشمل التركيب والتهيئة والدعم الفني مجاناً.
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#101318] dark:bg-white text-white dark:text-[#101318] text-xs font-black hover:opacity-90 transition-all cursor-pointer shadow-md"
                  >
                    <span>إتمام الطلب وتأكيد الشراء</span>
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-[var(--vls-panel)] border border-[var(--vls-line)] rounded-3xl shadow-2xl p-6 sm:p-8 z-10 text-right"
              dir="rtl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[var(--vls-line)] mb-5">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[var(--vls-ink)]">
                    تأكيد طلب الشراء
                  </h3>
                  <p className="text-xs text-[var(--vls-ink-muted)]">
                    أدخل بيانات التواصل لتجهيز النسخة وحساب الفاتورة
                  </p>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--vls-ink)] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Order items brief */}
              <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--vls-line)] mb-5 text-xs space-y-1">
                <span className="text-[10px] text-[var(--vls-ink-muted)] block font-bold">ملخص السلة:</span>
                {cart.map((i) => (
                  <div key={i.product.id} className="flex justify-between text-[var(--vls-ink)]">
                    <span>{i.product.name} (x{i.quantity})</span>
                    <span className="font-mono">{i.product.price * i.quantity} $</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-[var(--vls-line)] flex justify-between font-black text-sm text-[#9b8cff]">
                  <span>المجموع:</span>
                  <span>{cartTotal} $</span>
                </div>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--vls-ink)] mb-1">
                    الاسم الكريم *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="مثال: م. فهد المحمدي"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--vls-paper)] border border-[var(--vls-line)] text-xs text-[var(--vls-ink)] focus:outline-none focus:border-[#9b8cff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--vls-ink)] mb-1">
                    رقم الهاتف / واتساب *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="مثال: 967771234567 أو 0501234567"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--vls-paper)] border border-[var(--vls-line)] text-xs text-[var(--vls-ink)] focus:outline-none focus:border-[#9b8cff]"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--vls-ink)] mb-1">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--vls-paper)] border border-[var(--vls-line)] text-xs text-[var(--vls-ink)] focus:outline-none focus:border-[#9b8cff]"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--vls-ink)] mb-1">
                    ملاحظات أو تخصيصات مطلوبة
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="أذكر اسم مشروعك، النطاق (Domain) أو أي تفاصيل ترغب بإضافتها..."
                    className="w-full px-4 py-2 rounded-xl bg-[var(--vls-paper)] border border-[var(--vls-line)] text-xs text-[var(--vls-ink)] focus:outline-none focus:border-[#9b8cff]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-[#080b16] font-black text-xs transition-all cursor-pointer shadow-lg"
                  >
                    <MessageSquare size={16} />
                    <span>تأكيد الطلب والإرسال عبر واتساب فوراً</span>
                  </button>
                  <p className="text-[10px] text-center text-[var(--vls-ink-muted)] mt-2">
                    سيتم حفظ طلبك وإرسال نسخة الفاتورة فوراً إلى واتساب فيكتوريا لاين سوفت.
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Completed Order Confirmation Banner */}
      <AnimatePresence>
        {completedOrder && (
          <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-96 z-50">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-5 rounded-2xl bg-[#080b16] text-white border border-[#82efda]/40 shadow-2xl space-y-2 text-right"
              dir="rtl"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#82efda] flex items-center gap-1.5">
                  <CheckCircle size={15} />
                  <span>تم استلام طلبك بنجاح!</span>
                </span>
                <button
                  onClick={() => setCompletedOrder(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>
              <p className="text-xs text-gray-300">
                رقم الطلب الخاص بك: <strong className="text-white font-mono">#{completedOrder.id}</strong>
              </p>
              <p className="text-[11px] text-[#a7b1c7]">
                فريق فيكتوريا لاين يقوم الآن بمراجعة الطلب وتجهيز ملفات الاستلام.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
