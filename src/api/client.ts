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
const CORS_PROXY = 'https://corsproxy.io/?url=';
const TIMEOUT = 30000;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - wrap URL with CORS proxy
apiClient.interceptors.request.use((config) => {
  if (config.url) {
    const targetUrl = new URL(config.url, ORIGINAL_API_URL);
    config.url = `${CORS_PROXY}${encodeURIComponent(targetUrl.toString())}`;
  }
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
  const response = await apiClient.get<ApiResponse<HomeData>>(
    `${ORIGINAL_API_URL}/api/home`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to fetch home data');
  }

  return response.data.data;
}

/**
 * Search novels by keyword
 */
export async function searchNovels(keyword: string): Promise<Novel[]> {
  if (!keyword.trim()) {
    return [];
  }

  const response = await apiClient.get<ApiResponse<Novel[]>>(
    `${ORIGINAL_API_URL}/api/search`,
    {
      params: { keyword: keyword.trim() },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Search failed');
  }

  return response.data.data || [];
}

/**
 * Fetch novel info with chapter list
 */
export async function fetchNovelInfo(novelId: string): Promise<NovelInfo> {
  const response = await apiClient.get<ApiResponse<NovelInfo>>(
    `${ORIGINAL_API_URL}/api/info/${novelId}`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to fetch novel info');
  }

  return response.data.data;
}

/**
 * Fetch chapter content
 */
export async function fetchChapter(
  novelId: string,
  chapterId: string
): Promise<ChapterContent> {
  const response = await apiClient.get<ApiResponse<ChapterContent>>(
    `${ORIGINAL_API_URL}/api/chapter/x`,
    {
      params: { novelId, chapterId },
    }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to fetch chapter');
  }

  return response.data.data;
}

export default apiClient;
