# Novel Reader Remake - Task Tracker

## Overview

Recreating the Novel Reader Expo app with optimized architecture following the GUIDE.md recommendations.

---

## Phase 1: Foundation

- [ ] Initialize new Expo SDK 54 project with TypeScript
- [ ] Set up MMKV for fast synchronous storage
- [ ] Configure Zustand for state management
- [ ] Install core dependencies (TanStack Query, FlashList, Expo Speech, etc.)
- [ ] Create modular project structure

## Phase 2: Core Architecture

- [ ] Set up API layer with TanStack Query caching
- [ ] Create type definitions (Novel, Chapter, Settings, etc.)
- [ ] Implement theme system (light/dark/sepia)
- [ ] Configure navigation (stack + tabs)

## Phase 3: Screens - Browsing

- [ ] HomeScreen - recommendations + latest + continue reading
- [ ] SearchScreen - debounced search with results
- [ ] NovelInfoScreen - virtualized chapter list

## Phase 4: Chapter Reader (Modular)

- [ ] ChapterReaderScreen index (orchestrator)
- [ ] ChapterContent component
- [ ] TTSControls component
- [ ] NavigationBar component
- [ ] ProgressTracker component
- [ ] Reader-specific hooks

## Phase 5: TTS System

- [ ] Singleton TTS manager
- [ ] useTTS hook with proper cleanup
- [ ] Configurable pitch/speed settings
- [ ] Auto-advance functionality

## Phase 6: Downloads & Offline

- [ ] Download manager with queue
- [ ] DownloadsScreen
- [ ] Offline reading support

## Phase 7: User Features

- [ ] Bookmarks system
- [ ] Reading lists
- [ ] Reading statistics
- [ ] History tracking

## Phase 8: Settings & Polish

- [ ] SettingsScreen
- [ ] Theme customization
- [ ] Performance profiling
- [ ] Final testing
