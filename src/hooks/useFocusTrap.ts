import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * حبس التركيز داخل نافذة حوارية (معيار WAI-ARIA للـ Modal):
 * Tab يدور داخل العنصر، وEsc يُمرَّر للمكوّن عبر onEscape.
 * ملاحظات تنفيذية:
 * - يُقرأ ref.current أثناء الأحداث (وليس عند التفعيل فقط) ليبقى صحيحاً
 *   حتى لو أُعيد تركيب محتوى الحوار (مثل بطاقة الجولة متعددة الخطوات).
 * - يُخزَّن onEscape في ref داخلي حتى لا تتسبب دالة ممرَّرة inline
 *   في إعادة تشغيل الأثر مع كل ضغطة حرف داخل نماذج الحوار.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape?: () => void
): void {
  const escapeRef = useRef(onEscape);
  useEffect(() => {
    escapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active) return;
    if (!ref.current) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusFirst = () => {
      const node = ref.current;
      if (!node) return;
      const focusables = node.querySelectorAll<HTMLElement>(FOCUSABLE);
      (focusables[0] || node).focus({ preventScroll: true });
    };
    // تأخير بسيط حتى اكتمال حركة الظهور
    const timer = window.setTimeout(focusFirst, 60);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        escapeRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const node = ref.current;
      if (!node) return;

      const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [active, ref]);
}
