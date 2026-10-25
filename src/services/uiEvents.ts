/** أحداث تنسيق عامة بين المكونات (شاشة الترحيب والجولة الإرشادية). */
export const WELCOME_OPEN_EVENT = 'vls:welcome-open';
export const TOUR_START_EVENT = 'vls:tour-start';
export const WELCOME_SEEN_KEY = 'vls_welcome_v1';

export function requestWelcome(): void {
  window.dispatchEvent(new CustomEvent(WELCOME_OPEN_EVENT));
}

export function requestTour(): void {
  window.dispatchEvent(new CustomEvent(TOUR_START_EVENT));
}

export function hasSeenWelcome(): boolean {
  try {
    return window.localStorage.getItem(WELCOME_SEEN_KEY) === '1';
  } catch {
    return true; // عند تعذّر التخزين لا نفرض الشاشة على الزائر
  }
}

export function markWelcomeSeen(): void {
  try {
    window.localStorage.setItem(WELCOME_SEEN_KEY, '1');
  } catch {
    // تجاهل
  }
}
