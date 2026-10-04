// localStorage wrapper: every access is optional (private mode, blocked storage, previews).
const PREFIX = 'pikko.v1.';

export const store = {
  get<T>(key: string, fallback?: T): T | undefined {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown): void {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* storage unavailable: ignore */ }
  },
};
