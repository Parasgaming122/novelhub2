// Novel Reader - Reader Store (Zustand + MMKV)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ReadingProgress, Bookmark, BookmarkColor } from '../types';
import { safeStorage } from '../utils/storage';

interface ReaderState {
  // Reading Progress
  progressMap: Record<string, ReadingProgress>; // keyed by novelId
  currentProgress: ReadingProgress | null;
  
  setProgress: (progress: ReadingProgress) => void;
  getProgress: (novelId: string) => ReadingProgress | undefined;
  clearProgress: (novelId: string) => void;
  
  // History (last read novels)
  history: ReadingProgress[];
  addToHistory: (progress: ReadingProgress) => void;
  clearHistory: () => void;
  
  // Bookmarks
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (bookmarkId: string) => void;
  updateBookmarkColor: (bookmarkId: string, color: BookmarkColor) => void;
  getBookmarksForChapter: (novelId: string, chapterId: string) => Bookmark[];
  getBookmarksForNovel: (novelId: string) => Bookmark[];
  
  // Continue Reading
  continueReading: ReadingProgress[];
  updateContinueReading: (progress: ReadingProgress) => void;
}

const MAX_HISTORY_ITEMS = 50;
const MAX_CONTINUE_READING = 10;

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      // Reading Progress
      progressMap: {},
      currentProgress: null,

      setProgress: (progress) =>
        set((state) => {
          const newProgressMap = {
            ...state.progressMap,
            [progress.novelId]: progress,
          };
          
          // Also update continue reading
          const continueReading = [...state.continueReading];
          const existingIndex = continueReading.findIndex(
            (p) => p.novelId === progress.novelId
          );
          
          if (existingIndex >= 0) {
            continueReading[existingIndex] = progress;
          } else {
            continueReading.unshift(progress);
          }
          
          // Keep only recent items
          const trimmedContinue = continueReading.slice(0, MAX_CONTINUE_READING);
          
          return {
            progressMap: newProgressMap,
            currentProgress: progress,
            continueReading: trimmedContinue,
          };
        }),

      getProgress: (novelId) => {
        return get().progressMap[novelId];
      },

      clearProgress: (novelId) =>
        set((state) => {
          const { [novelId]: _, ...rest } = state.progressMap;
          return {
            progressMap: rest,
            continueReading: state.continueReading.filter(
              (p) => p.novelId !== novelId
            ),
          };
        }),

      // History
      history: [],
      
      addToHistory: (progress) =>
        set((state) => {
          const history = [...state.history];
          const existingIndex = history.findIndex(
            (h) => h.novelId === progress.novelId
          );
          
          if (existingIndex >= 0) {
            history.splice(existingIndex, 1);
          }
          
          history.unshift(progress);
          
          return {
            history: history.slice(0, MAX_HISTORY_ITEMS),
          };
        }),

      clearHistory: () => set({ history: [] }),

      // Bookmarks
      bookmarks: [],

      addBookmark: (bookmarkData) =>
        set((state) => ({
          bookmarks: [
            ...state.bookmarks,
            {
              ...bookmarkData,
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              createdAt: Date.now(),
            },
          ],
        })),

      removeBookmark: (bookmarkId) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== bookmarkId),
        })),

      updateBookmarkColor: (bookmarkId, color) =>
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === bookmarkId ? { ...b, color } : b
          ),
        })),

      getBookmarksForChapter: (novelId, chapterId) => {
        return get().bookmarks.filter(
          (b) => b.novelId === novelId && b.chapterId === chapterId
        );
      },

      getBookmarksForNovel: (novelId) => {
        return get().bookmarks.filter((b) => b.novelId === novelId);
      },

      // Continue Reading
      continueReading: [],
      
      updateContinueReading: (progress) =>
        set((state) => {
          const continueReading = [...state.continueReading];
          const existingIndex = continueReading.findIndex(
            (p) => p.novelId === progress.novelId
          );
          
          if (existingIndex >= 0) {
            continueReading[existingIndex] = progress;
          } else {
            continueReading.unshift(progress);
          }
          
          return {
            continueReading: continueReading.slice(0, MAX_CONTINUE_READING),
          };
        }),
    }),
    {
      name: 'reader-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
