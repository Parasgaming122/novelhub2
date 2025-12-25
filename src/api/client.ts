// Novel Reader - API Client

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ApiResponse,
  HomeData,
  Novel,
  NovelInfo,
  ChapterContent,
} from '../types';

// API Configuration
const ORIGINAL_API_URL = 'https://novelhall.vercel.app';
const TIMEOUT = 30000;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: ORIGINAL_API_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please check your connection.');
    }
    if (!error.response) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw error;
  }
);

// ============ API Functions ============

/**
 * Fetch home page data (recommended + latest releases)
 */
export async function fetchHomeData(): Promise<HomeData> {
  const response = await apiClient.get<ApiResponse<any>>('/api/home');

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to fetch home data');
  }

  const { recommended, latestReleases } = response.data.data;

  // Map latest releases to Novel type since API returns different fields
  const mappedLatest: Novel[] = (latestReleases || []).map((item: any) => {
    const novelId = item.novelId || '';
    
    // Try to reconstruct cover image if missing
    let coverImage = item.coverImage || '';
    if (!coverImage && novelId) {
      const idMatch = novelId.match(/-(\d+)$/);
      if (idMatch) {
        coverImage = `https://www.novelhall.com/comic/${idMatch[1]}.jpg`;
      }
    }

    return {
      id: novelId,
      title: item.novelTitle || '',
      author: item.author || 'Recent',
      coverImage: coverImage,
      description: '',
      genre: item.genre || '',
      status: 'Updated',
      updateTime: item.updateTime || '',
    };
  });

  return {
    recommended: recommended || [],
    latestReleases: mappedLatest,
  };
}

/**
 * Search novels by keyword
 */
export async function searchNovels(keyword: string): Promise<Novel[]> {
  if (!keyword.trim()) {
    return [];
  }

  console.log(`[API] Searching: ${keyword}`);
  const response = await apiClient.get<ApiResponse<any>>('/api/search', {
    params: { keyword: keyword.trim() },
  });

  if (!response.data.success) {
    console.error('[API] Search failed:', response.data.message);
    throw new Error(response.data.message || 'Search failed');
  }

  console.log(`[API] Search success, found ${response.data.data?.length || 0} items`);

  // Handle both { data: [...] } and { data: { novels: [...] } }
  const searchData = response.data.data;
  let results: any[] = [];
  
  if (Array.isArray(searchData)) {
    results = searchData;
  } else if (searchData && typeof searchData === 'object') {
    results = searchData.novels || searchData.results || searchData.data || [];
  }

  return results.map((n: any) => {
    // Extract ID from URL if missing (some search results only have novelUrl)
    let extractedId = n.id || n.novelId || '';
    if (!extractedId && n.novelUrl) {
      extractedId = n.novelUrl.replace('.html', '').split('/').pop() || '';
    }

    // Try to reconstruct cover image if missing
    let coverImage = n.coverImage || n.image || '';
    if (!coverImage && extractedId) {
      // Numerical part extraction for common Novelhall image pattern
      const idMatch = extractedId.match(/-(\d+)$/);
      if (idMatch) {
        coverImage = `https://www.novelhall.com/comic/${idMatch[1]}.jpg`;
      }
    }

    return {
      ...n,
      id: extractedId,
      title: n.title || n.novelTitle || 'Untitled Novel',
      coverImage: coverImage,
      author: n.author || 'Unknown',
    };
  });
}

/**
 * Fetch novel info with chapter list
 */
export async function fetchNovelInfo(novelId: string): Promise<NovelInfo> {
  const response = await apiClient.get<ApiResponse<any>>(
    `/api/info/${novelId}`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to fetch novel info');
  }

  const { novel, chapters } = response.data.data;
  
  // Clean author name (API sometimes includes raw JS hits code)
  const cleanAuthor = (novel.author || '')
    .split('\n')[0]
    .replace('$.ajax', '')
    .split('{')[0]
    .trim();

  // Patch empty ID if present in API response
  const patchedNovel = {
    ...novel,
    author: cleanAuthor,
    id: novel.id || novelId,
  };

  return {
    ...patchedNovel,
    chapters: chapters || [],
    totalChapters: chapters?.length || 0,
  };
}

/**
 * Fetch chapter content
 */
export async function fetchChapter(
  novelId: string,
  chapterId: string
): Promise<ChapterContent> {
  const response = await apiClient.get<ApiResponse<ChapterContent>>(
    '/api/chapter/x',
    {
      params: { novelId, chapterId },
    }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to fetch chapter');
  }

  const chapterData = response.data.data;

  // Patch empty ID/Title if needed (scraper often returns empty strings here)
  return {
    ...chapterData,
    id: chapterData.id || chapterId,
    title: chapterData.title || (chapterData.content ? chapterData.content.trim().split('\n')[0].substring(0, 50) : 'Chapter'),
  };
}

export default apiClient;
