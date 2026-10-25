/**
 * محرك التخزين المحلي (CRM Persistence Engine).
 *
 * - كل عمليات القراءة/الكتابة محمية بـ try/catch مع بديل ذاكري مؤقت،
 *   حتى يعمل التطبيق في وضع التصفح الخاص أو عند امتلاء مساحة التخزين.
 * - يوفر تصدير/استيراد بيانات الـ CRM (JSON) وتصدير CSV للنسخ الاحتياطي.
 */
import type {
  Quote,
  Lead,
  AIInteraction,
  Followup,
  Product,
  PortfolioItem,
  StoreProduct,
  StoreOrder,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_QUOTES,
  INITIAL_LEADS,
  INITIAL_INTERACTIONS,
  INITIAL_FOLLOWUPS,
} from '../data/initialData';
import { INITIAL_PORTFOLIO } from '../data/portfolioData';
import { INITIAL_STORE_PRODUCTS } from '../data/storeData';
import { SITE, WHATSAPP_DEFAULT_MESSAGE } from '../config/site';

export const STORAGE_KEYS = {
  QUOTES: 'vls_quotes_v2',
  LEADS: 'vls_leads_v2',
  INTERACTIONS: 'vls_interactions_v2',
  FOLLOWUPS: 'vls_followups_v2',
  PRODUCTS: 'vls_products_v2',
  PORTFOLIO: 'vls_portfolio_v2',
  STORE_PRODUCTS: 'vls_store_products_v2',
  STORE_ORDERS: 'vls_store_orders_v2',
} as const;

export const DEFAULT_WHATSAPP = SITE.whatsapp;

// ---------------------------------------------------------------------------
// طبقة التخزين الآمنة
// ---------------------------------------------------------------------------

/** ذاكرة مؤقتة تعمل كبديل عند تعذّر استخدام localStorage. */
const memoryFallback = new Map<string, string>();
let storageWritable = true;

export function isStorageAvailable(): boolean {
  try {
    const probe = '__vls_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/** هل تُحفظ البيانات فعلياً في المتصفح الآن؟ (تُستخدم لتنبيه الإدارة) */
export function isStoragePersisting(): boolean {
  return storageWritable && isStorageAvailable();
}

function getRaw(key: string): string | null {
  try {
    const value = window.localStorage.getItem(key);
    if (value != null) return value;
  } catch {
    // التخزين غير متاح — نكمل من الذاكرة المؤقتة
  }
  return memoryFallback.get(key) ?? null;
}

function setRaw(key: string, value: string): boolean {
  memoryFallback.set(key, value);
  try {
    window.localStorage.setItem(key, value);
    storageWritable = true;
    return true;
  } catch {
    storageWritable = false;
    return false;
  }
}

function removeRaw(key: string): void {
  memoryFallback.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    // تجاهل
  }
}

function readJSON<T>(key: string, fallback: T): T {
  const raw = getRaw(key);
  if (raw == null) return fallback;
  try {
    const parsed = JSON.parse(raw) as T;
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): boolean {
  return setRaw(key, JSON.stringify(value));
}

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 16);
}

function uniqueId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// ---------------------------------------------------------------------------
// واتساب
// ---------------------------------------------------------------------------

export function normalizeWhatsApp(phone: string): string {
  let value = (phone || '').replace(/[^\d+]/g, '');
  if (value.startsWith('00')) value = '+' + value.slice(2);
  if (value.startsWith('+')) value = value.slice(1);
  // أرقام اليمن المحلية: 7xxxxxxxx أو 07xxxxxxxx
  if (value.startsWith('7') && value.length === 9) value = '967' + value;
  if (value.startsWith('0') && value.length === 10) value = '967' + value.slice(1);
  return value;
}

export function buildWhatsAppUrl(phone: string = DEFAULT_WHATSAPP, message: string = ''): string {
  const number = normalizeWhatsApp(phone || DEFAULT_WHATSAPP);
  const encoded = encodeURIComponent(message || WHATSAPP_DEFAULT_MESSAGE);
  return `https://wa.me/${number}?text=${encoded}`;
}

// ---------------------------------------------------------------------------
// طلبات التسعير (Quotes)
// ---------------------------------------------------------------------------

export function getStoredQuotes(): Quote[] {
  const quotes = readJSON<Quote[]>(STORAGE_KEYS.QUOTES, INITIAL_QUOTES);
  if (getRaw(STORAGE_KEYS.QUOTES) == null) writeJSON(STORAGE_KEYS.QUOTES, quotes);
  return quotes;
}

export function saveQuote(data: Omit<Quote, 'id' | 'status' | 'created_at'>): Quote {
  const quotes = getStoredQuotes();
  const newQuote: Quote = {
    id: uniqueId(),
    name: data.name.trim(),
    phone: data.phone.trim(),
    service: data.service.trim(),
    details: data.details.trim(),
    status: 'new',
    created_at: timestamp(),
  };
  writeJSON(STORAGE_KEYS.QUOTES, [newQuote, ...quotes]);
  return newQuote;
}

export function updateQuoteOffer(id: number, offer: string): Quote | null {
  const quotes = getStoredQuotes();
  let updatedQuote: Quote | null = null;
  const updated = quotes.map((q) => {
    if (q.id === id) {
      updatedQuote = { ...q, offer: offer.trim(), status: 'offer_ready' as const };
      return updatedQuote;
    }
    return q;
  });
  writeJSON(STORAGE_KEYS.QUOTES, updated);

  if (updatedQuote) {
    const saved = updatedQuote as Quote;
    addFollowup({
      channel: 'whatsapp',
      note: `عرض جاهز للعميل ${saved.name}: ${offer.trim()}`,
      status: 'pending',
    });
  }
  return updatedQuote;
}

export function markQuoteOfferSent(id: number): void {
  const quotes = getStoredQuotes();
  writeJSON(
    STORAGE_KEYS.QUOTES,
    quotes.map((q) => (q.id === id ? { ...q, status: 'offer_sent' as const } : q))
  );
}

// ---------------------------------------------------------------------------
// العملاء المحتملون (Leads)
// ---------------------------------------------------------------------------

export function getStoredLeads(): Lead[] {
  const leads = readJSON<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
  if (getRaw(STORAGE_KEYS.LEADS) == null) writeJSON(STORAGE_KEYS.LEADS, leads);
  return leads;
}

export function saveLead(leadData: Omit<Lead, 'id' | 'created_at'>): Lead {
  const leads = getStoredLeads();
  const existingIndex = leadData.phone
    ? leads.findIndex(
        (l) => l.phone && normalizeWhatsApp(l.phone) === normalizeWhatsApp(leadData.phone)
      )
    : -1;

  if (existingIndex >= 0) {
    const updatedLead: Lead = { ...leads[existingIndex], ...leadData };
    leads[existingIndex] = updatedLead;
    writeJSON(STORAGE_KEYS.LEADS, leads);
    return updatedLead;
  }

  const newLead: Lead = { ...leadData, id: uniqueId(), created_at: new Date().toISOString() };
  writeJSON(STORAGE_KEYS.LEADS, [newLead, ...leads]);
  return newLead;
}

export function updateLeadStage(id: number, stage: Lead['stage']): void {
  const leads = getStoredLeads();
  writeJSON(
    STORAGE_KEYS.LEADS,
    leads.map((l) => (l.id === id ? { ...l, stage } : l))
  );
}

// ---------------------------------------------------------------------------
// سجل محادثات المساعد الذكي
// ---------------------------------------------------------------------------

export function getStoredInteractions(): AIInteraction[] {
  const items = readJSON<AIInteraction[]>(STORAGE_KEYS.INTERACTIONS, INITIAL_INTERACTIONS);
  if (getRaw(STORAGE_KEYS.INTERACTIONS) == null) writeJSON(STORAGE_KEYS.INTERACTIONS, items);
  return items;
}

export function saveInteraction(message: string, reply: string, lead_score: number): AIInteraction {
  const interactions = getStoredInteractions();
  const newInt: AIInteraction = {
    id: uniqueId(),
    message,
    reply,
    lead_score,
    created_at: timestamp(),
  };
  writeJSON(STORAGE_KEYS.INTERACTIONS, [newInt, ...interactions.slice(0, 99)]);
  return newInt;
}

// ---------------------------------------------------------------------------
// المتابعات (Follow-ups)
// ---------------------------------------------------------------------------

export function getStoredFollowups(): Followup[] {
  const items = readJSON<Followup[]>(STORAGE_KEYS.FOLLOWUPS, INITIAL_FOLLOWUPS);
  if (getRaw(STORAGE_KEYS.FOLLOWUPS) == null) writeJSON(STORAGE_KEYS.FOLLOWUPS, items);
  return items;
}

export function addFollowup(followup: Omit<Followup, 'id' | 'created_at'>): Followup {
  const list = getStoredFollowups();
  const newItem: Followup = { ...followup, id: uniqueId(), created_at: timestamp() };
  writeJSON(STORAGE_KEYS.FOLLOWUPS, [newItem, ...list]);
  return newItem;
}

export function updateFollowupStatus(id: number, status: Followup['status']): void {
  const list = getStoredFollowups();
  writeJSON(
    STORAGE_KEYS.FOLLOWUPS,
    list.map((f) => (f.id === id ? { ...f, status } : f))
  );
}

export function deleteFollowup(id: number): void {
  const list = getStoredFollowups();
  writeJSON(
    STORAGE_KEYS.FOLLOWUPS,
    list.filter((f) => f.id !== id)
  );
}

// ---------------------------------------------------------------------------
// المنتجات (Legacy catalog)
// ---------------------------------------------------------------------------

export function getStoredProducts(): Product[] {
  return readJSON<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
}

// ---------------------------------------------------------------------------
// معرض الأعمال (Portfolio)
// ---------------------------------------------------------------------------

export function getStoredPortfolio(): PortfolioItem[] {
  const items = readJSON<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, INITIAL_PORTFOLIO);
  if (getRaw(STORAGE_KEYS.PORTFOLIO) == null) writeJSON(STORAGE_KEYS.PORTFOLIO, items);
  return items;
}

export function savePortfolioItem(item: PortfolioItem): PortfolioItem {
  const list = getStoredPortfolio();
  const existingIdx = list.findIndex((p) => p.id === item.id);
  const updated = existingIdx >= 0 ? list.map((p) => (p.id === item.id ? item : p)) : [item, ...list];
  writeJSON(STORAGE_KEYS.PORTFOLIO, updated);
  return item;
}

export function deletePortfolioItem(id: string): void {
  const list = getStoredPortfolio();
  writeJSON(
    STORAGE_KEYS.PORTFOLIO,
    list.filter((p) => p.id !== id)
  );
}

export function resetPortfolio(): PortfolioItem[] {
  writeJSON(STORAGE_KEYS.PORTFOLIO, INITIAL_PORTFOLIO);
  return INITIAL_PORTFOLIO;
}

// ---------------------------------------------------------------------------
// المتجر: المنتجات والطلبات
// ---------------------------------------------------------------------------

export function getStoredStoreProducts(): StoreProduct[] {
  const items = readJSON<StoreProduct[]>(STORAGE_KEYS.STORE_PRODUCTS, INITIAL_STORE_PRODUCTS);
  if (getRaw(STORAGE_KEYS.STORE_PRODUCTS) == null) writeJSON(STORAGE_KEYS.STORE_PRODUCTS, items);
  return items;
}

export function saveStoreProduct(product: StoreProduct): StoreProduct {
  const list = getStoredStoreProducts();
  const exists = list.some((p) => p.id === product.id);
  const updated = exists ? list.map((p) => (p.id === product.id ? product : p)) : [product, ...list];
  writeJSON(STORAGE_KEYS.STORE_PRODUCTS, updated);
  return product;
}

export function deleteStoreProduct(id: string): void {
  const list = getStoredStoreProducts();
  writeJSON(
    STORAGE_KEYS.STORE_PRODUCTS,
    list.filter((p) => p.id !== id)
  );
}

export function resetStoreProducts(): StoreProduct[] {
  writeJSON(STORAGE_KEYS.STORE_PRODUCTS, INITIAL_STORE_PRODUCTS);
  return INITIAL_STORE_PRODUCTS;
}

export function getStoredStoreOrders(): StoreOrder[] {
  return readJSON<StoreOrder[]>(STORAGE_KEYS.STORE_ORDERS, []);
}

export function createStoreOrder(
  data: Omit<StoreOrder, 'id' | 'createdAt' | 'whatsappSent'>
): StoreOrder {
  const orders = getStoredStoreOrders();
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}${Math.floor(
    10 + Math.random() * 89
  )}`;

  const newOrder: StoreOrder = {
    ...data,
    id: orderId,
    createdAt: timestamp(),
    whatsappSent: true,
  };

  writeJSON(STORAGE_KEYS.STORE_ORDERS, [newOrder, ...orders]);

  // تسجيل تلقائي في الـ CRM: عميل محتمل + متابعة
  saveLead({
    name: data.customerName,
    company: `طلب متجر: ${orderId}`,
    email: data.customerEmail || '',
    phone: data.customerPhone,
    need: data.items.map((i) => `${i.productName} (x${i.quantity})`).join('، '),
    budget: `${data.totalPrice} ${data.currency}`,
    timeline: 'فوري عبر المتجر',
    decision_role: 'مشتري متجر',
    score: 85,
    stage: 'quote_requested',
  });

  addFollowup({
    channel: 'whatsapp',
    note: `طلب متجر جديد #${orderId} من ${data.customerName} بقيمة ${data.totalPrice} ${data.currency}`,
    status: 'pending',
  });

  return newOrder;
}

export function updateStoreOrderStatus(id: string, status: StoreOrder['status']): void {
  const orders = getStoredStoreOrders();
  writeJSON(
    STORAGE_KEYS.STORE_ORDERS,
    orders.map((o) => (o.id === id ? { ...o, status } : o))
  );
}

export function buildStoreWhatsAppUrl(order: StoreOrder): string {
  const itemsText = order.items
    .map(
      (item, index) =>
        `${index + 1}. *${item.productName}*\n   الكمية: ${item.quantity} | السعر: ${item.price} ${order.currency}`
    )
    .join('\n');

  const message = `*طلب شراء جديد من متجر فيكتوريا لاين سوفت* 🛍️
-----------------------------------
*رقم الطلب:* #${order.id}
*اسم العميل:* ${order.customerName}
*رقم الهاتف:* ${order.customerPhone}
${order.customerEmail ? `*البريد الإلكتروني:* ${order.customerEmail}\n` : ''}*العناصر المطلوبة:*
${itemsText}

*الإجمالي:* ${order.totalPrice} ${order.currency}
${order.notes ? `*ملاحظات إضافية:* ${order.notes}\n` : ''}-----------------------------------
أرجو تأكيد استلام الطلب وتزويدي بخطوات الاستلام والتفعيل. شكراً لكم!`;

  return buildWhatsAppUrl(DEFAULT_WHATSAPP, message);
}

export function buildSingleProductWhatsAppUrl(
  product: StoreProduct,
  customerNotes?: string
): string {
  const message = `*استفسار وطلب شراء منتج من متجر فيكتوريا لاين* 🌟
-----------------------------------
*اسم المنتج:* ${product.name}
*التصنيف:* ${product.categoryLabel}
*السعر:* ${product.price} ${product.currency} (${product.deliveryDays})
${customerNotes ? `*ملاحظاتي:* ${customerNotes}\n` : ''}-----------------------------------
مرحباً، أود إتمام شراء هذا المنتج/التطبيق والحصول على تفاصيل التجهيز والتسليم.`;

  return buildWhatsAppUrl(DEFAULT_WHATSAPP, message);
}

// ---------------------------------------------------------------------------
// النسخ الاحتياطي: تصدير / استيراد بيانات الـ CRM
// ---------------------------------------------------------------------------

export interface CrmBackup {
  version: 1;
  exported_at: string;
  app: string;
  quotes: Quote[];
  leads: Lead[];
  interactions: AIInteraction[];
  followups: Followup[];
  portfolio: PortfolioItem[];
  storeProducts: StoreProduct[];
  storeOrders: StoreOrder[];
}

export function buildCrmBackup(): CrmBackup {
  return {
    version: 1,
    exported_at: new Date().toISOString(),
    app: SITE.name,
    quotes: getStoredQuotes(),
    leads: getStoredLeads(),
    interactions: getStoredInteractions(),
    followups: getStoredFollowups(),
    portfolio: getStoredPortfolio(),
    storeProducts: getStoredStoreProducts(),
    storeOrders: getStoredStoreOrders(),
  };
}

/** استيراد نسخة احتياطية مع تحقق أساسي من الشكل، ويعيد عدد السجلات المستوردة. */
export function restoreCrmBackup(raw: string): { imported: Record<string, number> } | null {
  let parsed: Partial<CrmBackup>;
  try {
    parsed = JSON.parse(raw) as Partial<CrmBackup>;
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;

  const imported: Record<string, number> = {};
  const collections: Array<[keyof typeof STORAGE_KEYS, keyof CrmBackup]> = [
    ['QUOTES', 'quotes'],
    ['LEADS', 'leads'],
    ['INTERACTIONS', 'interactions'],
    ['FOLLOWUPS', 'followups'],
    ['PORTFOLIO', 'portfolio'],
    ['STORE_PRODUCTS', 'storeProducts'],
    ['STORE_ORDERS', 'storeOrders'],
  ];

  for (const [storageKey, field] of collections) {
    const value = parsed[field];
    if (Array.isArray(value)) {
      writeJSON(STORAGE_KEYS[storageKey], value);
      imported[field] = value.length;
    }
  }

  return Object.keys(imported).length ? { imported } : null;
}

/** تنزيل ملف JSON من المتصفح. */
export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, filename);
}

/** تحويل سجلات إلى CSV (مع BOM لدعم العربية في Excel). */
export function toCsv<T extends object>(
  rows: T[],
  columns: Array<{ key: keyof T & string; label: string }>
): string {
  const escape = (value: unknown): string => {
    const text = value == null ? '' : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const header = columns.map((c) => escape(c.label)).join(',');
  const body = rows.map((row) => columns.map((c) => escape(row[c.key])).join(','));
  return [header, ...body].join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** مسح بيانات الـ CRM المحلية بالكامل (يُستخدم بحذر من مركز الإدارة). */
export function clearCrmData(): void {
  Object.values(STORAGE_KEYS).forEach(removeRaw);
}
