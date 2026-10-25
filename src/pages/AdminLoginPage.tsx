import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowLeft, AlertTriangle, TimerReset } from 'lucide-react';
import {
  adminLogin,
  getAuthMode,
  getLockStatus,
  DEMO_PASSWORD,
} from '../services/auth';
import { usePageMeta } from '../hooks/usePageMeta';

interface AdminLoginPageProps {
  onSuccess: () => void;
  navigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, navigate }) => {
  usePageMeta({
    title: 'دخول الإدارة',
    description: 'منطقة مخصصة لإدارة العملاء المحتملين وطلبات التسعير والعروض ومتابعات العملاء.',
  });

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const mode = getAuthMode();
  const lock = getLockStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || lock.locked) return;
    setBusy(true);
    setError('');
    const result = await adminLogin(password);
    setBusy(false);
    if (result.ok) {
      onSuccess();
      return;
    }
    switch (result.reason) {
      case 'locked':
        setError(
          `تم قفل المحاولة مؤقتاً بعد ${getLockStatus().attemptsLeft === 0 ? 'تجاوز حد المحاولات' : 'محاولات متكررة'}. انتظر ${getLockStatus().minutesLeft} دقائق.`
        );
        break;
      case 'disabled':
        setError('لم يتم تهيئة كلمة مرور الإدارة في هذا النشر. راجع دليل التشغيل (VITE_ADMIN_PASSWORD_HASH).');
        break;
      case 'insecure':
        setError('الدخول الآمن يتطلب اتصال HTTPS. شغّل الموقع عبر اتصال مشفر.');
        break;
      default:
        setError('كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="bg-[var(--vls-paper)] min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md rounded-3xl border border-[var(--vls-line)] bg-[var(--vls-panel)] p-8 sm:p-10 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#101318] dark:bg-white text-[#c8fa55] dark:text-[#101318] flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck size={24} />
          </div>
          <span className="text-[10px] font-mono font-bold text-[var(--vls-accent)] tracking-wider block pt-2">
            PRIVATE CONTROL CENTER
          </span>
          <h1 className="text-2xl font-black text-[var(--vls-ink)]">دخول الإدارة</h1>
          <p className="text-xs text-[var(--vls-ink-muted)] leading-relaxed">
            هذه المنطقة مخصصة لإدارة العملاء المحتملين وطلبات التسعير والعروض وسجلات المساعد الذكي.
          </p>
        </div>

        {mode === 'disabled' && (
          <div className="p-3.5 rounded-xl bg-[#f3a5d5]/10 border border-[#f3a5d5]/30 text-[#f3a5d5] text-xs font-bold flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span>
              هذا النشر غير مُهيأ بكلمة مرور إدارة. أضف متغير البيئة
              <code className="mx-1 font-mono bg-black/20 px-1 rounded">VITE_ADMIN_PASSWORD_HASH</code>
              ثم أعد البناء (التفاصيل في docs/HANDOFF.md).
            </span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-bold text-[var(--vls-ink)] mb-1.5 flex items-center gap-1.5"
            >
              <Lock size={14} className="text-[var(--vls-accent)]" />
              <span>كلمة مرور الإدارة</span>
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              disabled={busy || lock.locked || mode === 'disabled'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-[var(--vls-line)] bg-[var(--vls-input-bg)] text-xs text-[var(--vls-ink)] outline-none focus:border-[var(--vls-accent)] transition-colors disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={busy || lock.locked || mode === 'disabled'}
            className="w-full bg-[var(--vls-btn-bg)] text-[var(--vls-btn-fg)] py-3 rounded-xl text-xs font-bold hover:bg-[var(--vls-btn-bg-hover)] transition-all cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {lock.locked && <TimerReset size={14} />}
            <span>
              {lock.locked
                ? `محاولات موقوفة (${lock.minutesLeft} د)`
                : busy
                  ? 'جارٍ التحقق…'
                  : 'دخول آمن ←'}
            </span>
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-[var(--vls-ink-muted)] border-t border-[var(--vls-line-soft)] space-y-2">
          {mode === 'demo' && (
            <p>
              وضع التطوير: كلمة المرور التجريبية{' '}
              <code className="bg-[var(--vls-accent-soft)] text-[var(--vls-accent-deep)] px-2 py-0.5 rounded font-mono font-bold">
                {DEMO_PASSWORD}
              </code>
              {' '}(تُعطَّل تلقائياً في الإنتاج)
            </p>
          )}
          {mode === 'configured' && (
            <p>الجلسة تنتهي تلقائياً بعد فترة الخمول المحددة في إعدادات النشر.</p>
          )}
          <button
            onClick={() => navigate('/')}
            className="text-xs font-bold text-[var(--vls-accent)] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>العودة للرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
