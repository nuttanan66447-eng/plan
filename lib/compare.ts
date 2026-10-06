"use client";

import { useSyncExternalStore } from "react";

export interface CompareItem {
  code: string;
  area: number;
}

const KEY = "ap-compare";
export const COMPARE_MAX = 3;
const listeners = new Set<() => void>();
let cache: CompareItem[] | null = null;
const EMPTY: CompareItem[] = [];

function read(): CompareItem[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed.slice(0, COMPARE_MAX) : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(items: CompareItem[]) {
  cache = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // storage unavailable (private mode); keep in memory only
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCompare() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    items,
    has: (code: string) => items.some((i) => i.code === code),
    toggle: (item: CompareItem) => {
      const cur = read();
      if (cur.some((i) => i.code === item.code)) write(cur.filter((i) => i.code !== item.code));
      else write([...cur, item].slice(-COMPARE_MAX));
    },
    remove: (code: string) => write(read().filter((i) => i.code !== code)),
    clear: () => write([]),
  };
}
