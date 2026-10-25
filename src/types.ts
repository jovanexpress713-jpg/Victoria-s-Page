export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  status: 'published' | 'draft';
}

export interface Quote {
  id: number;
  name: string;
  phone: string;
  service: string;
  details: string;
  status: 'new' | 'offer_ready' | 'offer_sent' | 'completed';
  offer?: string;
  created_at: string;
}

export type LeadStage =
  | 'nurture'
  | 'warm'
  | 'hot'
  | 'quote_requested'
  | 'awaiting_offer'
  | 'offer_sent'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  need: string;
  budget: string;
  timeline: string;
  decision_role: string;
  score: number;
  stage: LeadStage;
  created_at: string;
}

export interface AIInteraction {
  id: number;
  message: string;
  reply: string;
  lead_score: number;
  created_at: string;
}

export interface Followup {
  id: number;
  lead_id?: number | null;
  channel: 'whatsapp' | 'email' | 'phone';
  note: string;
  due_at?: string;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface InsightSection {
  heading: string;
  paragraphs: string[];
}

export interface InsightArticle {
  slug: string;
  title: string;
  category: string;
  tag: string;
  date: string;
  read_time: string;
  summary: string;
  image: string;
  source_title: string;
  source_url: string;
  sections: InsightSection[];
  takeaways: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'web' | 'commerce' | 'system' | 'brand' | 'app' | 'ai';
  categoryLabel: string;
  imageUrl: string;
  client: string;
  year: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string[];
  tags: string[];
  demoUrl?: string;
  featured?: boolean;
}

export type StoreCategory = 'app' | 'design' | 'product';

export interface StoreProduct {
  id: string;
  name: string;
  subtitle: string;
  category: StoreCategory;
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  currency: string;
  deliveryDays: string;
  badge?: string;
  imageUrl: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
  deliverables: string[];
  demoUrl?: string;
  rating?: number;
  salesCount?: number;
  status: 'available' | 'sold_out' | 'custom_only';
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
  selectedLicense?: string;
  customNotes?: string;
}

export interface StoreOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  selectedLicense?: string;
}

export interface StoreOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: StoreOrderItem[];
  totalPrice: number;
  currency: string;
  notes?: string;
  status: 'new' | 'contacted' | 'processing' | 'completed' | 'cancelled';
  whatsappSent: boolean;
  createdAt: string;
}

