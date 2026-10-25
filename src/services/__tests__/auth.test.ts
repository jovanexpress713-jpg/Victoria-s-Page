import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  adminLogin,
  adminLogout,
  isAdminAuthenticated,
  getAuthMode,
  getLockStatus,
  sha256Hex,
  sessionRemainingMinutes,
  MAX_ATTEMPTS,
} from '../auth';

describe('مصادقة الإدارة', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  it('يقبل كلمة المرور التجريبية في وضع التطوير فقط', async () => {
    expect(getAuthMode()).toBe('demo');
    const result = await adminLogin('victoria2026');
    expect(result.ok).toBe(true);
    expect(isAdminAuthenticated()).toBe(true);
    expect(sessionRemainingMinutes()).toBeGreaterThan(0);
  });

  it('يرفض كلمة المرور الخاطئة ويغلق بعد تجاوز المحاولات', async () => {
    const wrong = await adminLogin('wrong-pass');
    expect(wrong).toEqual({ ok: false, reason: 'invalid' });

    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
      await adminLogin('wrong-pass');
    }
    const status = getLockStatus();
    expect(status.locked).toBe(true);

    const locked = await adminLogin('victoria2026');
    expect(locked).toEqual({ ok: false, reason: 'locked' });
  });

  it('يعمل بالبصمة المشفرة عند ضبط VITE_ADMIN_PASSWORD_HASH', async () => {
    const hash = await sha256Hex('client-secret-2026');
    expect(hash).not.toBeNull();
    vi.stubEnv('VITE_ADMIN_PASSWORD_HASH', hash as string);

    expect(getAuthMode()).toBe('configured');
    expect((await adminLogin('victoria2026')).ok).toBe(false);
    expect((await adminLogin('client-secret-2026')).ok).toBe(true);
  });

  it('ينهي الجلسة منتهية الصلاحية تلقائياً', async () => {
    await adminLogin('victoria2026');
    expect(isAdminAuthenticated()).toBe(true);

    const key = 'vls_admin_session_v3';
    const session = JSON.parse(localStorage.getItem(key) as string);
    localStorage.setItem(key, JSON.stringify({ ...session, expiresAt: Date.now() - 1000 }));

    expect(isAdminAuthenticated()).toBe(false);
  });

  it('يمسح الجلسة عند تسجيل الخروج', async () => {
    await adminLogin('victoria2026');
    adminLogout();
    expect(isAdminAuthenticated()).toBe(false);
  });
});
