# Novel Reader - Comprehensive Project Guide

> **Purpose**: This document provides a complete understanding of the Novel Reader project architecture, API integration, current implementation issues, and recommendations for a performance-optimized remake.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [API Architecture](#api-architecture)
5. [Core Features & Implementation](#core-features--implementation)
6. [Data Models](#data-models)
7. [Custom Hooks](#custom-hooks)
8. [Utilities & Helpers](#utilities--helpers)
9. [Current Performance Issues](#current-performance-issues)
10. [Optimization Recommendations](#optimization-recommendations)
11. [Remake Strategy](#remake-strategy)

---

## Project Overview

Novel Reader is a **cross-platform mobile application** that allows users to:

- Discover and search for web novels from Novelhall.com
- Read novels with a customizable reading experience
- Listen to novels via Text-to-Speech (TTS)
- Download chapters for offline reading
- Track reading progress, statistics, and streaks
- Organize novels into custom reading lists
- Bookmark specific paragraphs with color coding

The app scrapes novel content from **Novelhall.com** through a Vercel-deployed API and presents it in a mobile-friendly reading interface.

---

## Technology Stack

| Category        | Technology              | Version |
| --------------- | ----------------------- | ------- |
| **Framework**   | React Native            | 0.81.5  |
| **Platform**    | Expo SDK                | 54      |
| **Language**    | TypeScript              | 5.9.2   |
| **Navigation**  | React Navigation        | 7.x     |
| **Storage**     | AsyncStorage            | 2.2.0   |
| **HTTP Client** | Axios                   | 1.13.2  |
| **TTS**         | Expo Speech             | 14.0.7  |
| **Lists**       | FlashList               | 2.2.0   |
| **File System** | Expo File System        | 19.0.19 |
| **Animations**  | React Native Reanimated | 4.1.1   |

---

## Project Structure

```
novel-reader/
├── src/
│   ├── api/                    # API integration layer
│   │   └── novelApi.ts         # All API calls (7.8 KB)
│   │
│   ├── components/             # 25 reusable UI components
│   │   ├── reader/             # Reader-specific components
│   │   ├── settings/           # Settings UI controls
│   │   ├── downloads/          # Download management UI
│   │   └── statistics/         # Data visualization
│   │
│   ├── constants/              # App-wide constants
│   │   ├── config.ts           # API URLs, default settings
│   │   ├── theme.ts            # Colors, typography, spacing
│   │   └── themes.ts           # Theme definitions (light/dark/sepia)
│   │
│   ├── contexts/               # React Context providers
│   │   ├── SettingsContext.tsx # User preferences state
│   │   └── ThemeContext.tsx    # Theme state management
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useBookmarks.ts     # Bookmark management
│   │   ├── useDebounce.ts      # Debouncing utility
│   │   ├── useDownloads.ts     # Download management
│   │   ├── useNovelData.ts     # API data fetching hooks
│   │   ├── useReadingLists.ts  # Reading list management
│   │   ├── useStatistics.ts    # Statistics tracking
│   │   └── useTTS.ts           # Text-to-Speech controls (8.7 KB)
│   │
│   ├── navigation/             # Navigation setup
│   │   ├── AppNavigator.tsx    # Stack navigator
│   │   └── MainTabNavigator.tsx # Bottom tab navigator
│   │
│   ├── screens/                # 10 screen components
│   │   ├── HomeScreen.tsx           # Home (12 KB)
│   │   ├── SearchScreen.tsx         # Search (3.7 KB)
│   │   ├── NovelInfoScreen.tsx      # Novel details (24.9 KB)
│   │   ├── ChapterReaderScreen.tsx  # Reader (38 KB) ⚠️ LARGEST
│   │   ├── DownloadsScreen.tsx      # Downloads (6.3 KB)
│   │   ├── HistoryScreen.tsx        # History (9.5 KB)
│   │   ├── ReadingListsScreen.tsx   # Lists (16.8 KB)
│   │   ├── ListDetailsScreen.tsx    # List details (7.6 KB)
│   │   ├── ReadingStatsScreen.tsx   # Statistics (11 KB)
│   │   └── SettingsScreen.tsx       # Settings (8.5 KB)
│   │
│   ├── types/                  # TypeScript definitions
│   │   ├── api.types.ts        # API response types
│   │   ├── bookmarks.types.ts  # Bookmark types
│   │   ├── downloads.types.ts  # Download types
│   │   ├── readingLists.types.ts
│   │   ├── settings.types.ts   # User settings types
│   │   └── statistics.types.ts # Statistics types
│   │
│   └── utils/                  # Utility modules
│       ├── apiCache.ts         # LRU cache for API (3.8 KB)
│       ├── downloadManager.ts  # Download system (13.5 KB)
│       ├── epubGenerator.ts    # EPUB export (5.4 KB)
│       ├── errorHandler.ts     # Error handling (6.6 KB)
│       ├── imageOptimizer.ts   # Image optimization (9.8 KB)
│       ├── performance.ts      # Performance monitoring (8.1 KB)
│       ├── statisticsManager.ts # Statistics (5.8 KB)
│       ├── storage.ts          # AsyncStorage wrapper (17.6 KB)
│       └── textParser.ts       # HTML parsing (7 KB)
│
├── App.tsx                     # Entry point
├── app.json                    # Expo configuration
├── package.json                # Dependencies
└── Understanding.md            # Previous documentation
```

---

## API Architecture

### Backend Source

The app fetches data from a **Vercel-deployed web scraper** that scrapes Novelhall.com:

```
Original API: https://novelhall.vercel.app
CORS Proxy:   https://corsproxy.io/
```

All requests are routed through the CORS proxy to bypass browser/mobile restrictions.

### API Client Configuration

```typescript
// src/api/novelApi.ts
const ORIGINAL_API_URL = "https://novelhall.vercel.app";
const CORS_PROXY = "https://corsproxy.io/?url=";

const api = axios.create({
  timeout: 30000, // 30 second timeout
  headers: { "Content-Type": "application/json" },
});

// Request interceptor wraps URL in CORS proxy
api.interceptors.request.use((config) => {
  const targetUrl = new URL(config.url || "", ORIGINAL_API_URL);
  config.url = `${CORS_PROXY}${encodeURIComponent(targetUrl.toString())}`;
  return config;
});
```

### API Endpoints

| Function                         | Method | Endpoint                                 | Description                          |
| -------------------------------- | ------ | ---------------------------------------- | ------------------------------------ |
| `getHomeData()`                  | GET    | `/api/home`                              | Recommended novels + latest releases |
| `searchNovels(keyword)`          | GET    | `/api/search?keyword={keyword}`          | Search by keyword                    |
| `getNovelInfo(novelId)`          | GET    | `/api/info/{novelId}`                    | Novel metadata + chapter list        |
| `getChapter(novelId, chapterId)` | GET    | `/api/chapter/x?novelId={}&chapterId={}` | Chapter content                      |

### API Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
```

### Caching Layer

The app implements an **LRU (Least Recently Used) in-memory cache**:

```typescript
// src/utils/apiCache.ts
class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100; // Max 100 entries
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
}

// Cache TTL configurations
const CacheTTL = {
  homeData: 10 * 60 * 1000, // 10 minutes
  novelInfo: 30 * 60 * 1000, // 30 minutes
  chapter: 24 * 60 * 60 * 1000, // 24 hours (content never changes)
  search: 5 * 60 * 1000, // 5 minutes
};
```

---

## Core Features & Implementation

### 1. Home Screen

**File**: `src/screens/HomeScreen.tsx` (336 lines)

- Displays recommended novels in a horizontal scroll
- Shows latest releases
- "Continue Reading" section from last read position
- Pull-to-refresh functionality

### 2. Search

**File**: `src/screens/SearchScreen.tsx` (110 lines)

- Keyword-based search with debouncing
- Displays results with cover images, genres, authors

### 3. Novel Info Screen

**File**: `src/screens/NovelInfoScreen.tsx` (700+ lines)

- Novel metadata display (cover, title, author, description)
- Chapter list (can be 1000+ chapters)
- Download chapters functionality
- Add to reading lists
- Start/continue reading buttons

### 4. Chapter Reader ⚠️ CRITICAL COMPONENT

**File**: `src/screens/ChapterReaderScreen.tsx` (1019 lines)

The largest and most complex component:

- Displays chapter content with customizable font/theme
- Paragraph-level progress tracking
- Bookmark toggling on individual paragraphs
- TTS integration with auto-scroll
- Focus mode (highlights current paragraph)
- Chapter navigation (prev/next)
- Infinite scroll for continuous reading
- Layout measurements for scroll position tracking

### 5. Text-to-Speech (TTS)

**File**: `src/hooks/useTTS.ts` (258 lines)

- Uses Expo Speech API
- Configurable pitch (0.5 - 2.0) and speed (1.0 - 5.0)
- Paragraph-by-paragraph reading
- Auto-advance to next paragraph on completion
- Skip between paragraphs and chapters
- Voice selection support

### 6. Offline Downloads

**File**: `src/utils/downloadManager.ts` (429 lines)

- Download queue with max 3 concurrent downloads
- Storage limits: 500 chapters max, 100MB total
- LRU cleanup of old downloads
- Download statistics tracking

### 7. Bookmarks

**File**: `src/hooks/useBookmarks.ts` (130 lines)

- Color-coded bookmarks (yellow, green, blue, red, purple)
- Attached to specific paragraphs within chapters
- Persisted via AsyncStorage

### 8. Reading Statistics

**File**: `src/utils/statisticsManager.ts` (180 lines)

- Tracks: reading time, words read, chapters completed
- Daily streaks with longest streak records
- Session history logging

### 9. Reading Lists

**File**: `src/hooks/useReadingLists.ts` (160 lines)

- Custom user-created lists
- Add/remove novels from lists
- List metadata (name, description, cover)

---

## Data Models

### Novel

```typescript
interface Novel {
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
```

### Chapter

```typescript
interface Chapter {
  id: string;
  title: string;
  url: string;
}
```

### Chapter Content

```typescript
interface ChapterContent {
  id: string;
  title: string;
  content: string; // Raw HTML from scraper
  novelId: string;
  novelTitle: string;
  navigation: {
    prev: { id: string; url: string } | null;
    next: { id: string; url: string } | null;
  };
}
```

### Reading Progress

```typescript
interface ReadingProgress {
  novelId: string;
  chapterId: string;
  chapterTitle?: string;
  novelTitle?: string;
  paragraphIndex: number;
  scrollPosition: number;
  timestamp: number;
}
```

### TTS Settings

```typescript
interface TTSSettings {
  pitch: number; // 0.5 - 2.0
  speed: number; // 1.0 - 5.0
  selectedVoiceIdentifier?: string;
  autoScrollEnabled: boolean;
  focusEnabled: boolean;
}
```

### Downloaded Chapter

```typescript
interface DownloadedChapter {
  novelId: string;
  novelTitle: string;
  chapterId: string;
  chapterTitle: string;
  content: string;
  paragraphs: string[];
  downloadedAt: number;
  size: number;
}
```

---

## Custom Hooks

| Hook                             | File               | Purpose                                         |
| -------------------------------- | ------------------ | ----------------------------------------------- |
| `useHomeData()`                  | useNovelData.ts    | Fetch home page data with loading/error states  |
| `useSearch()`                    | useNovelData.ts    | Search novels with debouncing                   |
| `useNovelInfo(id)`               | useNovelData.ts    | Fetch novel details + chapters                  |
| `useChapter(novelId, chapterId)` | useNovelData.ts    | Fetch chapter content                           |
| `useTTS()`                       | useTTS.ts          | Full TTS controls (play, pause, skip, settings) |
| `useBookmarks()`                 | useBookmarks.ts    | CRUD operations for bookmarks                   |
| `useDownloads()`                 | useDownloads.ts    | Download queue management                       |
| `useReadingLists()`              | useReadingLists.ts | Reading list CRUD                               |
| `useStatistics()`                | useStatistics.ts   | Statistics tracking interface                   |
| `useDebounceCallback()`          | useDebounce.ts     | Debounce utility for callbacks                  |

---

## Utilities & Helpers

### Text Parser (`textParser.ts`)

Handles HTML content from the scraper:

```typescript
// Convert HTML to plain text
stripHtml(html: string): string

// Split into paragraphs for TTS
splitIntoParagraphs(text: string): string[]

// Clean text for speech synthesis
cleanForTTS(text: string): string

// Full parsing pipeline with caching
parseChapterContent(htmlContent: string): ParsedChapterContent
```

### Storage (`storage.ts`)

Wrapper around AsyncStorage for:

- Reading progress persistence
- User settings
- History tracking
- Generic key-value storage with type safety

### Download Manager (`downloadManager.ts`)

- Queue-based download system
- Concurrent download limiting
- Storage quota management
- Automatic cleanup

---

## Current Performance Issues

### ⚠️ Critical Issues

#### 1. **ChapterReaderScreen is Monolithic** (38 KB, 1019 lines)

- Too much logic in a single component
- Re-renders entire component on any state change
- Layout measurements cause excessive re-renders
- Memoization is insufficient

#### 2. **CORS Proxy Latency**

- Every API request goes through `corsproxy.io`
- Adds 200-500ms latency per request
- No fallback if proxy is slow/down

#### 3. **Synchronous Text Parsing**

- `parseChapterContent()` runs on main thread
- Large chapters (10,000+ words) cause UI freezes
- Performance monitoring wrapper adds overhead

#### 4. **Inefficient List Rendering**

- Novel info screen renders 1000+ chapters at once
- No virtualization in some lists
- Heavy use of inline styles recreated every render

#### 5. **AsyncStorage Bottlenecks**

- `storage.ts` is 17.6 KB with complex operations
- Multiple sequential AsyncStorage calls
- No batching of related operations

#### 6. **Memory Leaks in TTS**

- Speech event listeners not always cleaned up
- Refs accumulate without proper cleanup
- Multiple speech instances can exist simultaneously

#### 7. **Excessive Hook Dependencies**

- Many useEffect hooks with complex dependency arrays
- Hooks re-run more often than necessary
- State updates trigger cascading re-renders

#### 8. **No Background Thread Processing**

- Heavy computations block UI thread
- Image loading not optimized
- No web workers or native modules for heavy tasks

### 🔍 Identified Problem Areas

| Component           | Issue                                       | Severity    |
| ------------------- | ------------------------------------------- | ----------- |
| ChapterReaderScreen | Monolithic, too many responsibilities       | 🔴 Critical |
| textParser.ts       | Synchronous parsing on main thread          | 🔴 Critical |
| storage.ts          | Too many AsyncStorage calls                 | 🟠 High     |
| useTTS.ts           | Complex state management, memory leaks      | 🟠 High     |
| NovelInfoScreen     | Renders all chapters without virtualization | 🟠 High     |
| apiCache.ts         | Memory-only cache, lost on restart          | 🟡 Medium   |
| CORS Proxy          | Single point of failure, added latency      | 🟡 Medium   |

---

## Optimization Recommendations

### 1. Split ChapterReaderScreen

```
ChapterReaderScreen/
├── index.tsx           # Main orchestrator (minimal logic)
├── ChapterContent.tsx  # Content display
├── TTSControls.tsx     # TTS UI
├── NavigationBar.tsx   # Prev/Next chapter
├── ProgressTracker.tsx # Scroll/paragraph tracking
└── hooks/
    ├── useChapterScroll.ts
    ├── useChapterTTS.ts
    └── useChapterProgress.ts
```

### 2. Move Parsing Off Main Thread

- Use `react-native-worklet` or similar for background parsing
- Pre-parse downloaded chapters during download
- Lazy parse only visible content

### 3. Implement Persistent Cache

- Use SQLite or MMKV instead of AsyncStorage
- Cache API responses to disk with expiry
- Reduce network calls significantly

### 4. Virtualize All Lists

- Use FlashList everywhere (already in dependencies)
- Implement proper `getItemLayout` for consistent item heights
- Paginate chapter lists (load 50 at a time)

### 5. Optimize TTS

- Singleton speech manager
- Pre-process upcoming paragraphs
- Better cleanup of event listeners

### 6. Reduce Re-renders

- Use `useMemo` and `useCallback` consistently
- Extract inline styles to StyleSheet
- Use React.memo with proper comparison functions

### 7. Batch Storage Operations

- Group related AsyncStorage operations
- Use MMKV for synchronous access where needed
- Implement write-behind caching

---

## Remake Strategy

### Phase 1: Foundation

1. Set up new project with latest Expo SDK
2. Implement proper state management (Zustand or Jotai)
3. Create modular component architecture
4. Set up MMKV or SQLite for storage

### Phase 2: Core Features

1. API layer with persistent caching
2. Novel browsing (Home, Search)
3. Novel info with virtualized chapter list
4. Basic chapter reading

### Phase 3: Enhanced Reading

1. Optimized chapter reader (split components)
2. Background text parsing
3. Efficient progress tracking
4. Bookmark system

### Phase 4: TTS & Downloads

1. Refactored TTS with singleton manager
2. Download system with better queue
3. Offline reading support

### Phase 5: Polish

1. Reading statistics
2. Reading lists
3. Settings & themes
4. Performance profiling & optimization

### Recommended New Stack

| Current            | Recommended                   | Reason                          |
| ------------------ | ----------------------------- | ------------------------------- |
| AsyncStorage       | MMKV                          | 10x faster, synchronous         |
| useState/useEffect | Zustand                       | Simpler state, fewer re-renders |
| Axios              | fetch + TanStack Query        | Built-in caching, deduplication |
| Custom cache       | TanStack Query                | Automatic cache management      |
| React.memo         | React Compiler (Expo SDK 54+) | Automatic memoization           |

---

## Quick Reference: API Calls

```typescript
import {
  getHomeData, // Home page data
  searchNovels, // Search
  getNovelInfo, // Novel + chapters
  getChapter, // Chapter content
} from "./api/novelApi";

// Example usage
const homeData = await getHomeData();
const results = await searchNovels("martial");
const novelInfo = await getNovelInfo("martial-god-asura-123");
const chapter = await getChapter("martial-god-asura-123", "16660080");
```

---

## File Size Analysis (Largest First)

| File                    | Size    | Lines | Notes                     |
| ----------------------- | ------- | ----- | ------------------------- |
| ChapterReaderScreen.tsx | 38 KB   | 1019  | ⚠️ Needs splitting        |
| NovelInfoScreen.tsx     | 24.9 KB | ~700  | Heavy chapter list        |
| storage.ts              | 17.6 KB | ~500  | Too many responsibilities |
| ReadingListsScreen.tsx  | 16.8 KB | ~450  | Could be simplified       |
| downloadManager.ts      | 13.5 KB | 429   | Complex but necessary     |
| HomeScreen.tsx          | 12 KB   | 336   | Reasonable                |
| ReadingStatsScreen.tsx  | 11 KB   | ~300  | Reasonable                |
| imageOptimizer.ts       | 9.8 KB  | ~280  | Review necessity          |
| HistoryScreen.tsx       | 9.5 KB  | ~270  | Reasonable                |
| useTTS.ts               | 8.7 KB  | 258   | Complex state             |

---

## Conclusion

The Novel Reader app has solid features but suffers from:

1. **Monolithic components** that are hard to maintain and optimize
2. **Synchronous heavy operations** blocking the UI
3. **Inefficient storage patterns** with too many async calls
4. **Added latency** from CORS proxy dependency

A remake should focus on:

- **Modular architecture** with single-responsibility components
- **Background processing** for heavy operations
- **Modern state management** to reduce re-renders
- **Faster storage** with MMKV or SQLite
- **Built-in caching** with TanStack Query

This guide should serve as both documentation for the current implementation and a roadmap for building a faster, more maintainable version.
