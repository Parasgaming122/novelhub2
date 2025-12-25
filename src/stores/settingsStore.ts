// Novel Reader - Settings Store (Zustand + MMKV)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AppSettings,
  ReaderSettings,
  TTSSettings,
  ThemeMode,
} from '../types';
import {
  defaultReaderSettings,
  defaultTTSSettings,
} from '../constants/theme';
import { safeStorage } from '../utils/storage';

interface SettingsState {
  // Reader Settings
  reader: ReaderSettings;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setFontFamily: (family: string) => void;
  setTheme: (theme: ThemeMode) => void;
  setKeepScreenOn: (keep: boolean) => void;

  // TTS Settings
  tts: TTSSettings;
  setPitch: (pitch: number) => void;
  setSpeed: (speed: number) => void;
  setSelectedVoice: (voiceId: string | undefined) => void;
  setAutoScrollEnabled: (enabled: boolean) => void;
  setFocusEnabled: (enabled: boolean) => void;

  // App Settings
  downloadOnWifiOnly: boolean;
  setDownloadOnWifiOnly: (wifiOnly: boolean) => void;
  maxDownloadedChapters: number;
  setMaxDownloadedChapters: (max: number) => void;
  maxStorageSize: number; // in MB
  setMaxStorageSize: (size: number) => void;

  // Reset
  resetToDefaults: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Reader Settings
      reader: defaultReaderSettings,
      setFontSize: (size) =>
        set((state) => ({
          reader: { ...state.reader, fontSize: size },
        })),
      setLineHeight: (height) =>
        set((state) => ({
          reader: { ...state.reader, lineHeight: height },
        })),
      setFontFamily: (family) =>
        set((state) => ({
          reader: { ...state.reader, fontFamily: family },
        })),
      setTheme: (theme) =>
        set((state) => ({
          reader: { ...state.reader, theme },
        })),
      setKeepScreenOn: (keep) =>
        set((state) => ({
          reader: { ...state.reader, keepScreenOn: keep },
        })),

      // TTS Settings
      tts: defaultTTSSettings,
      setPitch: (pitch) =>
        set((state) => ({
          tts: { ...state.tts, pitch },
        })),
      setSpeed: (speed) =>
        set((state) => ({
          tts: { ...state.tts, speed },
        })),
      setSelectedVoice: (voiceId) =>
        set((state) => ({
          tts: { ...state.tts, selectedVoiceIdentifier: voiceId },
        })),
      setAutoScrollEnabled: (enabled) =>
        set((state) => ({
          tts: { ...state.tts, autoScrollEnabled: enabled },
        })),
      setFocusEnabled: (enabled) =>
        set((state) => ({
          tts: { ...state.tts, focusEnabled: enabled },
        })),

      // App Settings
      downloadOnWifiOnly: true,
      setDownloadOnWifiOnly: (wifiOnly) =>
        set({ downloadOnWifiOnly: wifiOnly }),
      maxDownloadedChapters: 500,
      setMaxDownloadedChapters: (max) =>
        set({ maxDownloadedChapters: max }),
      maxStorageSize: 100,
      setMaxStorageSize: (size) =>
        set({ maxStorageSize: size }),

      // Reset
      resetToDefaults: () =>
        set({
          reader: defaultReaderSettings,
          tts: defaultTTSSettings,
          downloadOnWifiOnly: true,
          maxDownloadedChapters: 500,
          maxStorageSize: 100,
        }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
