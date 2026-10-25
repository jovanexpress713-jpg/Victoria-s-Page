import React from 'react';
import { describe, expect, it, beforeEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ContactPage } from './pages/ContactPage';
import { getStoredQuotes } from './services/storage';

/**
 * اختبارات نموذج "طلب مشروع" في صفحة التواصل:
 * التحقق من رقم الهاتف، الحفظ الصحيح، وحقل الفخ (Honeypot) المضاد للبوتات.
 * ملاحظة: storage.ts يحتفظ بمرآة ذاكرة (memoryFallback) بجانب localStorage،
 * لذلك نعتمد أسماء فريدة لكل اختبار بدلاً من مسح التخزين فقط.
 */

function fillQuoteForm(name: string, phone: string): void {
  fireEvent.change(screen.getByPlaceholderText('اسمك أو اسم المسؤول عن المشروع'), {
    target: { value: name },
  });
  fireEvent.change(screen.getByPlaceholderText('مثال: 967771119726'), {
    target: { value: phone },
  });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'website' } });
  fireEvent.click(screen.getByRole('checkbox'));
}

function submitQuoteForm(): void {
  const button = screen.getByRole('button', { name: /إرسال طلب المشروع/ });
  fireEvent.submit(button.closest('form')!);
}

describe('ContactPage — نموذج طلب مشروع', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('يرفض رقم هاتف قصيراً ويعرض سبب الرفض بدون حفظ', () => {
    render(<ContactPage />);
    fillQuoteForm('عميل هاتف خاطئ', '123');
    submitQuoteForm();

    expect(screen.getByRole('alert').textContent).toContain('رقم هاتف');
    expect(getStoredQuotes().some((q) => q.name === 'عميل هاتف خاطئ')).toBe(false);
  });

  it('يحفظ الطلب ويعرض رسالة النجاح عند بيانات صحيحة', () => {
    render(<ContactPage />);
    fillQuoteForm('عميل طلب ناجح', '967771234567');
    submitQuoteForm();

    expect(screen.getByText('وصل طلبك إلى النظام بنجاح!')).toBeTruthy();
    const saved = getStoredQuotes().filter((q) => q.name === 'عميل طلب ناجح');
    expect(saved).toHaveLength(1);
    expect(saved[0].phone).toBe('967771234567');
    expect(saved[0].status).toBe('new');
  });

  it('حقل الفخ: تعبئته تُظهر نجاحاً وهمياً للبوت بدون حفظ الطلب', () => {
    const { container } = render(<ContactPage />);
    fillQuoteForm('عميل حقل الفخ', '967771234567');

    const honeypot = container.querySelector('input[tabindex="-1"]') as HTMLInputElement;
    expect(honeypot).toBeTruthy();
    fireEvent.change(honeypot, { target: { value: 'spam-link' } });
    submitQuoteForm();

    expect(screen.getByText('وصل طلبك إلى النظام بنجاح!')).toBeTruthy();
    expect(getStoredQuotes().some((q) => q.name === 'عميل حقل الفخ')).toBe(false);
  });
});
