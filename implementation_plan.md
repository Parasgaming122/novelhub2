# Novel Reader - Optimized Remake Implementation Plan

> **Goal**: Rebuild the Novel Reader Expo app with a modern, performance-optimized architecture following the recommendations in GUIDE.md.

---

## Key Improvements Over Original

| Aspect      | Original                   | New Implementation                   |
| ----------- | -------------------------- | ------------------------------------ |
| **Storage** | AsyncStorage (slow, async) | MMKV (10x faster, sync)              |
| **State**   | useState/useEffect chains  | Zustand (simpler, fewer re-renders)  |
| **API**     | Axios + custom cache       | TanStack Query (auto-caching)        |
| **Reader**  | Monolithic 1019-line file  | Modular components (~200 lines each) |
| **Lists**   | Mixed virtualization       | FlashList everywhere                 |

---

## User Review Required

> [!IMPORTANT]
> This is a complete rewrite of the project. The existing files in the workspace will be replaced with the new optimized implementation.

> [!NOTE]
> The app scrapes content from Novelhall.com through a Vercel-deployed API. The API endpoints remain the same as documented in the guide.

---

## Proposed Changes

### Phase 1: Foundation

#### [NEW] [package.json](file:///c:/Users/Paras/Desktop/novel/package.json)

Project configuration with optimized dependencies:

- Expo SDK 54
- MMKV for storage
- Zustand for state management
- TanStack Query for API caching
- FlashList for virtualized lists

#### [NEW] [app.json](file:///c:/Users/Paras/Desktop/novel/app.json)

Expo configuration for Novel Reader app.

#### [NEW] [App.tsx](file:///c:/Users/Paras/Desktop/novel/App.tsx)

Entry point with providers (Query, Theme, Settings).

---

### Phase 2: Core Architecture

#### [NEW] [src/types/index.ts](file:///c:/Users/Paras/Desktop/novel/src/types/index.ts)

Consolidated type definitions:

- `Novel`, `Chapter`, `ChapterContent`
- `ReadingProgress`, `Bookmark`
- `TTSSettings`, `ReaderSettings`
- `DownloadedChapter`, `ReadingList`

#### [NEW] [src/api/client.ts](file:///c:/Users/Paras/Desktop/novel/src/api/client.ts)

API client with CORS proxy handling:

- Base URL configuration
- Request/response interceptors
- Error handling

#### [NEW] [src/api/queries.ts](file:///c:/Users/Paras/Desktop/novel/src/api/queries.ts)

TanStack Query hooks:

- `useHomeData()` - cached 10 minutes
- `useSearchNovels()` - cached 5 minutes
- `useNovelInfo()` - cached 30 minutes
- `useChapter()` - cached 24 hours

#### [NEW] [src/stores/settingsStore.ts](file:///c:/Users/Paras/Desktop/novel/src/stores/settingsStore.ts)

Zustand store for user settings with MMKV persistence.

#### [NEW] [src/stores/readerStore.ts](file:///c:/Users/Paras/Desktop/novel/src/stores/readerStore.ts)

Zustand store for reader state (progress, bookmarks).

#### [NEW] [src/constants/theme.ts](file:///c:/Users/Paras/Desktop/novel/src/constants/theme.ts)

Theme definitions (light, dark, sepia) with colors, typography, spacing.

---

### Phase 3: Navigation

#### [NEW] [src/navigation/AppNavigator.tsx](file:///c:/Users/Paras/Desktop/novel/src/navigation/AppNavigator.tsx)

Stack navigator for screen navigation.

#### [NEW] [src/navigation/MainTabNavigator.tsx](file:///c:/Users/Paras/Desktop/novel/src/navigation/MainTabNavigator.tsx)

Bottom tab navigator (Home, Search, Lists, Settings).

---

### Phase 4: Browsing Screens

#### [NEW] [src/screens/HomeScreen.tsx](file:///c:/Users/Paras/Desktop/novel/src/screens/HomeScreen.tsx)

- Recommended novels carousel
- Latest releases
- Continue reading section
- Pull-to-refresh

#### [NEW] [src/screens/SearchScreen.tsx](file:///c:/Users/Paras/Desktop/novel/src/screens/SearchScreen.tsx)

- Debounced search input
- Virtualized results list
- Loading/error states

#### [NEW] [src/screens/NovelInfoScreen.tsx](file:///c:/Users/Paras/Desktop/novel/src/screens/NovelInfoScreen.tsx)

- Novel metadata display
- **Virtualized chapter list** (handles 1000+ chapters efficiently)
- Download and reading list actions

---

### Phase 5: Modular Chapter Reader

Split the monolithic reader into focused components:

#### [NEW] [src/screens/ChapterReaderScreen/index.tsx](file:///c:/Users/Paras/Desktop/novel/src/screens/ChapterReaderScreen/index.tsx)

Main orchestrator (~200 lines) - coordinates components.

#### [NEW] [src/screens/ChapterReaderScreen/ChapterContent.tsx](file:///c:/Users/Paras/Desktop/novel/src/screens/ChapterReaderScreen/ChapterContent.tsx)

Content display with paragraph rendering.

#### [NEW] [src/screens/ChapterReaderScreen/TTSControls.tsx](file:///c:/Users/Paras/Desktop/novel/src/screens/ChapterReaderScreen/TTSControls.tsx)

TTS playback controls UI.

#### [NEW] [src/screens/ChapterReaderScreen/NavigationBar.tsx](file:///c:/Users/Paras/Desktop/novel/src/screens/ChapterReaderScreen/NavigationBar.tsx)

Previous/Next chapter navigation.

#### [NEW] [src/screens/ChapterReaderScreen/ProgressTracker.tsx](file:///c:/Users/Paras/Desktop/novel/src/screens/ChapterReaderScreen/ProgressTracker.tsx)

Scroll and paragraph progress tracking.

#### [NEW] [src/hooks/useChapterProgress.ts](file:///c:/Users/Paras/Desktop/novel/src/hooks/useChapterProgress.ts)

Reading progress management hook.

---

### Phase 6: TTS System

#### [NEW] [src/services/TTSManager.ts](file:///c:/Users/Paras/Desktop/novel/src/services/TTSManager.ts)

Singleton TTS manager:

- Expo Speech wrapper
- Proper event listener cleanup
- Queue management

#### [NEW] [src/hooks/useTTS.ts](file:///c:/Users/Paras/Desktop/novel/src/hooks/useTTS.ts)

Simplified TTS hook:

- Play/pause/stop
- Skip paragraph/chapter
- Settings (pitch, speed)
- Auto-scroll integration

---

### Phase 7: Downloads

#### [NEW] [src/services/DownloadManager.ts](file:///c:/Users/Paras/Desktop/novel/src/services/DownloadManager.ts)

Download manager with:

- Queue with max 3 concurrent
- MMKV storage for downloads
- LRU cleanup

#### [NEW] [src/screens/DownloadsScreen.tsx](file:///c:/Users/Paras/Desktop/novel/src/screens/DownloadsScreen.tsx)

Downloaded novels and chapters management.

---

### Phase 8: User Features

#### [NEW] [src/hooks/useBookmarks.ts](file:///c:/Users/Paras/Desktop/novel/src/hooks/useBookmarks.ts)

Bookmark CRUD with color coding.

#### [NEW] [src/screens/ReadingListsScreen.tsx](file:///c:/Users/Paras/Desktop/novel/src/screens/ReadingListsScreen.tsx)

Custom reading lists management.

#### [NEW] [src/screens/ReadingStatsScreen.tsx](file:///c:/Users/Paras/Desktop/novel/src/screens/ReadingStatsScreen.tsx)

Statistics dashboard.

#### [NEW] [src/screens/HistoryScreen.tsx](file:///c:/Users/Paras/Desktop/novel/src/screens/HistoryScreen.tsx)

Reading history with resume options.

#### [NEW] [src/screens/SettingsScreen.tsx](file:///c:/Users/Paras/Desktop/novel/src/screens/SettingsScreen.tsx)

App settings and theme selection.

---

### Shared Components

#### [NEW] [src/components/NovelCard.tsx](file:///c:/Users/Paras/Desktop/novel/src/components/NovelCard.tsx)

Reusable novel display card.

#### [NEW] [src/components/ChapterListItem.tsx](file:///c:/Users/Paras/Desktop/novel/src/components/ChapterListItem.tsx)

Chapter list item with download indicator.

#### [NEW] [src/components/LoadingSpinner.tsx](file:///c:/Users/Paras/Desktop/novel/src/components/LoadingSpinner.tsx)

Loading state indicator.

#### [NEW] [src/components/ErrorView.tsx](file:///c:/Users/Paras/Desktop/novel/src/components/ErrorView.tsx)

Error state with retry.

---

## Verification Plan

### Automated Tests

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Type checking
npx tsc --noEmit
```

### Manual Verification

1. **Home Screen**: Verify novels load and display correctly
2. **Search**: Test debounced search functionality
3. **Novel Info**: Ensure virtualized chapter list scrolls smoothly
4. **Reader**: Test chapter loading, paragraph rendering
5. **TTS**: Verify play/pause, skip, and settings work
6. **Downloads**: Test download queue and offline reading
7. **Theme**: Test light/dark/sepia themes

---

## Project Structure (Final)

```
novel/
├── App.tsx
├── app.json
├── package.json
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   └── queries.ts
│   ├── components/
│   │   ├── ChapterListItem.tsx
│   │   ├── ErrorView.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── NovelCard.tsx
│   ├── constants/
│   │   └── theme.ts
│   ├── hooks/
│   │   ├── useBookmarks.ts
│   │   ├── useChapterProgress.ts
│   │   └── useTTS.ts
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── MainTabNavigator.tsx
│   ├── screens/
│   │   ├── ChapterReaderScreen/
│   │   │   ├── index.tsx
│   │   │   ├── ChapterContent.tsx
│   │   │   ├── TTSControls.tsx
│   │   │   ├── NavigationBar.tsx
│   │   │   └── ProgressTracker.tsx
│   │   ├── DownloadsScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── NovelInfoScreen.tsx
│   │   ├── ReadingListsScreen.tsx
│   │   ├── ReadingStatsScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/
│   │   ├── DownloadManager.ts
│   │   └── TTSManager.ts
│   ├── stores/
│   │   ├── readerStore.ts
│   │   └── settingsStore.ts
│   └── types/
│       └── index.ts
└── GUIDE.md
```
