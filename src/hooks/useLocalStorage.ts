"use client";

import { useEffect, useState } from "react";
import type { StorageService } from "@/services/storage/storage.interface";
import { localStorageService } from "@/services/storage/localStorage.service";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  storage: StorageService = localStorageService
): [T, (value: T) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const item = storage.getItem<T>(key);
    if (item !== null) {
      setStoredValue(item);
    }
    setHydrated(true);
  }, [key, storage]);

  const setValue = (value: T) => {
    setStoredValue(value);
    storage.setItem(key, value);
  };

  return [storedValue, setValue, hydrated];
}
