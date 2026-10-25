import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  normalizeWhatsApp,
  buildWhatsAppUrl,
  getStoredQuotes,
  saveQuote,
  updateQuoteOffer,
  getStoredFollowups,
  createStoreOrder,
  getStoredStoreOrders,
  getStoredLeads,
  buildCrmBackup,
  restoreCrmBackup,
  toCsv,
  isStoragePersisting,
  clearCrmData,
  STORAGE_KEYS,
} from '../storage';

describe('normalizeWhatsApp', () => {
  it('يوحّد الأرقام المحلية اليمنية إلى الصيغة الدولية', () => {
    expect(normalizeWhatsApp('0771119726')).toBe('967771119726');
    expect(normalizeWhatsApp('771119726')).toBe('967771119726');
    expect(normalizeWhatsApp('+967771119726')).toBe('967771119726');
    expect(normalizeWhatsApp('00967771119726')).toBe('967771119726');
  });

  it('ينظف المحارف غير الرقمية', () => {
    expect(normalizeWhatsApp(' 771 119 726 ')).toBe('967771119726');
  });
});

describe('buildWhatsAppUrl', () => {
  it('يبني رابط واتساب صالحاً برسالة افتراضية', () => {
    const url = buildWhatsAppUrl();
    expect(url).toContain('https://wa.me/967771119726?text=');
    expect(url).toContain(encodeURIComponent('مرحباً'));
  });

  it('يرمز الرسالة المخصصة بشكل صحيح', () => {
    const url = buildWhatsAppUrl('771119726', 'عرض سعر');
    expect(url).toBe(`https://wa.me/967771119726?text=${encodeURIComponent('عرض سعر')}`);
  });
});

describe('طلبات التسعير (Quotes)', () => {
  beforeEach(() => localStorage.clear());

  it('يحفظ الطلب في مقدمة القائمة بحالة new', () => {
    const quote = saveQuote({ name: 'أحمد', phone: '771119726', service: 'متجر', details: 'تفاصيل' });
    expect(quote.status).toBe('new');
    const all = getStoredQuotes();
    expect(all[0].id).toBe(quote.id);
    expect(all[0].name).toBe('أحمد');
  });

  it('يحفظ مسودة العرض ويضيف متابعة تلقائية', () => {
    const quote = saveQuote({ name: 'سارة', phone: '771223344', service: 'موقع', details: '' });
    const updated = updateQuoteOffer(quote.id, 'العرض: 500$');
    expect(updated?.status).toBe('offer_ready');
    const followups = getStoredFollowups();
    expect(followups.some((f) => f.note.includes('العرض: 500$'))).toBe(true);
  });
});

describe('طلبات المتجر (Store Orders)', () => {
  beforeEach(() => localStorage.clear());

  it('ينشئ الطلب ويسجل عميلاً ومتابعة في الـ CRM', () => {
    const order = createStoreOrder({
      customerName: 'خالد',
      customerPhone: '771556677',
      items: [{ productId: 'p1', productName: 'نظام كاشير', quantity: 1, price: 380 }],
      totalPrice: 380,
      currency: '$',
      status: 'new',
    });

    expect(order.id).toMatch(/^ORD-/);
    expect(getStoredStoreOrders()[0].id).toBe(order.id);

    const leads = getStoredLeads();
    expect(leads.some((l) => l.company.includes(order.id))).toBe(true);

    const followups = getStoredFollowups();
    expect(followups.some((f) => f.note.includes(order.id))).toBe(true);
  });
});

describe('النسخ الاحتياطي (Backup)', () => {
  beforeEach(() => localStorage.clear());

  it('يصدر ويستورد البيانات بدون فقدان', () => {
    saveQuote({ name: 'نسخة', phone: '771889900', service: 'هوية', details: '' });
    const backup = JSON.stringify(buildCrmBackup());

    clearCrmData();
    expect(getStoredQuotes().some((q) => q.name === 'نسخة')).toBe(false);

    const result = restoreCrmBackup(backup);
    expect(result).not.toBeNull();
    expect(getStoredQuotes().some((q) => q.name === 'نسخة')).toBe(true);
  });

  it('يرفض الملفات غير الصالحة', () => {
    expect(restoreCrmBackup('{ ليس json')).toBeNull();
    expect(restoreCrmBackup(JSON.stringify({ hello: 'world' }))).toBeNull();
  });
});

describe('toCsv', () => {
  it('يهرب الفواصل وعلامات الاقتباس ويضيف العناوين', () => {
    const csv = toCsv([{ name: 'شركة, المحدودة', note: 'قال "مرحباً"' }], [
      { key: 'name', label: 'الاسم' },
      { key: 'note', label: 'ملاحظة' },
    ]);
    const [header, row] = csv.split('\r\n');
    expect(header).toBe('الاسم,ملاحظة');
    expect(row).toBe('"شركة, المحدودة","قال ""مرحباً"""');
  });
});

describe('صلابة التخزين', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('يستمر بالعمل من الذاكرة المؤقتة عند فشل localStorage', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });

    expect(isStoragePersisting()).toBe(false);
    const quote = saveQuote({ name: 'ذاكرة', phone: '771000000', service: 'نظام', details: '' });
    expect(quote.name).toBe('ذاكرة');
    expect(getStoredQuotes()[0].name).toBe('ذاكرة');
  });

  it('يفصح عن مفتاح التخزين للمزامنة بين التبويبات', () => {
    expect(STORAGE_KEYS.PORTFOLIO).toBe('vls_portfolio_v2');
  });
});
