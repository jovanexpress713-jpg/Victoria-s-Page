import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount React trees between tests so each case starts clean.
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// --- jsdom gaps used by the app -------------------------------------------

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as unknown as MediaQueryList;
}

if (!window.IntersectionObserver) {
  class IntersectionObserverStub implements IntersectionObserver {
    root = null;
    rootMargin = '';
    thresholds = [];
    constructor(private readonly callback: IntersectionObserverCallback) {}
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
  }
  window.IntersectionObserver =
    IntersectionObserverStub as unknown as typeof IntersectionObserver;
}

// jsdom does not implement navigation-driven scrolling.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
Element.prototype.scrollIntoView = vi.fn();

// jsdom does not provide TextEncoder/TextDecoder.
if (!globalThis.TextEncoder || !globalThis.TextDecoder) {
  const util = await import('node:util');
  Object.assign(globalThis, {
    TextEncoder: util.TextEncoder,
    TextDecoder: util.TextDecoder,
  });
}

// The Web Crypto API is used for hashing the admin password.
if (!globalThis.crypto?.subtle) {
  const { webcrypto } = await import('node:crypto');
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
}
