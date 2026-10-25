import { describe, it, expect, beforeEach } from 'vitest';
import { scoreLead, stageForScore, qualifyLeadMessage, processAIChat } from '../ai';
import { getStoredInteractions, getStoredLeads } from '../storage';

describe('تقييم العملاء المحتملين', () => {
  it('يحسب درجة كاملة عند اكتمال البيانات', () => {
    const score = scoreLead({
      company: 'شركة',
      email: 'a@b.com',
      phone: '771119726',
      budget: '5000',
      timeline: 'شهر',
      need: 'متجر',
      decision_role: 'مدير',
    });
    expect(score).toBe(100);
  });

  it('يصفر عند غياب البيانات ويحدد المراحل بالحدود', () => {
    expect(scoreLead({})).toBe(0);
    expect(stageForScore(80)).toBe('hot');
    expect(stageForScore(74)).toBe('warm');
    expect(stageForScore(45)).toBe('warm');
    expect(stageForScore(44)).toBe('nurture');
  });
});

describe('تأهيل الرسائل', () => {
  it('يرفع الأولوية للعجلة التجارية', () => {
    const result = qualifyLeadMessage('نحتاج عرض سعر اليوم نفسه لمشروع الشركة');
    expect(result.stage).toBe('hot');
    expect(result.needs_quote).toBe(true);
    expect(result.owner_action).toBe('notify_owner_now');
  });

  it('يبقي الاستكشاف غير التجاري أولوية منخفضة', () => {
    const result = qualifyLeadMessage('ما هي خدماتكم بشكل عام؟');
    expect(result.stage).toBe('nurture');
    expect(result.needs_quote).toBe(false);
  });
});

describe('محرك المحادثة', () => {
  beforeEach(() => localStorage.clear());

  it('يصنف نية المتجر ويقترح متابعة', async () => {
    const res = await processAIChat('أريد متجراً إلكترونياً لبيع العطور');
    expect(res.intent).toBe('store_inquiry');
    expect(res.reply).toContain('المتاجر الإلكترونية');
    expect(res.follow_up_question.length).toBeGreaterThan(0);
  });

  it('يصنف استفسار السعر بشكل مستقل', async () => {
    const res = await processAIChat('بكم تكلفة تنفيذ فكرة مشابهة؟');
    expect(res.intent).toBe('pricing_inquiry');
  });

  it('يسجل المحادثة في سجل التدقيق', async () => {
    await processAIChat('لدي فكرة تطبيق جوال');
    const log = getStoredInteractions();
    expect(log[0].message).toBe('لدي فكرة تطبيق جوال');
    expect(log[0].lead_score).toBeGreaterThanOrEqual(25);
  });

  it('يستخرج رقم الهاتف من نص الرسالة ويسجل عميلاً', async () => {
    await processAIChat('أريد نظام فواتير، تواصلي: 771119726');
    const leads = getStoredLeads();
    expect(leads.some((l) => l.phone.includes('771119726'))).toBe(true);
  });
});
