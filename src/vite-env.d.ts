/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** رقم واتساب الرسمي المستهدف (بصيغة دولية بدون +، مثال: 967771119726). */
  readonly VITE_WHATSAPP_NUMBER?: string;
  /** اسم الموقع الظاهر في الوسوم وعناوين الصفحات. */
  readonly VITE_APP_NAME?: string;
  /** النطاق الكامل للموقع، يُستخدم في canonical و sitemap و og:url. */
  readonly VITE_SITE_URL?: string;
  /**
   * بصمة SHA-256 (hex) لكلمة مرور لوحة الإدارة.
   * إن لم تُضبط يُستخدم قفل التطوير المحلي فقط مع تحذير في وضع الإنتاج.
   */
  readonly VITE_ADMIN_PASSWORD_HASH?: string;
  /** مدة جلسة الإدارة بالدقائق (افتراضياً 120). */
  readonly VITE_ADMIN_SESSION_MINUTES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
