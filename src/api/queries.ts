// Novel Reader - TanStack Query Hooks

import { useQuery } from '@tanstack/react-query';
import {
  fetchHomeData,
  searchNovels,
  fetchNovelInfo,
  fetchChapter,
} from './client';
import { useDownloadsStore } from '../stores/downloadsStore';

// Query Keys
export const queryKeys = {
  home: ['home'] as const,
  search: (keyword: string) => ['search', keyword] as const,
  novelInfo: (novelId: string) => ['novel', novelId] as const,
  chapter: (novelId: string, chapterId: string) =>
    ['chapter', novelId, chapterId] as const,
};

// Cache Time Configuration (in milliseconds)
const CACHE_TIMES = {
  home: 10 * 60 * 1000, // 10 minutes
  search: 5 * 60 * 1000, // 5 minutes
  novelInfo: 30 * 60 * 1000, // 30 minutes
  chapter: 24 * 60 * 60 * 1000, // 24 hours (content doesn't change)
};

/**
 * Hook to fetch home page data
 */
export function useHomeData() {
  return useQuery({
    queryKey: queryKeys.home,
    queryFn: fetchHomeData,
    staleTime: CACHE_TIMES.home,
    gcTime: CACHE_TIMES.home * 2,
  });
}

/**
 * Hook to search novels
 */
export function useSearchNovels(keyword: string) {
  return useQuery({
    queryKey: queryKeys.search(keyword),
    queryFn: () => searchNovels(keyword),
    staleTime: CACHE_TIMES.search,
    gcTime: CACHE_TIMES.search * 2,
    enabled: keyword.trim().length > 0,
  });
}

/**
 * Hook to fetch novel info
 */
export function useNovelInfo(novelId: string) {
  return useQuery({
    queryKey: queryKeys.novelInfo(novelId),
    queryFn: () => fetchNovelInfo(novelId),
    staleTime: CACHE_TIMES.novelInfo,
    gcTime: CACHE_TIMES.novelInfo * 2,
    enabled: !!novelId,
  });
}

/**
 * Hook to fetch chapter content
 */
export function useChapter(novelId: string, chapterId: string) {
  return useQuery({
    queryKey: queryKeys.chapter(novelId, chapterId),
    queryFn: async () => {
      // 1. Check offline storage first
      const downloaded = useDownloadsStore.getState().getDownloadedChapter(novelId, chapterId);
      if (downloaded) {
        console.log(`[Offline] Loading chapter: ${downloaded.chapterTitle}`);
        return {
          id: downloaded.chapterId,
          title: downloaded.chapterTitle,
          content: downloaded.content,
          novelId: downloaded.novelId,
          novelTitle: downloaded.novelTitle,
          navigation: { prev: null, next: null }, // Navigation is handled by the reader index
        };
      }

      // 2. Fetch from API
      return fetchChapter(novelId, chapterId);
    },
    staleTime: CACHE_TIMES.chapter,
    gcTime: CACHE_TIMES.chapter * 2,
    enabled: !!novelId && !!chapterId,
  });
}
