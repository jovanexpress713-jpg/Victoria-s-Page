/**
 * إعدادات الموقع المركزية.
 * أي تعديل على الهوية أو أرقام التواصل أو روابط التنقل يتم من هنا فقط.
 */

const env = (import.meta.env ?? {}) as ImportMetaEnv;

export const SITE = {
  name: env.VITE_APP_NAME?.trim() || 'Victoria Line Soft',
  nameAr: 'فيكتوريا لاين سوفت',
  tagline: 'حوّل فكرتك إلى تجربة رقمية تعمل',
  description:
    'حلول رقمية وتصميم وذكاء اصطناعي لنمو الأعمال — استوديو رقمي متكامل، خدمات برمجية، متجر حلول جاهزة، مختبر حي تفاعلي، ومساعد استكشاف ذكي.',
  /** النطاق الكامل بدون سلاش في النهاية. يُضبط عبر VITE_SITE_URL في الإنتاج. */
  url: (env.VITE_SITE_URL?.trim() || '').replace(/\/+$/, ''),
  locale: 'ar_YE',
  lang: 'ar',
  dir: 'rtl' as const,
  /** رقم واتساب الرسمي (صيغة دولية بدون +). */
  whatsapp: (env.VITE_WHATSAPP_NUMBER?.trim() || '967771119726').replace(/[^\d]/g, ''),
  whatsappDisplay: '+967 771 119 726',
  email: 'hello@victorialinesoft.com',
  foundedYear: '2026',
  themeColor: { dark: '#080b16', light: '#f5f5f0' },
} as const;

export interface NavLink {
  path: string;
  label: string;
  /** شارة اختيارية تظهر بجانب الرابط (مثل "جديد"). */
  badge?: string;
}

/** روابط التنقل الرئيسية — تُستخدم في القائمة والتذييلة وخريطة الموقع. */
export const NAV_LINKS: NavLink[] = [
  { path: '/', label: 'الرئيسية' },
  { path: '/store', label: 'المتجر', badge: 'جديد' },
  { path: '/products', label: 'الحلول والخدمات' },
  { path: '/lab', label: 'المختبر الحي' },
  { path: '/ai/sales', label: 'مساعد ذكي' },
  { path: '/insights', label: 'المعرفة' },
  { path: '/contact', label: 'ابدأ مشروعك' },
];

/** المسارات العامة القابلة للفهرسة (تُستخدم في sitemap و robots). */
export const PUBLIC_ROUTES: string[] = [
  '/',
  '/store',
  '/products',
  '/lab',
  '/ai/sales',
  '/insights',
  '/contact',
];

/** مسارات لا يجب فهرستها (مناطق إدارية أو تحويلات خارجية). */
export const PRIVATE_ROUTES: string[] = ['/admin', '/admin/login', '/whatsapp'];

export const WHATSAPP_DEFAULT_MESSAGE =
  'مرحباً، أريد الاستفسار عن خدمات Victoria Line Soft.';
