// Novel Reader - Safe Storage Utility
import { StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

let mmkv: any = null;
let isMMKVAvailable = false;

try {
  // Use require to avoid top-level import crash if MMKV is not linked
  const { MMKV } = require('react-native-mmkv');
  mmkv = new MMKV({ id: 'novel-reader-storage' });
  isMMKVAvailable = true;
  console.log('[Storage] Native MMKV driver initialized.');
} catch (e) {
  console.log('[Storage] MMKV not available. Using AsyncStorage fallback (ideal for Expo Go).');
}

// Persistent Storage for Zustand
export const safeStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (isMMKVAvailable) {
      return mmkv.getString(name) ?? null;
    }
    return await AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (isMMKVAvailable) {
      mmkv.set(name, value);
      return;
    }
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (isMMKVAvailable) {
      mmkv.delete(name);
      return;
    }
    await AsyncStorage.removeItem(name);
  },
};

// Synchronous access if available (for UI states that need it instantly)
export const getSyncString = (key: string): string | null => {
  if (isMMKVAvailable) {
    return mmkv.getString(key) ?? null;
  }
  return null;
};
