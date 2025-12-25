// Novel Reader - Downloads Store

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DownloadedNovel, DownloadedChapter } from '../types';
import { safeStorage } from '../utils/storage';

interface DownloadsState {
  downloadedNovels: DownloadedNovel[];
  
  addChapter: (chapter: DownloadedChapter, coverImage?: string) => void;
  removeChapter: (novelId: string, chapterId: string) => void;
  removeNovel: (novelId: string) => void;
  clearAll: () => void;
  
  isChapterDownloaded: (novelId: string, chapterId: string) => boolean;
  getDownloadedChapter: (novelId: string, chapterId: string) => DownloadedChapter | undefined;
  getDownloadedNovel: (novelId: string) => DownloadedNovel | undefined;
  getTotalSize: () => number;
}

export const useDownloadsStore = create<DownloadsState>()(
  persist(
    (set, get) => ({
      downloadedNovels: [],

      addChapter: (chapter, coverImage) =>
        set((state) => {
          const novels = [...state.downloadedNovels];
          const novelIndex = novels.findIndex(
            (n) => n.novelId === chapter.novelId
          );

          if (novelIndex >= 0) {
            // Novel exists, add chapter and update cover if provided
            const novel = novels[novelIndex];
            const chapterExists = novel.chapters.some(
              (c) => c.chapterId === chapter.chapterId
            );
            
            if (!chapterExists) {
              novel.chapters.push(chapter);
              novel.totalSize += chapter.size;
            }
            
            if (coverImage && !novel.coverImage) {
              novel.coverImage = coverImage;
            }
          } else {
            // New novel
            novels.push({
              novelId: chapter.novelId,
              novelTitle: chapter.novelTitle,
              coverImage: coverImage || '',
              chapters: [chapter],
              totalSize: chapter.size,
              downloadedAt: Date.now(),
            });
          }

          return { downloadedNovels: novels };
        }),

      removeChapter: (novelId, chapterId) =>
        set((state) => {
          const novels = state.downloadedNovels.map((novel) => {
            if (novel.novelId !== novelId) return novel;
            
            const chapter = novel.chapters.find(
              (c) => c.chapterId === chapterId
            );
            const chapterSize = chapter?.size || 0;
            
            return {
              ...novel,
              chapters: novel.chapters.filter(
                (c) => c.chapterId !== chapterId
              ),
              totalSize: novel.totalSize - chapterSize,
            };
          }).filter((novel) => novel.chapters.length > 0);

          return { downloadedNovels: novels };
        }),

      removeNovel: (novelId) =>
        set((state) => ({
          downloadedNovels: state.downloadedNovels.filter(
            (n) => n.novelId !== novelId
          ),
        })),

      clearAll: () => set({ downloadedNovels: [] }),

      isChapterDownloaded: (novelId, chapterId) => {
        const novel = get().downloadedNovels.find(
          (n) => n.novelId === novelId
        );
        return novel?.chapters.some((c) => c.chapterId === chapterId) ?? false;
      },

      getDownloadedChapter: (novelId, chapterId) => {
        const novel = get().downloadedNovels.find(
          (n) => n.novelId === novelId
        );
        return novel?.chapters.find((c) => c.chapterId === chapterId);
      },

      getDownloadedNovel: (novelId) => {
        return get().downloadedNovels.find((n) => n.novelId === novelId);
      },

      getTotalSize: () => {
        return get().downloadedNovels.reduce(
          (total, novel) => total + novel.totalSize,
          0
        );
      },
    }),
    {
      name: 'downloads-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
