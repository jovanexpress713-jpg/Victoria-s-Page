import { Quote, Lead, AIInteraction, Followup, Product, PortfolioItem, StoreProduct, StoreOrder } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_QUOTES,
  INITIAL_LEADS,
  INITIAL_INTERACTIONS,
  INITIAL_FOLLOWUPS,
} from '../data/initialData';
import { INITIAL_PORTFOLIO } from '../data/portfolioData';
import { INITIAL_STORE_PRODUCTS } from '../data/storeData';

const STORAGE_KEYS = {
  QUOTES: 'vls_quotes_v2',
  LEADS: 'vls_leads_v2',
  INTERACTIONS: 'vls_interactions_v2',
  FOLLOWUPS: 'vls_followups_v2',
  PRODUCTS: 'vls_products_v2',
  PORTFOLIO: 'vls_portfolio_v2',
  STORE_PRODUCTS: 'vls_store_products_v2',
  STORE_ORDERS: 'vls_store_orders_v2',
  ADMIN_AUTH: 'vls_admin_session_v2',
};

export const DEFAULT_WHATSAPP = '967771119726';

export function normalizeWhatsApp(phone: string): string {
  let value = phone.replace(/[^\d+]/g, '');
  if (value.startsWith('00')) value = '+' + value.slice(2);
  if (value.startsWith('7') && value.length === 9) value = '+967' + value;
  if (value.startsWith('0') && value.length === 10) value = '+967' + value.slice(1);
  return value.replace('+', '');
}

export function buildWhatsAppUrl(phone: string = DEFAULT_WHATSAPP, message: string = ''): string {
  const number = normalizeWhatsApp(phone || DEFAULT_WHATSAPP);
  const encoded = encodeURIComponent(message || 'مرحباً، أريد الاستفسار عن خدمات Victoria Line Soft.');
  return `https://wa.me/${number}?text=${encoded}`;
}

export function getStoredQuotes(): Quote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(INITIAL_QUOTES));
      return INITIAL_QUOTES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_QUOTES;
  }
}

export function saveQuote(data: Omit<Quote, 'id' | 'status' | 'created_at'>): Quote {
  const quotes = getStoredQuotes();
  const newQuote: Quote = {
    id: Date.now(),
    name: data.name.trim(),
    phone: data.phone.trim(),
    service: data.service.trim(),
    details: data.details.trim(),
    status: 'new',
    created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
  const updated = [newQuote, ...quotes];
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(updated));
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
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(updated));

  if (updatedQuote) {
    addFollowup({
      channel: 'whatsapp',
      note: `عرض جاهز للعميل ${(updatedQuote as Quote).name}: ${offer.trim()}`,
      status: 'pending',
    });
  }
  return updatedQuote;
}

export function markQuoteOfferSent(id: number): void {
  const quotes = getStoredQuotes();
  const updated = quotes.map((q) => (q.id === id ? { ...q, status: 'offer_sent' as const } : q));
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(updated));
}

export function getStoredLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LEADS;
  }
}

export function saveLead(leadData: Omit<Lead, 'id' | 'created_at'>): Lead {
  const leads = getStoredLeads();
  const existingIndex = leadData.phone
    ? leads.findIndex((l) => l.phone && normalizeWhatsApp(l.phone) === normalizeWhatsApp(leadData.phone))
    : -1;

  if (existingIndex >= 0) {
    const updatedLead: Lead = {
      ...leads[existingIndex],
      ...leadData,
    };
    leads[existingIndex] = updatedLead;
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    return updatedLead;
  } else {
    const newLead: Lead = {
      ...leadData,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    const updated = [newLead, ...leads];
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
    return newLead;
  }
}

export function updateLeadStage(id: number, stage: Lead['stage']): void {
  const leads = getStoredLeads();
  const updated = leads.map((l) => (l.id === id ? { ...l, stage } : l));
  localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
}

export function getStoredInteractions(): AIInteraction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(INITIAL_INTERACTIONS));
      return INITIAL_INTERACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_INTERACTIONS;
  }
}

export function saveInteraction(message: string, reply: string, lead_score: number): AIInteraction {
  const interactions = getStoredInteractions();
  const newInt: AIInteraction = {
    id: Date.now(),
    message,
    reply,
    lead_score,
    created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
  const updated = [newInt, ...interactions.slice(0, 99)];
  localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(updated));
  return newInt;
}

export function getStoredFollowups(): Followup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOWUPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(INITIAL_FOLLOWUPS));
      return INITIAL_FOLLOWUPS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FOLLOWUPS;
  }
}

export function addFollowup(followup: Omit<Followup, 'id' | 'created_at'>): Followup {
  const list = getStoredFollowups();
  const newItem: Followup = {
    ...followup,
    id: Date.now(),
    created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
  localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify([newItem, ...list]));
  return newItem;
}

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function isAdminAuthenticated(): boolean {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
}

export function adminLogin(password: string): boolean {
  // Supports demo password 'victoria2026' or 'admin123'
  const valid = password.trim() === 'victoria2026' || password.trim() === 'admin123';
  if (valid) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
  }
  return valid;
}

export function adminLogout(): void {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
}

// ==========================================
// Portfolio Showcase CRUD
// ==========================================

export function getStoredPortfolio(): PortfolioItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(INITIAL_PORTFOLIO));
      return INITIAL_PORTFOLIO;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PORTFOLIO;
  }
}

export function savePortfolioItem(item: PortfolioItem): PortfolioItem {
  const list = getStoredPortfolio();
  const existingIdx = list.findIndex((p) => p.id === item.id);
  let updated: PortfolioItem[];
  if (existingIdx >= 0) {
    updated = [...list];
    updated[existingIdx] = item;
  } else {
    updated = [item, ...list];
  }
  localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(updated));
  return item;
}

export function deletePortfolioItem(id: string): void {
  const list = getStoredPortfolio();
  const filtered = list.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(filtered));
}

export function resetPortfolio(): PortfolioItem[] {
  localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(INITIAL_PORTFOLIO));
  return INITIAL_PORTFOLIO;
}

// ==========================================
// Store & Products CRUD
// ==========================================

export function getStoredStoreProducts(): StoreProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORE_PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STORE_PRODUCTS, JSON.stringify(INITIAL_STORE_PRODUCTS));
      return INITIAL_STORE_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STORE_PRODUCTS;
  }
}

export function saveStoreProduct(product: StoreProduct): StoreProduct {
  const list = getStoredStoreProducts();
  const existingIdx = list.findIndex((p) => p.id === product.id);
  let updated: StoreProduct[];
  if (existingIdx >= 0) {
    updated = [...list];
    updated[existingIdx] = product;
  } else {
    updated = [product, ...list];
  }
  localStorage.setItem(STORAGE_KEYS.STORE_PRODUCTS, JSON.stringify(updated));
  return product;
}

export function deleteStoreProduct(id: string): void {
  const list = getStoredStoreProducts();
  const filtered = list.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.STORE_PRODUCTS, JSON.stringify(filtered));
}

export function resetStoreProducts(): StoreProduct[] {
  localStorage.setItem(STORAGE_KEYS.STORE_PRODUCTS, JSON.stringify(INITIAL_STORE_PRODUCTS));
  return INITIAL_STORE_PRODUCTS;
}

// ==========================================
// Store Orders & Checkout
// ==========================================

export function getStoredStoreOrders(): StoreOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORE_ORDERS);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function createStoreOrder(
  data: Omit<StoreOrder, 'id' | 'createdAt' | 'whatsappSent'>
): StoreOrder {
  const orders = getStoredStoreOrders();
  const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

  const newOrder: StoreOrder = {
    ...data,
    id: orderId,
    createdAt: now,
    whatsappSent: true,
  };

  localStorage.setItem(STORAGE_KEYS.STORE_ORDERS, JSON.stringify([newOrder, ...orders]));

  // Auto-record as lead/followup in CRM
  saveLead({
    name: data.customerName,
    company: 'طلب متجر: ' + newOrder.id,
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
  const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
  localStorage.setItem(STORAGE_KEYS.STORE_ORDERS, JSON.stringify(updated));
}

export function buildStoreWhatsAppUrl(order: StoreOrder): string {
  const itemsText = order.items
    .map((item, index) => `${index + 1}. *${item.productName}*\n   الكمية: ${item.quantity} | السعر: ${item.price} ${order.currency}`)
    .join('\n');

  const message = `*طلب شراء جديد من متجر فيكتوريا لاين سوفت* 🛍️
-----------------------------------
*رقم الطلب:* #${order.id}
*اسم العميل:* ${order.customerName}
*رقم الهاتف:* ${order.customerPhone}
${order.customerEmail ? `*البريد الإلكتروني:* ${order.customerEmail}\n` : ''}
*العناصر المطلوبة:*
${itemsText}

*الإجمالي:* ${order.totalPrice} ${order.currency}
${order.notes ? `*ملاحظات إضافية:* ${order.notes}\n` : ''}-----------------------------------
أرجو تأكيد استلام الطلب وتزويدي بخطوات الاستلام والتفعيل. شكراً لكم!`;

  return buildWhatsAppUrl(DEFAULT_WHATSAPP, message);
}

export function buildSingleProductWhatsAppUrl(product: StoreProduct, customerNotes?: string): string {
  const message = `*استفسار وطلب شراء منتج من متجر فيكتوريا لاين* 🌟
-----------------------------------
*اسم المنتج:* ${product.name}
*التصنيف:* ${product.categoryLabel}
*السعر:* ${product.price} ${product.currency} (${product.deliveryDays})
${customerNotes ? `*ملاحظاتي:* ${customerNotes}\n` : ''}-----------------------------------
مرحباً، أود إتمام شراء هذا المنتج/التطبيق والحصول على تفاصيل التجهيز والتسليم.`;

  return buildWhatsAppUrl(DEFAULT_WHATSAPP, message);
}

