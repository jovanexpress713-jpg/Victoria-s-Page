import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { WELCOME_SEEN_KEY } from './services/uiEvents';

describe('شاشة الترحيب', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('تظهر للزائر لأول مرة وتوجّهه', async () => {
    render(<App />);
    expect(await screen.findByText('أهلاً بك — خلّنا نوصلك لأسرع طريق')).toBeInTheDocument();
    expect(screen.getByText('أريد البدء بمشروع')).toBeInTheDocument();
    expect(screen.getByText('أبحث عن حل جاهز')).toBeInTheDocument();
  });

  it('تُغلق بالتخطي وتُحفظ المشاهدة فلا تتكرر', async () => {
    const first = render(<App />);
    fireEvent.click(await screen.findByText('تخطَّ الآن — أعرف طريقي'));
    await waitFor(() =>
      expect(screen.queryByText('أهلاً بك — خلّنا نوصلك لأسرع طريق')).not.toBeInTheDocument()
    );
    expect(localStorage.getItem(WELCOME_SEEN_KEY)).toBe('1');
    first.unmount();

    render(<App />);
    await screen.findByText('VICTORIA');
    expect(screen.queryByText('أهلاً بك — خلّنا نوصلك لأسرع طريق')).not.toBeInTheDocument();
  });

  it('توجّه الزائر إلى المتجر عند اختيار حل جاهز', async () => {
    render(<App />);
    fireEvent.click(await screen.findByText('أبحث عن حل جاهز'));
    expect(await screen.findByText(/منتجات رقمية جاهزة|كتالوج|الأكثر مبيعاً/)).toBeInTheDocument();
  });
});

describe('الجولة الإرشادية', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(WELCOME_SEEN_KEY, '1');
    window.history.pushState({}, '', '/');
  });

  it('تبدأ بالخطوة الأولى وتتقدم وتُغلق', async () => {
    render(<App />);
    await screen.findByText('VICTORIA');

    fireEvent.click(screen.getByText('الجولة الإرشادية'));

    expect(await screen.findByText('وجّه مشروعك في ثلاث خطوات')).toBeInTheDocument();
    fireEvent.click(screen.getByText('التالي'));
    expect(await screen.findByText('متجر الحلول الجاهزة')).toBeInTheDocument();
    fireEvent.click(screen.getByText('تخطِّ الجولة'));
    await waitFor(() =>
      expect(screen.queryByText('متجر الحلول الجاهزة')).not.toBeInTheDocument()
    );
  });
});

describe('صفحات الاكتمال', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(WELCOME_SEEN_KEY, '1');
  });

  it('يعرض صفحة من نحن', async () => {
    window.history.pushState({}, '', '/about');
    render(<App />);
    expect(await screen.findByText('يبني أدوات تنفع الناس.')).toBeInTheDocument();
  });

  it('يعرض سياسة الخصوصية مع جدول البيانات', async () => {
    window.history.pushState({}, '', '/privacy');
    render(<App />);
    expect(await screen.findByText('خصوصيتك جزء من جودة المنتج')).toBeInTheDocument();
    expect(screen.getByText('vls_quotes_v2')).toBeInTheDocument();
  });
});
