import { Product, Quote, Lead, AIInteraction, Followup } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'المواقع والمنصات الرقمية',
    description: 'حلول ويب وتجارب رقمية احترافية سريعة ومتجاوبة للشركات والمتاجر.',
    price: 'حسب الطلب',
    status: 'published',
  },
  {
    id: 2,
    name: 'أنظمة إدارة الأعمال',
    description: 'أنظمة إدارة مخصصة وسهلة الاستخدام لمتابعة العمليات والعملاء والتقارير.',
    price: 'حسب الطلب',
    status: 'published',
  },
  {
    id: 3,
    name: 'المتاجر الإلكترونية',
    description: 'كتالوجات منتجات ورحلة شراء متقنة مهيأة لخيارات الدفع والشحن المحلية والإقليمية.',
    price: 'حسب الطلب',
    status: 'published',
  },
  {
    id: 4,
    name: 'تطبيقات الويب والجوال',
    description: 'تطبيقات مصممة حول مهمة المستخدم وسهولة الاستخدام مع ربط قواعد البيانات.',
    price: 'حسب الطلب',
    status: 'published',
  },
  {
    id: 5,
    name: 'الهوية البصرية وتجربة المستخدم',
    description: 'تصميم علامة تجارية متكاملة وواجهات تترك انطباعاً فريداً وموثوقاً.',
    price: 'حسب الطلب',
    status: 'published',
  },
  {
    id: 6,
    name: 'مساعدو الذكاء الاصطناعي والأتمتة',
    description: 'مساعدات رقمية وسير عمل مخصص لتأهيل العملاء وجمع المتطلبات واختصار المهام المتكررة.',
    price: 'حسب الطلب',
    status: 'published',
  },
];

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 101,
    name: 'عبدالله السقاف',
    phone: '967771234567',
    service: 'متجر إلكتروني',
    details: 'نحتاج متجر لبيع الملابس مع ربط واتساب لاستقبال الطلبات ومعاينة السلة.',
    status: 'offer_ready',
    offer: 'متجر متكامل بكتالوج منتجات وسلة شراء وربط مباشر بالواتساب بقيمة مناسبة وتسليم خلال أسبوعين.',
    created_at: '2026-10-24 14:30',
  },
  {
    id: 102,
    name: 'مؤسسة الأفق للتجارة',
    phone: '967733445566',
    service: 'نظام لإدارة العمل',
    details: 'لوحة تحكم لإدارة الفواتير والعملاء مع تقارير شهرية وإشعارات.',
    status: 'new',
    created_at: '2026-10-25 09:15',
  },
  {
    id: 103,
    name: 'سارة باوزير',
    phone: '967711998877',
    service: 'موقع أو منصة رقمية',
    details: 'موقع تعريفي لعيادة طبية يعرض التخصصات ويتيح للزوار حجز المواعيد.',
    status: 'offer_sent',
    offer: 'تصميم موقع طبي متجاوب مع نموذج حجز ذكي وربط واتساب فوري.',
    created_at: '2026-10-23 18:40',
  },
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 1,
    name: 'عبدالله السقاف',
    company: 'السقاف للملابس',
    email: 'alsaqqaf@example.com',
    phone: '967771234567',
    need: 'متجر إلكتروني وسلة مبيعات',
    budget: '$800 - $1500',
    timeline: 'أسبوعين',
    decision_role: 'صاحب العمل',
    score: 85,
    stage: 'hot',
    created_at: '2026-10-24T14:30:00Z',
  },
  {
    id: 2,
    name: 'مؤسسة الأفق',
    company: 'الأفق للتجارة',
    email: 'info@alofooq.ye',
    phone: '967733445566',
    need: 'نظام إدارة عملاء وفواتير',
    budget: 'حسب العرض',
    timeline: 'شهر',
    decision_role: 'المدير التنفيذي',
    score: 65,
    stage: 'warm',
    created_at: '2026-10-25T09:15:00Z',
  },
  {
    id: 3,
    name: 'مروان الشميري',
    company: 'الشميري للتوزيع',
    email: 'marwan@example.com',
    phone: '967778899001',
    need: 'استكشاف إمكانية تطبيق جوال للمندوبين',
    budget: '',
    timeline: 'غير محدد',
    decision_role: 'مدير العمليات',
    score: 35,
    stage: 'nurture',
    created_at: '2026-10-25T11:00:00Z',
  },
];

export const INITIAL_INTERACTIONS: AIInteraction[] = [
  {
    id: 1,
    message: 'مرحباً، أريد إنشاء موقع لعرض منتجات شركتنا واستقبال الطلبات عبر واتساب',
    reply: 'أهلاً بك! فكرة ممتازة وتوفر تجربة سريعة بدون تعقيدات الدفع في البداية. هل المنتجات جاهزة بتصنيفاتها وصورها؟ وما هو عددها التقريبي؟',
    lead_score: 70,
    created_at: '2026-10-25 10:12',
  },
  {
    id: 2,
    message: 'كم تكلفة تصميم هوية بصرية كاملة؟',
    reply: 'حيّاك الله! التكلفة تعتمد على ما إذا كنت تحتاج فقط الشعار ودليل الألوان، أم تطبيقات كاملة مثل المطبوعات والواجهات الرقمية. ما هو مجال مشروعك؟',
    lead_score: 45,
    created_at: '2026-10-25 09:40',
  },
];

export const INITIAL_FOLLOWUPS: Followup[] = [
  {
    id: 1,
    lead_id: 1,
    channel: 'whatsapp',
    note: 'إرسال مسودة العرض ومناقشة تفاصيل طرق الاستلام',
    status: 'pending',
    created_at: '2026-10-24 16:00',
  },
];
