const memoryStore = new Map<string, string>();

const memoryStorage: Storage = {
  get length() {
    return memoryStore.size;
  },
  clear() {
    memoryStore.clear();
  },
  getItem(key: string) {
    return memoryStore.get(key) ?? null;
  },
  key(index: number) {
    return Array.from(memoryStore.keys())[index] ?? null;
  },
  removeItem(key: string) {
    memoryStore.delete(key);
  },
  setItem(key: string, value: string) {
    memoryStore.set(key, String(value));
  },
};

export function getBrowserStorage(): Storage {
  try {
    const storage = globalThis.localStorage;
    if (storage) {
      const probeKey = '__storage_probe__';
      storage.setItem(probeKey, '1');
      storage.removeItem(probeKey);
      return storage;
    }
  } catch {
    // Node/Vitest pode expor localStorage indefinido ou sem permissão.
  }

  return memoryStorage;
}
