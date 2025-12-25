// Novel Reader - Reading Lists Store

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ReadingList } from '../types';
import { safeStorage } from '../utils/storage';

interface ReadingListsState {
  lists: ReadingList[];
  
  addList: (list: { name: string; description?: string }) => void;
  removeList: (listId: string) => void;
  updateList: (listId: string, updates: Partial<ReadingList>) => void;
  
  addNovelToList: (listId: string, novelId: string) => void;
  removeNovelFromList: (listId: string, novelId: string) => void;
  isNovelInList: (listId: string, novelId: string) => boolean;
  
  getList: (listId: string) => ReadingList | undefined;
  getListsForNovel: (novelId: string) => ReadingList[];
}

export const useReadingListsStore = create<ReadingListsState>()(
  persist(
    (set, get) => ({
      lists: [
        {
          id: 'downloads-list',
          name: 'Downloads',
          description: 'Your offline chapters',
          novelIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
      ],

      addList: ({ name, description }) =>
        set((state) => ({
          lists: [
            ...state.lists,
            {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name,
              description,
              novelIds: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        })),

      removeList: (listId) =>
        set((state) => {
          if (listId === 'downloads-list') return state; // Prevent removing system list
          return {
            lists: state.lists.filter((list) => list.id !== listId),
          };
        }),

      updateList: (listId, updates) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? { ...list, ...updates, updatedAt: Date.now() }
              : list
          ),
        })),

      addNovelToList: (listId, novelId) =>
        set((state) => ({
          lists: state.lists.map((list) => {
            if (list.id !== listId) return list;
            if (list.novelIds.includes(novelId)) return list;
            return {
              ...list,
              novelIds: [...list.novelIds, novelId],
              updatedAt: Date.now(),
            };
          }),
        })),

      removeNovelFromList: (listId, novelId) =>
        set((state) => ({
          lists: state.lists.map((list) => {
            if (list.id !== listId) return list;
            return {
              ...list,
              novelIds: list.novelIds.filter((id) => id !== novelId),
              updatedAt: Date.now(),
            };
          }),
        })),

      isNovelInList: (listId, novelId) => {
        const list = get().lists.find((l) => l.id === listId);
        return list?.novelIds.includes(novelId) ?? false;
      },

      getList: (listId) => {
        return get().lists.find((l) => l.id === listId);
      },

      getListsForNovel: (novelId) => {
        return get().lists.filter((list) => list.novelIds.includes(novelId));
      },
    }),
    {
      name: 'reading-lists-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
