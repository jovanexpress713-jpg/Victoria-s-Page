import { useEffect } from 'react';
import { SITE } from '../config/site';

export interface PageMetaOptions {
  /** عنوان القسم (يُلحق به اسم الموقع تلقائياً). */
  title: string;
  description?: string;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * يحدّث عنوان الصفحة ووسوم المشاركة (description / og:title / og:description)
 * لكل مسار، لأن التطبيق يعمل كتطبيق صفحة واحدة بدون SSR.
 */
export function usePageMeta({ title, description }: PageMetaOptions): void {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE.name}`;
    document.title = fullTitle;

    const desc = description || SITE.description;
    upsertMeta('name', 'description', desc);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('name', 'twitter:description', desc);
  }, [title, description]);
}
