/**
 * مصادقة مركز الإدارة (لوحة التحكم).
 *
 * المبادئ:
 * - لا تُخزَّن كلمة المرور في الكود المصدري: في الإنتاج تُضبط بصمة SHA-256 عبر
 *   متغير البيئة VITE_ADMIN_PASSWORD_HASH (انظر .env.example و docs/HANDOFF.md).
 * - جلسة مؤقتة تنتهي تلقائياً (افتراضياً 120 دقيقة) بدل "true" دائم في المتصفح.
 * - قفل مؤقت بعد 5 محاولات فاشلة للحد من التخمين العشوائي.
 * - في وضع التطوير المحلي فقط تعمل كلمة المرور التجريبية، وتُعطَّل تلقائياً في
 *   نسخ الإنتاج غير المُهيأة مع رسالة توضيح واضحة للمشرف.
 *
 * ملاحظة أمنية: حماية الواجهة وحدها لا تكفي للبيانات شديدة الحساسية؛ التخزين هنا
 * محلي في متصفح المشرف، وللمستوى المؤسسي يُربط الموقع بخادم مصادقة حقيقي.
 */

const SESSION_KEY = 'vls_admin_session_v3';
const LOCK_KEY = 'vls_admin_lockout_v3';
const LEGACY_SESSION_KEY = 'vls_admin_session_v2';

/** كلمة مرور وضع التطوير المحلي فقط (لا تعمل في نسخ الإنتاج). */
export const DEMO_PASSWORD = 'victoria2026';

export const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 10;

export type AuthMode = 'configured' | 'demo' | 'disabled';

export interface LoginResult {
  ok: boolean;
  reason?: 'locked' | 'invalid' | 'disabled' | 'insecure';
}

export interface LockStatus {
  locked: boolean;
  minutesLeft: number;
  attemptsLeft: number;
}

interface Session {
  issuedAt: number;
  expiresAt: number;
}

interface LockState {
  fails: number;
  lockedUntil: number;
}

function envHash(): string {
  return ((import.meta.env?.VITE_ADMIN_PASSWORD_HASH as string) || '').trim().toLowerCase();
}

function sessionMinutes(): number {
  const raw = Number(import.meta.env?.VITE_ADMIN_SESSION_MINUTES as string);
  return Number.isFinite(raw) && raw > 0 ? raw : 120;
}

/** وضع المصادقة الحالي حسب التهيئة. */
export function getAuthMode(): AuthMode {
  if (envHash()) return 'configured';
  if (import.meta.env?.DEV) return 'demo';
  return 'disabled';
}

// ---------------------------------------------------------------------------
// أدوات مساعدة
// ---------------------------------------------------------------------------

export async function sha256Hex(text: string): Promise<string | null> {
  try {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) return null;
    const digest = await subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return null;
  }
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readLock(): LockState {
  try {
    const raw = window.localStorage.getItem(LOCK_KEY);
    if (!raw) return { fails: 0, lockedUntil: 0 };
    const parsed = JSON.parse(raw) as Partial<LockState>;
    return {
      fails: typeof parsed.fails === 'number' ? parsed.fails : 0,
      lockedUntil: typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : 0,
    };
  } catch {
    return { fails: 0, lockedUntil: 0 };
  }
}

function writeLock(state: LockState): void {
  try {
    window.localStorage.setItem(LOCK_KEY, JSON.stringify(state));
  } catch {
    // تجاهل: التخزين غير متاح
  }
}

export function getLockStatus(): LockStatus {
  const lock = readLock();
  const remaining = lock.lockedUntil - Date.now();
  return {
    locked: remaining > 0,
    minutesLeft: remaining > 0 ? Math.ceil(remaining / 60000) : 0,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - lock.fails),
  };
}

// ---------------------------------------------------------------------------
// الدخول والخروج
// ---------------------------------------------------------------------------

export async function adminLogin(password: string): Promise<LoginResult> {
  const lockStatus = getLockStatus();
  if (lockStatus.locked) return { ok: false, reason: 'locked' };

  const mode = getAuthMode();
  if (mode === 'disabled') return { ok: false, reason: 'disabled' };

  const hash = await sha256Hex(password.trim());
  if (!hash) return { ok: false, reason: 'insecure' };

  const expected =
    mode === 'configured' ? envHash() : await sha256Hex(DEMO_PASSWORD);

  if (expected && constantTimeEqual(hash, expected)) {
    writeLock({ fails: 0, lockedUntil: 0 });
    startSession();
    return { ok: true };
  }

  const lock = readLock();
  const fails = lock.fails + 1;
  const shouldLock = fails >= MAX_ATTEMPTS;
  writeLock({
    fails: shouldLock ? 0 : fails,
    lockedUntil: shouldLock ? Date.now() + LOCK_MINUTES * 60000 : 0,
  });
  return { ok: false, reason: shouldLock ? 'locked' : 'invalid' };
}

export function startSession(): void {
  const now = Date.now();
  const session: Session = {
    issuedAt: now,
    expiresAt: now + sessionMinutes() * 60000,
  };
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.localStorage.removeItem(LEGACY_SESSION_KEY);
  } catch {
    // تجاهل: لن تُحفظ الجلسة لكن الدخول يعمل خلال التبويب الحالي
  }
}

export function isAdminAuthenticated(): boolean {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw) as Session;
    if (!session || typeof session.expiresAt !== 'number' || session.expiresAt < Date.now()) {
      window.localStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function adminLogout(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // تجاهل
  }
}

export function sessionRemainingMinutes(): number {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return 0;
    const session = JSON.parse(raw) as Session;
    return Math.max(0, Math.round((session.expiresAt - Date.now()) / 60000));
  } catch {
    return 0;
  }
}

/** تنظيف مفاتيح الجلسة القديمة عند أول تحميل بعد الترقية. */
export function migrateLegacySession(): void {
  try {
    window.localStorage.removeItem(LEGACY_SESSION_KEY);
  } catch {
    // تجاهل
  }
}
