# Novel Reader Remake - Task Tracker

## Overview

Recreating the Novel Reader Expo app with optimized architecture following the GUIDE.md recommendations.

---

## Phase 1: Foundation

- [x] Initialize new Expo SDK 54 project with TypeScript
- [x] Set up MMKV for fast synchronous storage
- [x] Configure Zustand for state management
- [x] Install core dependencies (TanStack Query, FlashList, Expo Speech, etc.)
- [x] Create modular project structure

## Phase 2: Core Architecture

- [x] Set up API layer with TanStack Query caching
- [x] Create type definitions (Novel, Chapter, Settings, etc.)
- [x] Implement theme system (light/dark/sepia)
- [x] Configure navigation (stack + tabs)

## Phase 3: Screens - Browsing

- [x] HomeScreen - recommendations + latest + continue reading
- [x] SearchScreen - debounced search with results
- [x] NovelInfoScreen - virtualized chapter list

## Phase 4: Chapter Reader (Modular)

- [x] ChapterReaderScreen index (orchestrator)
- [x] ChapterContent component
- [x] TTSControls component
- [x] NavigationBar component
- [x] ProgressTracker component
- [x] Reader-specific hooks

## Phase 5: TTS System

- [x] Singleton TTS manager
- [x] useTTS hook with proper cleanup
- [x] Configurable pitch/speed settings
- [x] Auto-advance functionality

## Phase 6: Downloads & Offline

- [x] Download manager with queue
- [x] DownloadsScreen
- [x] Offline reading support (prioritizing local storage)

## Phase 7: User Features

- [x] Bookmarks system
- [x] Reading lists (with picker modal)
- [x] Reading statistics dashboard
- [x] History tracking

## Phase 8: Settings & Polish

- [x] SettingsScreen (Reader, TTS, Storage settings)
- [x] Theme customization
- [x] Performance profiling (MMKV vs AsyncStorage fallback)
- [x] Final testing
