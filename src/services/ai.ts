import { Lead, LeadStage } from '../types';
import { saveLead, saveInteraction } from './storage';

export interface AIResponse {
  status: 'AI_LIVE' | 'AI_CONFIGURED' | 'AI_UNAVAILABLE' | 'AI_DEGRADED';
  intent: string;
  qualification: string;
  reply: string;
  next_step: string;
  lead_score: number;
  follow_up_question: string;
  lead: Partial<Lead>;
}

export function scoreLead(data: Partial<Lead>): number {
  let score = 0;
  if (data.company && data.company.trim()) score += 20;
  if (data.email && data.email.trim()) score += 15;
  if (data.phone && data.phone.trim()) score += 10;
  if (data.budget && data.budget.trim()) score += 15;
  if (data.timeline && data.timeline.trim()) score += 15;
  if (data.need && data.need.trim()) score += 15;
  if (data.decision_role && data.decision_role.trim()) score += 10;
  return Math.min(score, 100);
}

export function stageForScore(score: number): LeadStage {
  if (score >= 75) return 'hot';
  if (score >= 45) return 'warm';
  return 'nurture';
}

export function qualifyLeadMessage(message: string, context?: Record<string, unknown>): {
  stage: LeadStage;
  score: number;
  needs_quote: boolean;
  owner_action: string;
} {
  const text = `${message} ${JSON.stringify(context || {})}`.toLowerCase();
  // أنماط بحدود كلمات (Unicode) حتى لا تُطابَق كلمات قصيرة داخل كلمات أخرى
  // مثل «كم» داخل «خدماتكم» — \b التقليدي لا يفهم الحروف العربية
  const standalone = (word: string) => new RegExp(`(^|[^\\p{L}])${word}([^\\p{L}]|$)`, 'u');
  const commercialPatterns: RegExp[] = [
    /سعر/u,
    /ميزانية/u,
    /شراء/u,
    /شركة/u,
    /مشروع/u,
    /تكلفة/u,
    standalone('كم'),
    standalone('بكم'),
    /quote/u,
    /price/u,
    /budget/u,
  ];
  const commercial = commercialPatterns.some((pattern) => pattern.test(text));

  const urgent = [
    'اليوم',
    'عاجل',
    'هذا الأسبوع',
    'مستعجل',
    'ضروري',
    'urgent',
    'this week',
  ].some((x) => text.includes(x));

  if (urgent && commercial) {
    return { stage: 'hot', score: 90, needs_quote: true, owner_action: 'notify_owner_now' };
  }
  if (commercial) {
    return { stage: 'warm', score: 65, needs_quote: true, owner_action: 'prepare_quote' };
  }
  return { stage: 'nurture', score: 30, needs_quote: false, owner_action: 'continue_discovery' };
}

// Client-side AI Discovery & Conversation Engine
export async function processAIChat(
  message: string,
  context: {
    name?: string;
    company?: string;
    phone?: string;
    email?: string;
    conversation?: Array<{ role: string; content: string }>;
  } = {}
): Promise<AIResponse> {
  const cleanMsg = message.trim();
  const lowerMsg = cleanMsg.toLowerCase();

  // Extract phone numbers or emails if typed in message
  const phoneMatch = cleanMsg.match(/(?:\+?967|0)?7[0-9]{8}/) || cleanMsg.match(/\+?[0-9]{10,14}/);
  const emailMatch = cleanMsg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

  const phone = context.phone || (phoneMatch ? phoneMatch[0] : '');
  const email = context.email || (emailMatch ? emailMatch[0] : '');
  const name = context.name || '';
  const company = context.company || '';

  // Classify intent & service
  let detectedNeed = '';
  let intent = 'discovery';
  let qualification = 'needs_discovery';
  let reply = '';
  let nextStep = 'discovery';
  let followUpQuestion = '';

  if (
    lowerMsg.includes('متجر') ||
    lowerMsg.includes('بيع') ||
    lowerMsg.includes('منتجات') ||
    lowerMsg.includes('سلة') ||
    lowerMsg.includes('تجارة')
  ) {
    detectedNeed = 'متجر إلكتروني';
    intent = 'store_inquiry';
    qualification = 'commercial_intent';
    reply =
      'حيّاك الله! المتاجر الإلكترونية حل ممتاز لتوسيع مبيعاتك وتسهيل طلبات الزبائن. نقدر نجهّز لك كتالوج منظم وسلة شراء مع ربط واتساب أو بوابات دفع حسب احتياجك في اليمن أو الخليج. كم عدد المنتجات التقريبي وهل طرق الدفع والتوصيل محددة عندك؟';
    followUpQuestion = 'كم عدد المنتجات التقريبي وهل طرق الدفع والتوصيل محددة عندك؟';
    nextStep = 'طلب تسعير متجر';
  } else if (
    lowerMsg.includes('موقع') ||
    lowerMsg.includes('منصة') ||
    lowerMsg.includes('ويب') ||
    lowerMsg.includes('شركة') ||
    lowerMsg.includes('صفحة')
  ) {
    detectedNeed = 'موقع أو منصة رقمية';
    intent = 'website_inquiry';
    qualification = 'commercial_intent';
    reply =
      'أهلاً بك! الموقع التعريفي أو المنصة للشركة يعطي انطباع ثقة واحترافية عالي جداً عند العملاء. نصمم مواقع سريعة ومتجاوبة تماماً مع الجوال. ما هي أهم خدمة أو فكرة تحب تركز عليها في الواجهة الرئيسية؟';
    followUpQuestion = 'ما هي أهم خدمة أو فكرة تحب تركز عليها في الواجهة الرئيسية؟';
    nextStep = 'إعداد مسودة نطاق الموقع';
  } else if (
    lowerMsg.includes('نظام') ||
    lowerMsg.includes('إدارة') ||
    lowerMsg.includes('حسابات') ||
    lowerMsg.includes('فواتير') ||
    lowerMsg.includes('مخزون') ||
    lowerMsg.includes('موظفين')
  ) {
    detectedNeed = 'نظام لإدارة العمل';
    intent = 'system_inquiry';
    qualification = 'high_value_lead';
    reply =
      'مرحباً بك! بناء نظام إدارة مخصص لطبيعة عملك يوفر ساعات عمل يومية ويمنع ضياع البيانات بين الرسائل والملفات. نقدر نربط لك العملاء، الفواتير، وحركات المبيعات في لوحة واحدة. ما هو أكبر تحدي يواجهكم حالياً في العمليات اليومية؟';
    followUpQuestion = 'ما هو أكبر تحدي يواجهكم حالياً في العمليات اليومية؟';
    nextStep = 'جلسة حصر المتطلبات';
  } else if (
    lowerMsg.includes('تطبيق') ||
    lowerMsg.includes('جوال') ||
    lowerMsg.includes('أندرويد') ||
    lowerMsg.includes('ايفون') ||
    lowerMsg.includes('app')
  ) {
    detectedNeed = 'تطبيق جوال';
    intent = 'app_inquiry';
    qualification = 'commercial_intent';
    reply =
      'أهلاً ومرحباً! تطبيقات الجوال نبدأ فيها دائماً بتصميم نموذج واجهات عملي يوضح رحلة المستخدم بدقة قبل البرمجة لتقليل التكاليف وضمان النجاح. هل الفكرة موجهة للمستهلكين أم لفريق العمل والمندوبين؟';
    followUpQuestion = 'هل الفكرة موجهة للمستهلكين أم لفريق العمل والمندوبين؟';
    nextStep = 'تصميم نموذج الواجهات الأولية';
  } else if (
    lowerMsg.includes('هوية') ||
    lowerMsg.includes('شعار') ||
    lowerMsg.includes('لوقو') ||
    lowerMsg.includes('تصميم') ||
    lowerMsg.includes('براند')
  ) {
    detectedNeed = 'هوية بصرية وتصميم';
    intent = 'branding_inquiry';
    qualification = 'creative_intent';
    reply =
      'حيّاك الله! الهوية البصرية ليست مجرد رسمة شعار، بل نظام متكامل للألوان والخطوط والتطبيقات يعكس قيمة عملك ويبني انطباعاً يدوم. هل هو مشروع جديد كلياً أم إعادة تجديد لهوية قائمة؟';
    followUpQuestion = 'هل هو مشروع جديد كلياً أم إعادة تجديد لهوية قائمة؟';
    nextStep = 'استعراض اتجاهات التصميم';
  } else if (
    lowerMsg.includes('ذكاء') ||
    lowerMsg.includes('أتمتة') ||
    lowerMsg.includes('بوت') ||
    lowerMsg.includes('ai')
  ) {
    detectedNeed = 'ذكاء اصطناعي وأتمتة';
    intent = 'ai_inquiry';
    qualification = 'innovation_intent';
    reply =
      'أهلاً بك! في Victoria Line Soft نؤمن أن الذكاء الاصطناعي يجب أن يخدم هدفاً تشغيلياً أو تسويقياً واضحاً (مثل الرد الفوري، فرز العملاء، أو تلخيص البيانات) مع إشراف بشري محكم. ما هي المهمة المتكررة التي ترغب في أتمتتها؟';
    followUpQuestion = 'ما هي المهمة المتكررة التي ترغب في أتمتتها؟';
    nextStep = 'دراسة قابلية الأتمتة';
  } else if (
    lowerMsg.includes('سعر') ||
    lowerMsg.includes('تكلفة') ||
    lowerMsg.includes('بكم') ||
    lowerMsg.includes('كم يكلف')
  ) {
    intent = 'pricing_inquiry';
    qualification = 'commercial_intent';
    reply =
      'الأسعار في Victoria Line Soft تعتمد على نطاق العمل الفعلي والميزات المطلوبة بدقة، ولا نضع أرقاماً عشوائية أو تقديرات غير دقيقة. يسعدنا ترتيب عرض مخصص بعد معرفة نوع الخدمة التي تبحث عنها. هل تود أن نجهز لك عرض سعر؟';
    followUpQuestion = 'ما هي الخدمة أو الفكرة التي تريد تسعيرها؟';
    nextStep = 'طلب عرض سعر رسمي';
  } else {
    intent = 'discovery';
    qualification = 'needs_discovery';
    reply =
      'حيّاك الله في Victoria Line Soft! يسعدني مساعدتك في توضيح فكرة مشروعك وتحويلها إلى خطة عمل رقمية واضحة. احكِ لي أكثر: ما هو مجال عملك أو المشكلة التي تريد حلها؟';
    followUpQuestion = 'ما هو مجال عملك أو المشكلة التي تريد حلها؟';
    nextStep = 'اكتشاف الاحتياج';
  }

  // Calculate score
  const leadData: Partial<Lead> = {
    name,
    company,
    phone,
    email,
    need: detectedNeed || cleanMsg.slice(0, 80),
    budget: lowerMsg.includes('ميزانية') ? 'قيد المناقشة' : '',
    timeline: lowerMsg.includes('عاجل') ? 'عاجل' : '',
    decision_role: name ? 'مسؤول الطلب' : '',
  };

  const calculatedScore = scoreLead(leadData);
  const stage = stageForScore(calculatedScore);
  const finalScore = Math.max(calculatedScore, 25);

  // Save interaction to storage
  saveInteraction(cleanMsg, reply, finalScore);

  // If phone or email or high intent, record as lead
  if (phone || email || company || finalScore >= 45) {
    saveLead({
      name: name || 'زائر مستفسر',
      company: company || '',
      email: email || '',
      phone: phone || '',
      need: detectedNeed || cleanMsg.slice(0, 100),
      budget: leadData.budget || '',
      timeline: leadData.timeline || '',
      decision_role: leadData.decision_role || '',
      score: finalScore,
      stage,
    });
  }

  return {
    status: 'AI_LIVE',
    intent,
    qualification,
    reply,
    next_step: nextStep,
    lead_score: finalScore,
    follow_up_question: followUpQuestion,
    lead: leadData,
  };
}
