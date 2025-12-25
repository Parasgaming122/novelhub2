// Novel Reader - Statistics Store

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ReadingStats, ReadingSession } from '../types';
import { safeStorage } from '../utils/storage';

interface StatisticsState extends ReadingStats {
  addSession: (session: Omit<ReadingSession, 'id'>) => void;
  updateStats: (readingTimeMinutes: number, wordsRead: number, chaptersRead: number) => void;
  resetStats: () => void;
}

const initialStats: ReadingStats = {
  totalReadingTime: 0,
  totalWordsRead: 0,
  totalChaptersRead: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastReadDate: '',
  sessionsHistory: [],
};

export const useStatisticsStore = create<StatisticsState>()(
  persist(
    (set, get) => ({
      ...initialStats,

      addSession: (sessionData) =>
        set((state) => {
          const sessionWithId: ReadingSession = {
            ...sessionData,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };
          
          return {
            sessionsHistory: [sessionWithId, ...state.sessionsHistory].slice(0, 100), // Keep last 100 sessions
          };
        }),

      updateStats: (readingTimeMinutes, wordsRead, chaptersRead) =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          let { currentStreak, longestStreak, lastReadDate } = state;

          if (lastReadDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastReadDate === yesterdayStr) {
              currentStreak += 1;
            } else {
              currentStreak = 1;
            }

            if (currentStreak > longestStreak) {
              longestStreak = currentStreak;
            }
            lastReadDate = today;
          }

          return {
            totalReadingTime: state.totalReadingTime + readingTimeMinutes,
            totalWordsRead: state.totalWordsRead + wordsRead,
            totalChaptersRead: state.totalChaptersRead + chaptersRead,
            currentStreak,
            longestStreak,
            lastReadDate,
          };
        }),

      resetStats: () => set(initialStats),
    }),
    {
      name: 'statistics-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
