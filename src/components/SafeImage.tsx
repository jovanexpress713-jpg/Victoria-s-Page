import React, { useState } from 'react';

/** صورة بديلة متجهية تُعرض إذا تعذّر تحميل الصورة الأصلية (شبكات محجوبة/روابط ميتة). */
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#111a2d"/><stop offset="1" stop-color="#080b16"/></linearGradient><linearGradient id="m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d8ff7a"/><stop offset="1" stop-color="#9b8cff"/></linearGradient></defs><rect width="800" height="600" fill="url(#b)"/><g fill="none" stroke="#a69aff" stroke-opacity="0.18"><ellipse cx="400" cy="300" rx="260" ry="110" transform="rotate(-16 400 300)"/><ellipse cx="400" cy="300" rx="210" ry="150" transform="rotate(38 400 300)"/></g><g transform="translate(340 240) scale(1.9)"><rect width="64" height="64" rx="18" fill="#101318" stroke="#ffffff" stroke-opacity="0.12"/><path d="M16 18h6.6l9.4 22.2L41.4 18H48L34.9 47.2h-5.8z" fill="url(#m)"/><circle cx="48.5" cy="45.5" r="3.5" fill="#82efda"/></g></svg>`;

export const FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(FALLBACK_SVG)}`;

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** تحميل فوري للصور الظاهرة في أول شاشة (LCP). */
  eager?: boolean;
}

/**
 * وسم صورة آمن للإنتاج: تحميل كسول، فك ترميز غير متزامن،
 * وبديل تلقائي عند فشل التحميل حتى لا تظهر مربعات مكسورة للعميل.
 */
export const SafeImage: React.FC<SafeImageProps> = ({ eager = false, className = '', src, alt, ...rest }) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(src);

  // عند تغيّر المصدر: إعادة ضبط الحالة أثناء الرسم (نمط الحالة المشتقة)
  if (src !== currentSrc && status !== 'loading') {
    setCurrentSrc(src);
    setStatus('loading');
  }

  return (
    <img
      src={status === 'error' ? FALLBACK_IMAGE : currentSrc}
      alt={alt || ''}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setStatus('loaded')}
      onError={() => setStatus((prev) => (prev === 'error' ? prev : 'error'))}
      className={`${className} transition-opacity duration-500 ${
        status === 'loaded' ? 'opacity-100' : 'opacity-60'
      }`}
      {...rest}
    />
  );
};
