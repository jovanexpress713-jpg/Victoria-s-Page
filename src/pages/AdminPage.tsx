import React, { useState, useRef } from 'react';
import {
  Users,
  Clock,
  FileText,
  LogOut,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ShoppingBag,
  Layers,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Download,
  Upload,
  FileDown,
  ClipboardList,
  DatabaseBackup,
  X,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getStoredQuotes,
  getStoredLeads,
  getStoredInteractions,
  getStoredFollowups,
  updateQuoteOffer,
  markQuoteOfferSent,
  updateLeadStage,
  buildWhatsAppUrl,
  getStoredPortfolio,
  savePortfolioItem,
  deletePortfolioItem,
  resetPortfolio,
  getStoredStoreProducts,
  deleteStoreProduct,
  saveStoreProduct,
  resetStoreProducts,
  getStoredStoreOrders,
  updateStoreOrderStatus,
  updateFollowupStatus,
  deleteFollowup,
  addFollowup,
  buildCrmBackup,
  restoreCrmBackup,
  downloadJson,
  downloadCsv,
  toCsv,
  isStoragePersisting,
} from '../services/storage';
import { adminLogout, sessionRemainingMinutes } from '../services/auth';
import {
  Quote,
  Lead,
  AIInteraction,
  Followup,
  LeadStage,
  PortfolioItem,
  StoreProduct,
  StoreOrder,
} from '../types';
import {
  MotionReveal,
  MotionStaggerContainer,
  MotionStaggerItem,
} from '../components/MotionReveal';
import { usePageMeta } from '../hooks/usePageMeta';
import { SafeImage } from '../components/SafeImage';

interface AdminPageProps {
  onLogout: () => void;
  navigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onLogout, navigate }) => {
  usePageMeta({ title: 'مركز الإدارة', description: 'لوحة تحكم داخلية: العملاء المحتملون، طلبات التسعير، المتابعات، معرض الأعمال، وطلبات المتجر.' });

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'crm' | 'portfolio' | 'store'>('crm');

  // CRM State
  const [quotes, setQuotes] = useState<Quote[]>(() => getStoredQuotes());
  const [leads, setLeads] = useState<Lead[]>(() => getStoredLeads());
  const [interactions, setInteractions] = useState<AIInteraction[]>(() => getStoredInteractions());
  const [followups, setFollowups] = useState<Followup[]>(() => getStoredFollowups());
  const [offerInputs, setOfferInputs] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    getStoredQuotes().forEach((item) => {
      if (item.offer) initial[item.id] = item.offer;
    });
    return initial;
  });
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [newFollowupNote, setNewFollowupNote] = useState('');
  const [newFollowupChannel, setNewFollowupChannel] = useState<Followup['channel']>('whatsapp');
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Portfolio State
  const [portfolioList, setPortfolioList] = useState<PortfolioItem[]>(() => getStoredPortfolio());
  const [editingProject, setEditingProject] = useState<PortfolioItem | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Store State
  const [storeOrders, setStoreOrders] = useState<StoreOrder[]>(() => getStoredStoreOrders());
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>(() => getStoredStoreProducts());
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const refreshData = () => {
    setQuotes(getStoredQuotes());
    setLeads(getStoredLeads());
    setInteractions(getStoredInteractions());
    setFollowups(getStoredFollowups());
    setPortfolioList(getStoredPortfolio());
    setStoreOrders(getStoredStoreOrders());
    setStoreProducts(getStoredStoreProducts());

    const initialOffers: Record<number, string> = {};
    getStoredQuotes().forEach((item) => {
      if (item.offer) initialOffers[item.id] = item.offer;
    });
    setOfferInputs(initialOffers);
  };

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // CRM Handlers
  const handleStageChange = (leadId: number, stage: LeadStage) => {
    updateLeadStage(leadId, stage);
    refreshData();
    showToast('تم تحديث مرحلة العميل');
  };

  const handleSaveOffer = (quoteId: number) => {
    const text = offerInputs[quoteId] || '';
    if (!text.trim()) return;
    updateQuoteOffer(quoteId, text);
    refreshData();
    showToast('تم حفظ مسودة العرض وإضافتها للمتابعات');
  };

  const handleOpenWhatsApp = (q: Quote) => {
    const message = `مرحباً ${q.name}، بخصوص طلبك لخدمة ${q.service} لدى Victoria Line Soft:\n\n${
      q.offer || 'يسعدنا إفادتك بأننا راجعنا طلبك وسنرسل لك تفاصيل العرض بعد اعتماده.'
    }\n\nإذا كان العرض مناسباً، أخبرنا لنبدأ الخطوة التالية.`;
    markQuoteOfferSent(q.id);
    refreshData();
    const url = buildWhatsAppUrl(q.phone, message);
    window.open(url, '_blank');
  };

  // Followups Handlers
  const handleToggleFollowup = (id: number, status: Followup['status']) => {
    updateFollowupStatus(id, status);
    refreshData();
    showToast(status === 'completed' ? 'تم إغلاق المتابعة' : 'أعيد فتح المتابعة');
  };

  const handleDeleteFollowup = (id: number) => {
    if (window.confirm('هل تريد حذف هذه المتابعة نهائياً؟')) {
      deleteFollowup(id);
      refreshData();
      showToast('تم حذف المتابعة');
    }
  };

  const handleAddFollowup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const note = newFollowupNote.trim();
    if (!note) return;
    addFollowup({ channel: newFollowupChannel, note, status: 'pending' });
    setNewFollowupNote('');
    refreshData();
    showToast('تمت إضافة المتابعة');
  };

  // Backup Handlers
  const handleExportBackup = () => {
    downloadJson(`vls-backup-${new Date().toISOString().slice(0, 10)}.json`, buildCrmBackup());
    showToast('تم تنزيل نسخة احتياطية كاملة (JSON)');
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = restoreCrmBackup(String(reader.result || ''));
      if (result) {
        refreshData();
        showToast('تم استيراد النسخة الاحتياطية بنجاح');
      } else {
        showToast('تعذّر قراءة الملف: تأكد أنه نسخة احتياطية صحيحة');
      }
    };
    reader.onerror = () => showToast('تعذّر قراءة الملف');
    reader.readAsText(file);
  };

  const handleExportCsv = (kind: 'quotes' | 'leads' | 'orders') => {
    const stamp = new Date().toISOString().slice(0, 10);
    if (kind === 'quotes') {
      downloadCsv(
        `vls-quotes-${stamp}.csv`,
        toCsv(quotes, [
          { key: 'id', label: 'الرقم' },
          { key: 'name', label: 'الاسم' },
          { key: 'phone', label: 'الهاتف' },
          { key: 'service', label: 'الخدمة' },
          { key: 'details', label: 'التفاصيل' },
          { key: 'status', label: 'الحالة' },
          { key: 'offer', label: 'العرض' },
          { key: 'created_at', label: 'التاريخ' },
        ])
      );
    } else if (kind === 'leads') {
      downloadCsv(
        `vls-leads-${stamp}.csv`,
        toCsv(leads, [
          { key: 'id', label: 'الرقم' },
          { key: 'name', label: 'الاسم' },
          { key: 'company', label: 'الجهة' },
          { key: 'phone', label: 'الهاتف' },
          { key: 'email', label: 'البريد' },
          { key: 'need', label: 'الاحتياج' },
          { key: 'budget', label: 'الميزانية' },
          { key: 'score', label: 'التقييم' },
          { key: 'stage', label: 'المرحلة' },
        ])
      );
    } else {
      downloadCsv(
        `vls-orders-${stamp}.csv`,
        toCsv(
          storeOrders.map((o) => ({
            id: o.id,
            customerName: o.customerName,
            customerPhone: o.customerPhone,
            items: o.items.map((i) => `${i.productName} x${i.quantity}`).join(' | '),
            totalPrice: o.totalPrice,
            currency: o.currency,
            status: o.status,
            createdAt: o.createdAt,
          })),
          [
            { key: 'id', label: 'رقم الطلب' },
            { key: 'customerName', label: 'العميل' },
            { key: 'customerPhone', label: 'الهاتف' },
            { key: 'items', label: 'العناصر' },
            { key: 'totalPrice', label: 'الإجمالي' },
            { key: 'currency', label: 'العملة' },
            { key: 'status', label: 'الحالة' },
            { key: 'createdAt', label: 'التاريخ' },
          ]
        )
      );
    }
    showToast('تم تنزيل ملف CSV');
  };

  // Portfolio Handlers
  const handleSaveProjectForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingProject?.id || 'portfolio-' + Date.now();
    const resultsStr = (formData.get('results') as string) || '';
    const tagsStr = (formData.get('tags') as string) || '';

    const newItem: PortfolioItem = {
      id,
      title: (formData.get('title') as string) || '',
      subtitle: (formData.get('subtitle') as string) || '',
      category: (formData.get('category') as PortfolioItem['category'] | null) ?? 'system',
      categoryLabel: (formData.get('categoryLabel') as string) || 'أنظمة أعمال',
      imageUrl: (formData.get('imageUrl') as string) || '',
      client: (formData.get('client') as string) || '',
      year: (formData.get('year') as string) || '2026',
      summary: (formData.get('summary') as string) || '',
      challenge: (formData.get('challenge') as string) || '',
      solution: (formData.get('solution') as string) || '',
      results: resultsStr.split('\n').map((s) => s.trim()).filter(Boolean),
      tags: tagsStr.split(',').map((s) => s.trim()).filter(Boolean),
      demoUrl: (formData.get('demoUrl') as string) || undefined,
      featured: formData.get('featured') === 'on',
    };

    savePortfolioItem(newItem);
    refreshData();
    setIsProjectModalOpen(false);
    setEditingProject(null);
    showToast('تم حفظ بيانات المشروع بنجاح');
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المشروع من المعرض؟')) {
      deletePortfolioItem(id);
      refreshData();
      showToast('تم حذف المشروع');
    }
  };

  const handleResetPortfolio = () => {
    if (window.confirm('هل تريد استعادة المشاريع الافتراضية للمعرض؟')) {
      resetPortfolio();
      refreshData();
      showToast('تمت استعادة المشاريع الافتراضية');
    }
  };

  // Store Handlers
  const handleOrderStatusChange = (orderId: string, status: StoreOrder['status']) => {
    updateStoreOrderStatus(orderId, status);
    refreshData();
    showToast('تم تحديث حالة الطلب');
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج من المتجر؟')) {
      deleteStoreProduct(id);
      refreshData();
      showToast('تم حذف المنتج');
    }
  };

  const handleResetStoreProducts = () => {
    if (window.confirm('هل تريد استعادة المنتجات الافتراضية للمتجر؟')) {
      resetStoreProducts();
      refreshData();
      showToast('تمت استعادة منتجات المتجر الافتراضية');
    }
  };

  const handleSaveProductForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingProduct?.id || 'store-' + Date.now();
    const featuresStr = (formData.get('features') as string) || '';
    const deliverablesStr = (formData.get('deliverables') as string) || '';
    const category = (formData.get('category') as StoreProduct['category'] | null) ?? 'app';
    const categoryLabels: Record<StoreProduct['category'], string> = {
      app: 'تطبيق جاهز للشراء',
      design: 'تصميم وهوية',
      product: 'منتج رقمي',
    };

    const newItem: StoreProduct = {
      id,
      name: (formData.get('name') as string) || '',
      subtitle: (formData.get('subtitle') as string) || '',
      category,
      categoryLabel: (formData.get('categoryLabel') as string) || categoryLabels[category],
      price: Number(formData.get('price')) || 0,
      originalPrice: formData.get('originalPrice')
        ? Number(formData.get('originalPrice'))
        : undefined,
      currency: (formData.get('currency') as string) || '$',
      deliveryDays: (formData.get('deliveryDays') as string) || 'تسليم فوري خلال 24 ساعة',
      badge: (formData.get('badge') as string) || undefined,
      imageUrl:
        (formData.get('imageUrl') as string) ||
        'https://images.unsplash.com/photo-1556742049-0a67e55722c0?auto=format&fit=crop&w=800&q=80',
      shortDesc: (formData.get('shortDesc') as string) || '',
      fullDesc: (formData.get('fullDesc') as string) || '',
      features: featuresStr.split('\n').map((s) => s.trim()).filter(Boolean),
      deliverables: deliverablesStr.split('\n').map((s) => s.trim()).filter(Boolean),
      demoUrl: (formData.get('demoUrl') as string) || undefined,
      rating: editingProduct?.rating,
      salesCount: editingProduct?.salesCount,
      status: (formData.get('status') as StoreProduct['status'] | null) ?? 'available',
    };

    saveStoreProduct(newItem);
    refreshData();
    setIsProductModalOpen(false);
    setEditingProduct(null);
    showToast('تم حفظ بيانات المنتج وعرضها في المتجر');
  };

  const stats = {
    leads: leads.length,
    quotes: quotes.length,
    portfolio: portfolioList.length,
    orders: storeOrders.length,
  };

  const stageOptions: Array<{ value: LeadStage; label: string }> = [
    { value: 'nurture', label: 'متابعة أولية' },
    { value: 'warm', label: 'عميل دافئ' },
    { value: 'hot', label: 'فرصة ساخنة 🔥' },
    { value: 'quote_requested', label: 'طلب تسعير' },
    { value: 'awaiting_offer', label: 'بانتظار العرض' },
    { value: 'offer_sent', label: 'تم إرسال العرض' },
    { value: 'negotiation', label: 'مرحلة تفاوض' },
    { value: 'won', label: 'تم التعاقد ✓' },
    { value: 'lost', label: 'مغلق / غير مهتم' },
  ];

  return (
    <div className="bg-[var(--vls-paper)] text-[var(--vls-ink)] min-h-screen py-8 sm:py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--vls-line)] pb-6">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#9b8cff] tracking-wider block">
              VICTORIA ENTERPRISE CONTROL
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">مركز إدارة فيكتوريا لاين سوفت</h1>
            <p className="text-xs text-[var(--vls-ink-muted)] mt-1">
              العملاء، طلبات التسعير، معرض الأعمال الحي، وطلبات متجر التطبيقات والحلول.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[var(--vls-ink-muted)] border border-[var(--vls-line)] rounded-full px-3 py-1.5"
              title="تنتهي الجلسة تلقائياً لحماية لوحة التحكم"
            >
              <Clock size={12} />
              <span>الجلسة: {sessionRemainingMinutes()} د</span>
            </span>
            {feedbackMsg && (
              <span className="text-xs bg-[#82efda]/20 text-[#82efda] border border-[#82efda]/30 px-3 py-1.5 rounded-full font-bold animate-fadeUp flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>{feedbackMsg}</span>
              </span>
            )}
            <button
              onClick={() => {
                adminLogout();
                onLogout();
              }}
              className="inline-flex items-center gap-1.5 bg-[var(--vls-panel)] border border-[var(--vls-line)] px-4 py-2 rounded-xl text-xs font-bold text-[var(--vls-ink)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              <LogOut size={14} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* Backup & storage health toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between bg-[var(--vls-panel)] border border-[var(--vls-line)] rounded-2xl p-4">
          <div className="flex items-start gap-2.5 text-[11px] text-[var(--vls-ink-muted)]">
            <DatabaseBackup size={16} className="text-[#82efda] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              بيانات الـ CRM تُحفظ محلياً في متصفح هذا الجهاز. نزّل نسخة احتياطية دورياً قبل
              مسح بيانات المتصفح أو تغيير الجهاز.
              {!isStoragePersisting() && (
                <strong className="block text-red-400 mt-1 font-bold">
                  تحذير: التخزين المحلي غير متاح حالياً — البيانات ستُفقد عند إغلاق التبويب.
                </strong>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={backupInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportBackup(file);
                e.target.value = '';
              }}
            />
            <button
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] hover:bg-[var(--vls-btn-bg-hover)] cursor-pointer"
              title="تنزيل كل بيانات الـ CRM بصيغة JSON"
            >
              <Download size={13} />
              <span>نسخة احتياطية</span>
            </button>
            <button
              onClick={() => backupInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border border-[var(--vls-line)] text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)] cursor-pointer"
              title="استعادة نسخة احتياطية سابقة"
            >
              <Upload size={13} />
              <span>استيراد نسخة</span>
            </button>
            <button
              onClick={() => handleExportCsv('quotes')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border border-[var(--vls-line)] text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)] cursor-pointer"
            >
              <FileDown size={13} />
              <span>CSV الطلبات</span>
            </button>
            <button
              onClick={() => handleExportCsv('leads')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border border-[var(--vls-line)] text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)] cursor-pointer"
            >
              <FileDown size={13} />
              <span>CSV العملاء</span>
            </button>
            <button
              onClick={() => handleExportCsv('orders')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border border-[var(--vls-line)] text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)] cursor-pointer"
            >
              <FileDown size={13} />
              <span>CSV المتجر</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--vls-line)] pb-4">
          <button
            onClick={() => setActiveTab('crm')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'crm'
                ? 'bg-[#101318] dark:bg-white text-white dark:text-[#101318] shadow-md'
                : 'bg-[var(--vls-panel)] border border-[var(--vls-line)] text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)]'
            }`}
          >
            <Users size={16} />
            <span>العملاء والمبيعات ({leads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'portfolio'
                ? 'bg-[#101318] dark:bg-white text-white dark:text-[#101318] shadow-md'
                : 'bg-[var(--vls-panel)] border border-[var(--vls-line)] text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)]'
            }`}
          >
            <Layers size={16} />
            <span>معرض الأعمال ({portfolioList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'store'
                ? 'bg-[#101318] dark:bg-white text-white dark:text-[#101318] shadow-md'
                : 'bg-[var(--vls-panel)] border border-[var(--vls-line)] text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)]'
            }`}
          >
            <ShoppingBag size={16} />
            <span>المتجر والطلبات ({storeOrders.length})</span>
          </button>
        </div>

        {/* Stats Grid */}
        <MotionStaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" staggerChildren={0.06}>
          <MotionStaggerItem>
            <div className="p-5 rounded-2xl bg-[var(--vls-panel)] border border-[var(--vls-line)] shadow-sm flex items-center justify-between h-full">
              <div>
                <small className="text-xs text-[var(--vls-ink-muted)] block">العملاء والفرص</small>
                <strong className="text-3xl font-black font-mono text-[var(--vls-ink)] mt-1 block">
                  {stats.leads}
                </strong>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#9b8cff]/15 text-[#9b8cff] flex items-center justify-center">
                <Users size={20} />
              </div>
            </div>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <div className="p-5 rounded-2xl bg-[var(--vls-panel)] border border-[var(--vls-line)] shadow-sm flex items-center justify-between h-full">
              <div>
                <small className="text-xs text-[var(--vls-ink-muted)] block">طلبات التسعير</small>
                <strong className="text-3xl font-black font-mono text-[var(--vls-ink)] mt-1 block">
                  {stats.quotes}
                </strong>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#82efda]/15 text-[#82efda] flex items-center justify-center">
                <FileText size={20} />
              </div>
            </div>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <div className="p-5 rounded-2xl bg-[var(--vls-panel)] border border-[var(--vls-line)] shadow-sm flex items-center justify-between h-full">
              <div>
                <small className="text-xs text-[var(--vls-ink-muted)] block">مشاريع المعرض</small>
                <strong className="text-3xl font-black font-mono text-[var(--vls-ink)] mt-1 block">
                  {stats.portfolio}
                </strong>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#f3a5d5]/15 text-[#f3a5d5] flex items-center justify-center">
                <Layers size={20} />
              </div>
            </div>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <div className="p-5 rounded-2xl bg-[var(--vls-panel)] border border-[var(--vls-line)] shadow-sm flex items-center justify-between h-full">
              <div>
                <small className="text-xs text-[var(--vls-ink-muted)] block">طلبات المتجر الواردة</small>
                <strong className="text-3xl font-black font-mono text-[var(--vls-ink)] mt-1 block">
                  {stats.orders}
                </strong>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
                <ShoppingBag size={20} />
              </div>
            </div>
          </MotionStaggerItem>
        </MotionStaggerContainer>

        {/* TAB 1: CRM & Quotes */}
        {activeTab === 'crm' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* CRM Leads Pipeline */}
              <MotionReveal yOffset={24} className="lg:col-span-6">
                <section className="rounded-3xl border border-[var(--vls-line)] bg-[var(--vls-panel)] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-[var(--vls-line)] pb-3">
                    <h2 className="text-base font-extrabold text-[var(--vls-ink)]">Pipeline العملاء</h2>
                    <span className="text-[10px] font-mono font-bold text-[#82efda]">CRM ACTIVE</span>
                  </div>

                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {leads.length === 0 ? (
                      <p className="text-xs text-[var(--vls-ink-muted)] py-8 text-center">
                        لا توجد فرص مسجلة بعد.
                      </p>
                    ) : (
                      leads.map((l) => (
                        <article
                          key={l.id}
                          className="p-4 rounded-xl border border-[var(--vls-line)] bg-black/[0.02] dark:bg-white/[0.02] space-y-2.5"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <strong className="text-xs font-bold text-[var(--vls-ink)] block">
                                {l.name}
                              </strong>
                              <span className="text-[11px] text-[var(--vls-ink-muted)]">
                                {l.company || 'فرد'} · {l.phone || l.email || 'لا توجد وسيلة تواصل'}
                              </span>
                            </div>
                            <div className="text-left shrink-0">
                              <span
                                className={`text-xs font-mono font-black px-2 py-0.5 rounded-full ${
                                  l.score >= 75
                                    ? 'bg-red-500/10 text-red-500'
                                    : l.score >= 45
                                    ? 'bg-amber-500/10 text-amber-500'
                                    : 'bg-gray-500/10 text-gray-400'
                                }`}
                              >
                                {l.score}%
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-[var(--vls-ink)] leading-relaxed bg-[var(--vls-paper)] p-2.5 rounded-lg border border-[var(--vls-line)]">
                            {l.need || 'لم يحدد الاحتياج بعد'}
                          </p>

                          <div className="flex justify-between items-center text-xs pt-1">
                            <span className="text-[10px] text-[var(--vls-ink-muted)] font-mono">
                              {l.created_at.slice(0, 10)}
                            </span>
                            <select
                              value={l.stage}
                              onChange={(e) => handleStageChange(l.id, e.target.value as LeadStage)}
                              className="text-xs font-bold bg-[var(--vls-paper)] border border-[var(--vls-line)] rounded-lg px-2.5 py-1 text-[var(--vls-ink)] outline-none cursor-pointer"
                            >
                              {stageOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              </MotionReveal>

              {/* Quotes & Offers Management */}
              <MotionReveal yOffset={24} delay={0.08} className="lg:col-span-6">
                <section className="rounded-3xl border border-[var(--vls-line)] bg-[var(--vls-panel)] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-[var(--vls-line)] pb-3">
                    <h2 className="text-base font-extrabold text-[var(--vls-ink)]">طلبات عروض الأسعار</h2>
                    <span className="text-[10px] font-mono font-bold text-[#82efda]">OFFERS</span>
                  </div>

                  <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                    {quotes.length === 0 ? (
                      <p className="text-xs text-[var(--vls-ink-muted)] py-8 text-center">
                        لا توجد طلبات تسعير بعد.
                      </p>
                    ) : (
                      quotes.map((q) => (
                        <article
                          key={q.id}
                          className="p-4 rounded-xl border border-[var(--vls-line)] bg-black/[0.02] dark:bg-white/[0.02] space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <strong className="text-xs font-bold text-[var(--vls-ink)]">
                                #{q.id} · {q.name}
                              </strong>
                              <span className="text-[11px] text-[var(--vls-ink-muted)] block">
                                {q.phone} · {q.service} · {q.status}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-[var(--vls-ink-muted)]">
                              {q.created_at}
                            </span>
                          </div>

                          <p className="text-xs text-[var(--vls-ink)] leading-relaxed bg-[var(--vls-paper)] p-2.5 rounded-lg border border-[var(--vls-line)]">
                            {q.details || 'لا توجد تفاصيل إضافية.'}
                          </p>

                          {/* Offer Drafting */}
                          <div className="space-y-2 pt-1">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={offerInputs[q.id] || ''}
                                onChange={(e) =>
                                  setOfferInputs((prev) => ({ ...prev, [q.id]: e.target.value }))
                                }
                                placeholder="اكتب تفاصيل أو سعر العرض هنا..."
                                className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--vls-line)] bg-[var(--vls-paper)] text-xs text-[var(--vls-ink)] outline-none focus:border-[#9b8cff]"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveOffer(q.id)}
                                className="bg-[#101318] dark:bg-white text-white dark:text-[#101318] px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 cursor-pointer shrink-0"
                              >
                                حفظ العرض
                              </button>
                            </div>

                            {q.offer && (
                              <div className="flex justify-between items-center gap-2 pt-1">
                                <span className="text-[11px] text-[#82efda] bg-[#82efda]/10 px-2.5 py-1 rounded-md line-clamp-1 flex-1 border border-[#82efda]/20">
                                  العرض الحالي: {q.offer}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenWhatsApp(q)}
                                  className="bg-[#25D366] text-[#080b16] px-3 py-1 rounded-lg text-[11px] font-bold hover:bg-[#20ba5a] transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0"
                                >
                                  <MessageSquare size={12} />
                                  <span>إرسال عبر WhatsApp ↗</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              </MotionReveal>
            </div>

            {/* AI Audit Log */}
            <MotionReveal yOffset={24}>
              <section className="rounded-3xl border border-[var(--vls-line)] bg-[var(--vls-panel)] p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[var(--vls-line)] pb-3">
                  <h2 className="text-base font-extrabold text-[var(--vls-ink)] flex items-center gap-2">
                    <Sparkles size={16} className="text-[#9b8cff]" />
                    <span>آخر محادثات المساعد الذكي Victoria AI</span>
                  </h2>
                  <span className="text-[10px] font-mono font-bold text-[#9b8cff]">AUDIT LOG</span>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {interactions.length === 0 ? (
                    <p className="text-xs text-[var(--vls-ink-muted)] py-6 text-center">
                      لا توجد محادثات مسجلة بعد.
                    </p>
                  ) : (
                    interactions.map((x) => (
                      <article
                        key={x.id}
                        className="p-3.5 rounded-xl border border-[var(--vls-line)] bg-black/[0.02] dark:bg-white/[0.02] space-y-1.5 text-xs"
                      >
                        <div className="flex justify-between items-center text-[10px] text-[var(--vls-ink-muted)] font-mono">
                          <span>{x.created_at}</span>
                          <span className="font-bold text-[#82efda]">تقييم: {x.lead_score}%</span>
                        </div>
                        <p className="text-[var(--vls-ink)]">
                          <strong className="text-[#82efda]">العميل:</strong> {x.message}
                        </p>
                        <p className="text-[var(--vls-ink-muted)]">
                          <strong className="text-[#9b8cff]">Victoria AI:</strong> {x.reply}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </MotionReveal>

            {/* Follow-ups Manager */}
            <MotionReveal yOffset={24}>
              <section className="rounded-3xl border border-[var(--vls-line)] bg-[var(--vls-panel)] p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[var(--vls-line)] pb-3">
                  <h2 className="text-base font-extrabold text-[var(--vls-ink)] flex items-center gap-2">
                    <ClipboardList size={16} className="text-[#82efda]" />
                    <span>قائمة المتابعات</span>
                  </h2>
                  <span className="text-[10px] font-mono font-bold text-[#82efda]">
                    {followups.filter((f) => f.status === 'pending').length} قيد الانتظار
                  </span>
                </div>

                <form onSubmit={handleAddFollowup} className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={newFollowupNote}
                    onChange={(e) => setNewFollowupNote(e.target.value)}
                    placeholder="أضف متابعة جديدة، مثال: اتصال متابعة بعرض السعر يوم الأحد"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none focus:border-[var(--vls-accent)]"
                  />
                  <select
                    value={newFollowupChannel}
                    onChange={(e) => setNewFollowupChannel(e.target.value as Followup['channel'])}
                    className="px-3 py-2.5 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none"
                    aria-label="قناة المتابعة"
                  >
                    <option value="whatsapp">واتساب</option>
                    <option value="phone">اتصال</option>
                    <option value="email">بريد إلكتروني</option>
                  </select>
                  <button
                    type="submit"
                    disabled={!newFollowupNote.trim()}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] hover:bg-[var(--vls-btn-bg-hover)] cursor-pointer disabled:opacity-50"
                  >
                    <Plus size={14} />
                    <span>إضافة</span>
                  </button>
                </form>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {followups.length === 0 ? (
                    <p className="text-xs text-[var(--vls-ink-muted)] py-6 text-center">
                      لا توجد متابعات مسجلة.
                    </p>
                  ) : (
                    followups.map((f) => (
                      <article
                        key={f.id}
                        className={`p-3.5 rounded-xl border space-y-1.5 text-xs flex items-start gap-3 ${
                          f.status === 'completed'
                            ? 'border-[var(--vls-line-soft)] opacity-60 bg-black/[0.02] dark:bg-white/[0.02]'
                            : 'border-[var(--vls-line)] bg-black/[0.02] dark:bg-white/[0.02]'
                        }`}
                      >
                        <button
                          onClick={() =>
                            handleToggleFollowup(f.id, f.status === 'completed' ? 'pending' : 'completed')
                          }
                          title={f.status === 'completed' ? 'إعادة فتح' : 'إغلاق المتابعة'}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer ${
                            f.status === 'completed'
                              ? 'bg-[#82efda] border-[#82efda] text-[#080b16]'
                              : 'border-[var(--vls-line)] text-transparent hover:border-[#82efda]'
                          }`}
                        >
                          <CheckCircle2 size={13} />
                        </button>
                        <div className="flex-1 space-y-1">
                          <p
                            className={`text-[var(--vls-ink)] leading-relaxed ${
                              f.status === 'completed' ? 'line-through' : ''
                            }`}
                          >
                            {f.note}
                          </p>
                          <span className="text-[10px] text-[var(--vls-ink-muted)] font-mono">
                            {f.channel} · {f.created_at}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteFollowup(f.id)}
                          title="حذف المتابعة"
                          className="p-1.5 rounded-lg text-[var(--vls-ink-muted)] hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </MotionReveal>
          </div>
        )}

        {/* TAB 2: Portfolio Manager */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--vls-panel)] p-5 rounded-2xl border border-[var(--vls-line)]">
              <div>
                <h2 className="text-lg font-black text-[var(--vls-ink)]">
                  إدارة وتعديل معرض الأعمال الحقيقية
                </h2>
                <p className="text-xs text-[var(--vls-ink-muted)] mt-1">
                  يمكنك إضافة مشاريع حقيقية مع صورها وتفاصيلها، تعديل بياناتها، أو حذفها لتظهر فوراً في الواجهة الرئيسية.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetPortfolio}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-[var(--vls-line)] text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)] cursor-pointer"
                  title="استعادة الأعمال الافتراضية"
                >
                  <RotateCcw size={14} />
                  <span>استعادة الافتراضي</span>
                </button>

                <button
                  onClick={() => {
                    setEditingProject(null);
                    setIsProjectModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-[#9b8cff] text-[#080b16] hover:bg-white cursor-pointer shadow-md"
                >
                  <Plus size={16} />
                  <span>إضافة عمل جديد</span>
                </button>
              </div>
            </div>

            {/* Portfolio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioList.map((project) => (
                <article
                  key={project.id}
                  className="rounded-2xl border border-[var(--vls-line)] bg-[var(--vls-panel)] overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 w-full overflow-hidden bg-black/10">
                      <SafeImage
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-[#82efda] backdrop-blur-md">
                        {project.categoryLabel}
                      </span>
                      <span className="absolute bottom-2 left-2 text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded font-mono">
                        {project.year}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <strong className="text-xs font-mono text-[#9b8cff] block">
                        {project.client}
                      </strong>
                      <h3 className="text-sm font-extrabold text-[var(--vls-ink)] line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="text-xs text-[var(--vls-ink-muted)] line-clamp-2 leading-relaxed">
                        {project.summary}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-[var(--vls-line)] flex items-center justify-between gap-2 mt-3">
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setIsProjectModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-black/5 dark:bg-white/5 hover:bg-[#9b8cff]/20 text-[var(--vls-ink)] cursor-pointer"
                    >
                      <Edit2 size={13} />
                      <span>تعديل</span>
                    </button>

                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>حذف</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Store & Orders Manager */}
        {activeTab === 'store' && (
          <div className="space-y-8">
            {/* Orders Section */}
            <section className="rounded-3xl border border-[var(--vls-line)] bg-[var(--vls-panel)] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--vls-line)] pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-[var(--vls-ink)] flex items-center gap-2">
                    <ShoppingBag size={18} className="text-[#25D366]" />
                    <span>طلبات الشراء الواردة من المتجر ({storeOrders.length})</span>
                  </h2>
                  <p className="text-xs text-[var(--vls-ink-muted)] mt-0.5">
                    متابعة طلبات شراء التطبيقات والتصاميم والتواصل المباشر مع العملاء عبر واتساب.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/store')}
                  className="text-xs text-[#9b8cff] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>معاينة المتجر ↗</span>
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {storeOrders.length === 0 ? (
                  <p className="text-xs text-[var(--vls-ink-muted)] py-8 text-center">
                    لا توجد طلبات متجر بعد. أي طلب شراء من الزوار سيظهر هنا فوراً.
                  </p>
                ) : (
                  storeOrders.map((order) => (
                    <article
                      key={order.id}
                      className="p-4 rounded-xl border border-[var(--vls-line)] bg-black/[0.02] dark:bg-white/[0.02] space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <strong className="text-xs font-mono font-bold text-[#82efda] block">
                            #{order.id} · {order.customerName}
                          </strong>
                          <span className="text-[11px] text-[var(--vls-ink-muted)]">
                            {order.customerPhone} {order.customerEmail ? `· ${order.customerEmail}` : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black font-mono text-[#9b8cff]">
                            {order.totalPrice} {order.currency}
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleOrderStatusChange(order.id, e.target.value as StoreOrder['status'])
                            }
                            className="text-xs font-bold bg-[var(--vls-paper)] border border-[var(--vls-line)] rounded-lg px-2.5 py-1 text-[var(--vls-ink)] outline-none cursor-pointer"
                          >
                            <option value="new">طلب جديد 🟡</option>
                            <option value="contacted">تم التواصل 🔵</option>
                            <option value="processing">قيد التجهيز 🟣</option>
                            <option value="completed">مكتمل ومسلّم 🟢</option>
                            <option value="cancelled">ملغي 🔴</option>
                          </select>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="p-2.5 rounded-lg bg-[var(--vls-paper)] border border-[var(--vls-line)] text-xs space-y-1">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span>{it.productName} (x{it.quantity})</span>
                            <span className="font-mono text-[var(--vls-ink-muted)]">
                              {it.price * it.quantity} {order.currency}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <p className="text-[11px] text-[var(--vls-ink-muted)] italic">
                          ملاحظة العميل: {order.notes}
                        </p>
                      )}

                      <div className="flex justify-between items-center pt-1 border-t border-[var(--vls-line)]">
                        <span className="text-[10px] font-mono text-[var(--vls-ink-muted)]">
                          {order.createdAt}
                        </span>
                        <a
                          href={buildWhatsAppUrl(
                            order.customerPhone,
                            `مرحباً ${order.customerName}، نتواصل معك من Victoria Line Soft بخصوص طلبك رقم #${order.id} من المتجر.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#25D366] text-[#080b16] hover:bg-[#20ba5a]"
                        >
                          <MessageSquare size={13} />
                          <span>محادثة العميل واتساب ↗</span>
                        </a>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            {/* Products Catalog List */}
            <section className="rounded-3xl border border-[var(--vls-line)] bg-[var(--vls-panel)] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--vls-line)] pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-[var(--vls-ink)] flex items-center gap-2">
                    <Package size={18} className="text-[#9b8cff]" />
                    <span>كتالوج منتجات المتجر ({storeProducts.length})</span>
                  </h2>
                  <p className="text-xs text-[var(--vls-ink-muted)] mt-0.5">
                    المنتجات المعروضة في صفحة المتجر للشراء الفوري.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetStoreProducts}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--vls-line)] text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)] cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>استعادة المنتجات الافتراضية</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setIsProductModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black bg-[#9b8cff] text-[#080b16] hover:bg-white cursor-pointer shadow-md"
                  >
                    <Plus size={14} />
                    <span>إضافة منتج</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {storeProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-xl border border-[var(--vls-line)] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between gap-3"
                  >
                    <SafeImage
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <strong className="text-xs font-bold text-[var(--vls-ink)] block truncate">
                        {prod.name}
                      </strong>
                      <span className="text-[11px] text-[var(--vls-ink-muted)] block">
                        {prod.categoryLabel}
                      </span>
                      <span className="text-xs font-black font-mono text-[#9b8cff]">
                        {prod.price} {prod.currency}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setIsProductModalOpen(true);
                        }}
                        className="p-2 text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer"
                        title="تعديل المنتج"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Edit/Add Portfolio Modal */}
      <AnimatePresence>
        {isProjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProjectModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-[var(--vls-panel)] border border-[var(--vls-line)] rounded-3xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto text-right"
              dir="rtl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[var(--vls-line)] mb-5">
                <h3 className="text-base sm:text-lg font-black text-[var(--vls-ink)]">
                  {editingProject ? 'تعديل بيانات المشروع' : 'إضافة مشروع جديد للمعرض'}
                </h3>
                <button
                  onClick={() => setIsProjectModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--vls-ink)] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProjectForm} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--vls-ink)] mb-1">
                    عنوان المشروع *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingProject?.title || ''}
                    placeholder="مثال: منصة نمو السحابية لإدارة المؤسسات"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--vls-paper)] border border-[var(--vls-line)] text-[var(--vls-ink)] focus:border-[#9b8cff] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--vls-ink)] mb-1">
                    الوصف المختصر (Subtitle) *
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    required
                    defaultValue={editingProject?.subtitle || ''}
                    placeholder="مثال: نظام ERP يربط المبيعات والمخزون والفواتير"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--vls-paper)] border border-[var(--vls-line)] text-[var(--vls-ink)] focus:border-[#9b8cff] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[var(--vls-ink)] mb-1">
                      التصنيف البرمجي *
                    </label>
                    <select
                      name="category"
                      defaultValue={editingProject?.category || 'system'}
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--vls-paper)] border border-[var(--vls-line)] text-[var(--vls-ink)] focus:border-[#9b8cff] outline-none"
                    >
                      <option value="system">أنظمة أعمال خاصة (system)</option>
                      <option value="commerce">متاجر إلكترونية (commerce)</option>
                      <option value="app">تطبيقات جوال (app)</option>
                      <option value="web">منصات ومواقع (web)</option>
                      <option value="brand">هوية وتصميم تجاري (brand)</option>
                      <option value="ai">ذكاء اصطناعي وأتمتة (ai)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--vls-ink)] mb-1">
                      اسم التصنيف المعروض (Badge) *
                    </label>
                    <input
                      type="text"
                      name="categoryLabel"
                      required
                      defaultValue={editingProject?.categoryLabel || 'أنظمة أعمال خاصة'}
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--vls-paper)] border border-[var(--vls-line)] text-[var(--vls-ink)] focus:border-[#9b8cff] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[var(--vls-ink)] mb-1">
                      اسم العميل أو الشركة *
                    </label>
                    <input
                      type="text"
                      name="client"
                      required
                      defaultValue={editingProject?.client || ''}
                      placeholder="مثال: شركة نمو القابضة"
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--vls-paper)] border border-[var(--vls-line)] text-[var(--vls-ink)] focus:border-[#9b8cff] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--vls-ink)] mb-1">
                      سنة الإنجاز *
                    </label>
                    <input
                      type="text"
                      name="year"
                      required
                      defaultValue={editingProject?.year || '2026'}
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--vls-paper)] border border-[var(--vls-line)] text-[var(--vls-ink)] focus:border-[#9b8cff] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[var(--vls-ink)] mb-1">
                    رابط صورة الغلاف (URL) *
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    required
                    defaultValue={editingProject?.imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--vls-paper)] border border-[var(--vls-line)] text-[var(--vls-ink)] focus:border-[#9b8cff] outline-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--vls-ink)] mb-1">
                    الملخص الشامل للمشروع *
                  </label>
                  <textarea
                    name="summary"
                    rows={2}
                    required
                    defaultValue={editingProject?.summary || ''}
                    placeholder="شرح مبسط لما تم تنفيذه في المشروع..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--vls-paper)] border border-[var(--vls-line)] text-[var(--vls-ink)] focus:border-[#9b8cff] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[var(--vls-ink)] mb-1">
                      التحدي الأساسي للعميل
                    </label>
                    <textarea
                      name="challenge"
                      rows={2}
                      defaultValue={editingProject?.challenge || ''}
                      placeholder="ما المشكلة التي كان يعاني منها العميل..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--vls-paper)] border border-[var(--vls-line)] text-[var(--vls-ink)] focus:border-[#9b8cff] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[var(--vls-ink)] mb-1">
                      الحل المنفذ من فيكتوريا لاين
                    </label>
                    <textarea
                      name="solution"
                      rows={2}
                      defaultValue={editingProject?.solution || ''}
                      placeholder="كيف قمنا بحل التحدي برمجياً وتصميمياً..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--vls-paper)] border border-[var(--vls-line)] text-[var(--vls-ink)] focus:border-[#9b8cff] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[var(--vls-ink)] mb-1">
                    النتائج والأثر بالأرقام (سطر لكل نتيجة)
                  </label>
                  <textarea
                    name="results"
                    rows={2}
                    defaultValue={editingProject?.results.join('\n') || ''}
                    placeholder="مثال:&#10;+85% كفاءة تشغيلية&#10;زيادة المبيعات بنسبة 180%"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--vls-paper)] border border-[var(--vls-line)] text-[var(--vls-ink)] focus:border-[#9b8cff] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--vls-ink)] mb-1">
                    التقنيات والوسوم (مفصولة بفاصلة)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    defaultValue={editingProject?.tags.join(', ') || ''}
                    placeholder="React, Next.js, Node.js, Fintech, واتساب"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--vls-paper)] border border-[var(--vls-line)] text-[var(--vls-ink)] focus:border-[#9b8cff] outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    defaultChecked={editingProject?.featured ?? true}
                    className="rounded border-[var(--vls-line)]"
                  />
                  <label htmlFor="featured" className="font-bold text-[var(--vls-ink)] cursor-pointer">
                    تمييز المشروع في الصفحة الرئيسية (Featured)
                  </label>
                </div>

                <div className="pt-4 border-t border-[var(--vls-line)] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--vls-line)] text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#9b8cff] text-[#080b16] hover:bg-white transition-all shadow-md"
                  >
                    حفظ ونشر في المعرض
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit/Add Store Product Modal */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsProductModalOpen(false)}
            />
            <motion.form
              onSubmit={handleSaveProductForm}
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl bg-[var(--vls-panel)] border border-[var(--vls-line)] rounded-3xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-4"
              dir="rtl"
            >
              <div className="flex justify-between items-center border-b border-[var(--vls-line)] pb-3">
                <h2 className="text-base font-extrabold text-[var(--vls-ink)]">
                  {editingProduct ? 'تعديل منتج المتجر' : 'إضافة منتج جديد للمتجر'}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-2 rounded-lg text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  aria-label="إغلاق"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-[11px] font-bold text-[var(--vls-ink)] space-y-1 sm:col-span-2">
                  <span>اسم المنتج *</span>
                  <input
                    name="name"
                    required
                    defaultValue={editingProduct?.name || ''}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none focus:border-[var(--vls-accent)]"
                  />
                </label>
                <label className="text-[11px] font-bold text-[var(--vls-ink)] space-y-1 sm:col-span-2">
                  <span>العنوان الفرعي</span>
                  <input
                    name="subtitle"
                    defaultValue={editingProduct?.subtitle || ''}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none focus:border-[var(--vls-accent)]"
                  />
                </label>
                <label className="text-[11px] font-bold text-[var(--vls-ink)] space-y-1">
                  <span>التصنيف</span>
                  <select
                    name="category"
                    defaultValue={editingProduct?.category || 'app'}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none"
                  >
                    <option value="app">تطبيق جاهز</option>
                    <option value="design">تصميم وهوية</option>
                    <option value="product">منتج رقمي</option>
                  </select>
                </label>
                <label className="text-[11px] font-bold text-[var(--vls-ink)] space-y-1">
                  <span>نص التصنيف الظاهر</span>
                  <input
                    name="categoryLabel"
                    defaultValue={editingProduct?.categoryLabel || ''}
                    placeholder="تطبيق جاهز للشراء"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none focus:border-[var(--vls-accent)]"
                  />
                </label>
                <label className="text-[11px] font-bold text-[var(--vls-ink)] space-y-1">
                  <span>السعر *</span>
                  <input
                    name="price"
                    type="number"
                    min={0}
                    required
                    defaultValue={editingProduct?.price ?? ''}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none focus:border-[var(--vls-accent)]"
                  />
                </label>
                <label className="text-[11px] font-bold text-[var(--vls-ink)] space-y-1">
                  <span>السعر قبل الخصم (اختياري)</span>
                  <input
                    name="originalPrice"
                    type="number"
                    min={0}
                    defaultValue={editingProduct?.originalPrice ?? ''}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none focus:border-[var(--vls-accent)]"
                  />
                </label>
                <label className="text-[11px] font-bold text-[var(--vls-ink)] space-y-1">
                  <span>العملة</span>
                  <input
                    name="currency"
                    defaultValue={editingProduct?.currency || '$'}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none focus:border-[var(--vls-accent)]"
                  />
                </label>
                <label className="text-[11px] font-bold text-[var(--vls-ink)] space-y-1">
                  <span>شارة المنتج (اختياري)</span>
                  <input
                    name="badge"
                    defaultValue={editingProduct?.badge || ''}
                    placeholder="الأكثر مبيعاً"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none focus:border-[var(--vls-accent)]"
                  />
                </label>
                <label className="text-[11px] font-bold text-[var(--vls-ink)] space-y-1 sm:col-span-2">
                  <span>مدة التسليم</span>
                  <input
                    name="deliveryDays"
                    defaultValue={editingProduct?.deliveryDays || ''}
                    placeholder="تسليم وتركيب فوري خلال 24 ساعة"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none focus:border-[var(--vls-accent)]"
                  />
                </label>
                <label className="text-[11px] font-bold text-[var(--vls-ink)] space-y-1 sm:col-span-2">
                  <span>رابط صورة المنتج</span>
                  <input
                    name="imageUrl"
                    type="url"
                    defaultValue={editingProduct?.imageUrl || ''}
                    placeholder="https://…"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none focus:border-[var(--vls-accent)]"
                  />
                </label>
                <label className="text-[11px] font-bold text-[var(--vls-ink)] space-y-1 sm:col-span-2">
                  <span>وصف مختصر</span>
                  <textarea
                    name="shortDesc"
                    rows={2}
                    defaultValue={editingProduct?.shortDesc || ''}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none focus:border-[var(--vls-accent)]"
                  />
                </label>
                <label className="text-[11px] font-bold text-[var(--vls-ink)] space-y-1 sm:col-span-2">
                  <span>الوصف الكامل</span>
                  <textarea
                    name="fullDesc"
                    rows={3}
                    defaultValue={editingProduct?.fullDesc || ''}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none focus:border-[var(--vls-accent)]"
                  />
                </label>
                <label className="text-[11px] font-bold text-[var(--vls-ink)] space-y-1">
                  <span>المميزات (سطر لكل ميزة)</span>
                  <textarea
                    name="features"
                    rows={4}
                    defaultValue={(editingProduct?.features || []).join('\n')}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none focus:border-[var(--vls-accent)]"
                  />
                </label>
                <label className="text-[11px] font-bold text-[var(--vls-ink)] space-y-1">
                  <span>المسلّمات (سطر لكل مسلّمة)</span>
                  <textarea
                    name="deliverables"
                    rows={4}
                    defaultValue={(editingProduct?.deliverables || []).join('\n')}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none focus:border-[var(--vls-accent)]"
                  />
                </label>
                <label className="text-[11px] font-bold text-[var(--vls-ink)] space-y-1">
                  <span>رابط تجربة (اختياري)</span>
                  <input
                    name="demoUrl"
                    type="url"
                    defaultValue={editingProduct?.demoUrl || ''}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none focus:border-[var(--vls-accent)]"
                  />
                </label>
                <label className="text-[11px] font-bold text-[var(--vls-ink)] space-y-1">
                  <span>حالة التوفر</span>
                  <select
                    name="status"
                    defaultValue={editingProduct?.status || 'available'}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none"
                  >
                    <option value="available">متاح للشراء</option>
                    <option value="sold_out">نفد مؤقتاً</option>
                    <option value="custom_only">حسب الطلب فقط</option>
                  </select>
                </label>
              </div>

              <div className="pt-4 border-t border-[var(--vls-line)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--vls-line)] text-[var(--vls-ink-muted)] hover:text-[var(--vls-ink)] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#9b8cff] text-[#080b16] hover:bg-white transition-all shadow-md cursor-pointer"
                >
                  حفظ ونشر في المتجر
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
