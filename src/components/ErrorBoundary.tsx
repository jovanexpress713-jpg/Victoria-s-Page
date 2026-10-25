import React from 'react';
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';
import { buildWhatsAppUrl } from '../services/storage';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * حاجز أخطاء عام: يمنع انهيار الصفحة بالكامل عند خطأ غير متوقع
 * ويعرض رسالة عربية واضحة مع خيارات الاستعادة.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error?.message || 'خطأ غير متوقع' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('خطأ غير معالج في الواجهة:', error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        dir="rtl"
        className="min-h-[70vh] flex items-center justify-center px-4 bg-[var(--vls-paper)] text-[var(--vls-ink)]"
      >
        <div className="max-w-md w-full rounded-3xl border border-[var(--vls-line)] bg-[var(--vls-panel)] p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#f3a5d5]/15 text-[#f3a5d5] flex items-center justify-center">
            <AlertTriangle size={26} />
          </div>
          <h1 className="text-xl font-black">حدث خطأ غير متوقع</h1>
          <p className="text-xs text-[var(--vls-ink-muted)] leading-relaxed">
            نعتذر عن هذا الخلل الطارئ. جرّب إعادة تحميل الصفحة، وإن تكررت المشكلة تواصل معنا
            مباشرة وسنعالجها فوراً.
          </p>
          {this.state.message && (
            <code className="block text-[10px] text-left bg-black/5 dark:bg-white/5 rounded-lg p-2 overflow-x-auto text-[var(--vls-ink-muted)]">
              {this.state.message}
            </code>
          )}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>إعادة تحميل الصفحة</span>
            </button>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 border border-[var(--vls-line)] px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span>المحاولة مجدداً</span>
            </button>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-[var(--vls-accent)] hover:underline"
            >
              <MessageSquare size={14} />
              <span>تواصل عبر واتساب</span>
            </a>
          </div>
        </div>
      </div>
    );
  }
}
