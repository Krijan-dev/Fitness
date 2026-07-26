import type { StorageService } from "./storage.interface";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export class LocalStorageService implements StorageService {
  getItem<T>(key: string): T | null {
    if (!isBrowser()) {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(`Failed to read storage key "${key}":`, error);
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    if (!isBrowser()) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to write storage key "${key}":`, error);
    }
  }

  removeItem(key: string): void {
    if (!isBrowser()) {
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove storage key "${key}":`, error);
    }
  }

  clear(): void {
    if (!isBrowser()) {
      return;
    }

    try {
      window.localStorage.clear();
    } catch (error) {
      console.error("Failed to clear storage:", error);
    }
  }
}

export const localStorageService = new LocalStorageService();
