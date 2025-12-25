// Novel Reader - Type Definitions

// ============ API Types ============

export interface Novel {
  id: string;
  slug?: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  genre: string;
  status: string;
  updateTime: string;
  latestChapter?: string;
}

export interface Chapter {
  id: string;
  title: string;
  url: string;
}

export interface ChapterContent {
  id: string;
  title: string;
  content: string;
  novelId: string;
  novelTitle: string;
  navigation: {
    prev: { id: string; url: string } | null;
    next: { id: string; url: string } | null;
  };
}

export interface NovelInfo extends Novel {
  chapters: Chapter[];
  totalChapters: number;
}

export interface HomeData {
  recommended: Novel[];
  latestReleases: Novel[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// ============ Reader Types ============

export interface ReadingProgress {
  novelId: string;
  novelTitle: string;
  chapterId: string;
  chapterTitle: string;
  chapterIndex: number;
  paragraphIndex: number;
  scrollPosition: number;
  timestamp: number;
  coverImage?: string;
}

export interface ParsedChapter {
  paragraphs: string[];
  wordCount: number;
}

// ============ TTS Types ============

export interface TTSSettings {
  pitch: number; // 0.5 - 2.0
  speed: number; // 0.5 - 2.0
  selectedVoiceIdentifier?: string;
  autoScrollEnabled: boolean;
  focusEnabled: boolean;
}

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentParagraphIndex: number;
}

// ============ Bookmark Types ============

export type BookmarkColor = "yellow" | "green" | "blue" | "red" | "purple";

export interface Bookmark {
  id: string;
  novelId: string;
  novelTitle: string;
  chapterId: string;
  chapterTitle: string;
  paragraphIndex: number;
  paragraphText: string;
  color: BookmarkColor;
  createdAt: number;
}

// ============ Download Types ============

export interface DownloadedChapter {
  novelId: string;
  novelTitle: string;
  chapterId: string;
  chapterTitle: string;
  content: string;
  paragraphs: string[];
  downloadedAt: number;
  size: number;
}

export interface DownloadProgress {
  novelId: string;
  chapterId: string;
  status: "pending" | "downloading" | "completed" | "failed";
  progress: number;
}

export interface DownloadedNovel {
  novelId: string;
  novelTitle: string;
  coverImage: string;
  chapters: DownloadedChapter[];
  totalSize: number;
  downloadedAt: number;
}

// ============ Reading List Types ============

export interface ReadingList {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  novelIds: string[];
  createdAt: number;
  updatedAt: number;
}

// ============ Statistics Types ============

export interface ReadingSession {
  id: string;
  novelId: string;
  novelTitle: string;
  startTime: number;
  endTime: number;
  wordsRead: number;
  chaptersRead: number;
}

export interface ReadingStats {
  totalReadingTime: number; // in minutes
  totalWordsRead: number;
  totalChaptersRead: number;
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string;
  sessionsHistory: ReadingSession[];
}

// ============ Settings Types ============

export type ThemeMode = "light" | "dark" | "sepia";

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  theme: ThemeMode;
  keepScreenOn: boolean;
}

export interface AppSettings {
  reader: ReaderSettings;
  tts: TTSSettings;
  downloadOnWifiOnly: boolean;
  maxDownloadedChapters: number;
  maxStorageSize: number; // in MB
}

// ============ Navigation Types ============

export type RootStackParamList = {
  MainTabs: undefined;
  NovelInfo: { novelId: string };
  ChapterReader: {
    novelId: string;
    chapterId: string;
    novelTitle: string;
    chapterTitle: string;
    chapterIndex: number;
  };
  ListDetails: { listId: string };
  ReadingStats: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Lists: undefined;
  History: undefined;
  Settings: undefined;
};
