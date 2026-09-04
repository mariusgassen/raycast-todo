/**
 * Minimal stand-in for the parts of `@raycast/api` our pure logic modules
 * touch at runtime (`LocalStorage`, `Color`). The real package ships only
 * type declarations to Node — its runtime is injected by the Raycast host
 * app — so it can't be imported outside Raycast. vitest.config.ts aliases
 * `@raycast/api` to this file for tests only; production builds still
 * resolve the real package.
 */

type StorageValue = string | number | boolean;

function createLocalStorage() {
  const store = new Map<string, StorageValue>();
  return {
    async getItem<T extends StorageValue>(key: string): Promise<T | undefined> {
      return store.get(key) as T | undefined;
    },
    async setItem(key: string, value: StorageValue): Promise<void> {
      store.set(key, value);
    },
    async removeItem(key: string): Promise<void> {
      store.delete(key);
    },
    async clear(): Promise<void> {
      store.clear();
    },
    async allItems(): Promise<Record<string, StorageValue>> {
      return Object.fromEntries(store);
    },
  };
}

export const LocalStorage = createLocalStorage();

export const Color = {
  Red: "raycast-red",
  Orange: "raycast-orange",
  Yellow: "raycast-yellow",
  Green: "raycast-green",
  Blue: "raycast-blue",
  Purple: "raycast-purple",
  Magenta: "raycast-magenta",
  PrimaryText: "raycast-primary-text",
  SecondaryText: "raycast-secondary-text",
};
