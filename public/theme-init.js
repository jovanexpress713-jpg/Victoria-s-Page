/* تهيئة السمة قبل أول رسم لمنع وميض الثيم (FOUC). يُحمّل بشكل متزامن قبل حزمة التطبيق. */
(function () {
  var doc = document.documentElement;
  var theme = 'dark';
  try {
    var saved = window.localStorage.getItem('vls_theme');
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch {
    /* التخزين غير متاح (وضع خاص) — نستخدم السمة الافتراضية */
  }
  doc.setAttribute('data-theme', theme);
  doc.classList.add(theme);
  doc.style.colorScheme = theme;

  function syncThemeColor() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#080b16' : '#f5f5f0');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncThemeColor, { once: true });
  } else {
    syncThemeColor();
  }
})();
