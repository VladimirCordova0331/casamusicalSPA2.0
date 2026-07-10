// Storage utilities for Casa Musical App

export function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, v: T) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    console.warn(`Failed to save ${key} to localStorage`);
  }
}

export function remove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    console.warn(`Failed to remove ${key} from localStorage`);
  }
}
