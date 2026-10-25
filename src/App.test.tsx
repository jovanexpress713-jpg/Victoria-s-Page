import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

const goto = (path: string) => {
  window.history.pushState({}, '', path);
};

describe('تطبيق Victoria Line Soft', () => {
  beforeEach(() => {
    localStorage.clear();
    goto('/');
  });

  it('يعرض الهيكل الرئيسي والتنقل بالعربية', async () => {
    render(<App />);
    expect(await screen.findByText('VICTORIA')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'التنقل الرئيسي' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('ينتقل إلى صفحة تواصل عبر القائمة', async () => {
    render(<App />);
    await screen.findByText('VICTORIA');
    fireEvent.click(screen.getAllByText('ابدأ مشروعك')[0]);
    expect(await screen.findByText('خطة واضحة.')).toBeInTheDocument();
  });

  it('يعرض صفحة 404 للمسارات غير الموجودة', async () => {
    goto('/صفحة-مجهولة');
    render(<App />);
    expect(await screen.findByText('يبدو أن هذا الرابط غير موجود')).toBeInTheDocument();
  });

  it('يحمي مسار الإدارة ببوابة دخول', async () => {
    goto('/admin');
    render(<App />);
    expect(await screen.findByText('دخول الإدارة')).toBeInTheDocument();
    expect(screen.getByLabelText('كلمة مرور الإدارة')).toBeInTheDocument();
  });

  it('يعرض تفاصيل مقال عبر المسار الديناميكي', async () => {
    goto('/insights/ai-agents-from-chat-to-workflows');
    render(<App />);
    await waitFor(() => {
      expect(document.title).not.toBe('');
    });
    expect(await screen.findAllByText(/الذكاء الاصطناعي/).then((m) => m.length)).toBeGreaterThan(0);
  });
});
