// Novel Reader - Chapter Reader Screen (Modular Orchestrator)

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ChapterContent as ChapterContentType } from '../../types';
import { useChapter, useNovelInfo } from '../../api/queries';
import { fetchChapter } from '../../api/client';
import { useSettingsStore } from '../../stores/settingsStore';
import { useReaderStore } from '../../stores/readerStore';
import { themes, spacing } from '../../constants/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorView from '../../components/ErrorView';
import ChapterContent, { ChapterContentRef } from './ChapterContent';
import NavigationBar from './NavigationBar';
import TTSControls from './TTSControls';
import ProgressTracker from './ProgressTracker';
import { useTTS } from '../../hooks/useTTS';
import { useChapterProgress } from '../../hooks/useChapterProgress';
import { parseChapterContent } from '../../utils/textParser';

type RouteProps = RouteProp<RootStackParamList, 'ChapterReader'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ChapterReaderScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { novelId, chapterId, novelTitle, chapterTitle, chapterIndex, coverImage } =
    route.params;

  // Settings and stores
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;
  const setProgress = useReaderStore((state) => state.setProgress);
  const addToHistory = useReaderStore((state) => state.addToHistory);

  // UI State
  const [showControls, setShowControls] = useState(true);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const contentRef = useRef<ChapterContentRef>(null);

  // Chapters Buffer
  const [loadedChapters, setLoadedChapters] = useState<ChapterContentType[]>([]);

  // Parse all paragraphs from all loaded chapters
  const allParagraphs = useMemo(() => {
    return loadedChapters.flatMap(ch => parseChapterContent(ch.content).paragraphs);
  }, [loadedChapters]);

  // Fetch initial chapter
  const { data: initialChapter, isLoading, isError, error, refetch } = useChapter(
    novelId,
    chapterId
  );

  // Initialize buffer with first chapter
  useEffect(() => {
    if (initialChapter && loadedChapters.length === 0) {
      setLoadedChapters([initialChapter]);
    }
  }, [initialChapter, loadedChapters.length]);

  // TTS Hook
  const {
    isPlaying,
    isPaused,
    currentIndex,
    speak,
    pause,
    resume,
    stop,
    skipNext,
    skipPrevious,
    updateParagraphs,
  } = useTTS({
    paragraphs: allParagraphs,
    onParagraphChange: setCurrentParagraph,
    onComplete: handleTTSComplete,
  });

  // Keep TTS in sync with growth
  useEffect(() => {
    updateParagraphs(allParagraphs);
  }, [allParagraphs, updateParagraphs]);

  // Determine current active chapter index (for title)
  // This is a simplified version; in a production app you'd track visibility
  const activeChapter = useMemo(() => {
    // Basic logic: if we have multiple chapters, find which one the current paragraph belongs to
    let count = 0;
    for (const ch of loadedChapters) {
      const paras = parseChapterContent(ch.content).paragraphs;
      if (currentParagraph >= count && currentParagraph < count + paras.length) {
        return ch;
      }
      count += paras.length;
    }
    return loadedChapters[0] || initialChapter;
  }, [loadedChapters, currentParagraph, initialChapter]);

  // Reading Progress Hook
  const { saveProgress } = useChapterProgress({
    novelId,
    novelTitle,
    chapterId: activeChapter?.id || chapterId,
    chapterTitle: activeChapter?.title || chapterTitle,
    chapterIndex: activeChapter ? (loadedChapters.indexOf(activeChapter) + (route.params.chapterIndex || 0)) : (route.params.chapterIndex || 0),
    currentParagraph: currentParagraph, // Needs to be local to the chapter ideally
    coverImage,
  });

  // Save on unmount
  useEffect(() => {
    return () => {
      saveProgress();
      stop();
    };
  }, [saveProgress, stop]);

  // Toggle controls visibility
  const toggleControls = useCallback(() => {
    const toValue = showControls ? 0 : 1;
    Animated.timing(controlsOpacity, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setShowControls(!showControls);
  }, [showControls, controlsOpacity]);

  // Fetch novel info for better navigation
  const { data: novelInfo } = useNovelInfo(novelId);

  // Navigation handlers
  const loadAdjacentChapter = useCallback(async (nav: { id: string; title?: string } | null, position: 'end' | 'top') => {
    if (!nav || isNavigating) return;
    
    // Check if already loaded
    if (loadedChapters.some(c => c.id === nav.id)) return;

    setIsNavigating(true);
    try {
      // Use queryClient or direct fetch
      // For simplicity, we can't use useChapter hook here dynamically
      // We would ideally have a service or a way to fetch without the hook
      // But let's use navigation for now IF it's a huge shift, 
      // OR just implement the continuous load-down.
      
      // Since the user wants IT TO BE CONTINUOUS and NO RELOAD
      // and my updateParagraphs logic is ready:
      
      const response = await fetchChapter(novelId, nav.id);
      if (response) {
        if (position === 'end') {
          setLoadedChapters(prev => [...prev, response]);
        } else {
          setLoadedChapters(prev => [response, ...prev]);
        }
      }
    } catch (err) {
      console.error('Failed to load continuous chapter:', err);
    } finally {
      setIsNavigating(false);
    }
  }, [novelId, isNavigating, loadedChapters]);

  const handleNextChapter = useCallback(() => {
    // Find what is next relative to the LAST loaded chapter
    const lastChapter = loadedChapters[loadedChapters.length - 1];
    if (!lastChapter || !novelInfo?.chapters) return;
    
    const idx = novelInfo.chapters.findIndex(c => c.id === lastChapter.id);
    if (idx !== -1 && idx < novelInfo.chapters.length - 1) {
      loadAdjacentChapter(novelInfo.chapters[idx + 1], 'end');
    }
  }, [loadedChapters, novelInfo?.chapters, loadAdjacentChapter]);

  const handlePrevChapter = useCallback(() => {
    // For now, infinite scroll down is higher priority
    // Navigation for up can still use the traditional way or same logic
     const firstChapter = loadedChapters[0];
     if (!firstChapter || !novelInfo?.chapters) return;
     
     const idx = novelInfo.chapters.findIndex(c => c.id === firstChapter.id);
     if (idx > 0) {
       loadAdjacentChapter(novelInfo.chapters[idx - 1], 'top');
     }
  }, [loadedChapters, novelInfo?.chapters, loadAdjacentChapter]);

  function handleTTSComplete() {
    handleNextChapter();
  }

  const handleStartFromHere = useCallback(() => {
    if (contentRef.current) {
      const index = contentRef.current.getTopVisibleIndex();
      speak(index);
    }
  }, [speak]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    saveProgress();
    stop();
    navigation.goBack();
  }, [navigation, saveProgress, stop]);

  if (isLoading && loadedChapters.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.readerBackground }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <LoadingSpinner message="Loading chapter..." fullScreen />
      </View>
    );
  }

  if (isError && loadedChapters.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.readerBackground }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <ErrorView message={error?.message || 'Failed to load chapter'} onRetry={refetch} fullScreen />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.readerBackground }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Navigation Bar */}
      <Animated.View style={[styles.navBar, { opacity: controlsOpacity, pointerEvents: showControls ? 'auto' : 'none' }]}>
        <NavigationBar
          title={activeChapter?.title || chapterTitle}
          chapterIndex={activeChapter ? (loadedChapters.indexOf(activeChapter) + (route.params.chapterIndex || 0)) : (route.params.chapterIndex || 0)}
          onBack={handleBack}
          onPrev={handlePrevChapter}
          onNext={handleNextChapter}
        />
      </Animated.View>

      {/* Chapter Content */}
      <ChapterContent
        ref={contentRef}
        paragraphs={allParagraphs}
        currentParagraph={isPlaying || isPaused ? currentIndex : -1}
        onPress={toggleControls}
        onScrollReachEnd={handleNextChapter}
        onScrollReachTop={handlePrevChapter}
        onParagraphPress={(index) => {
          if (isPlaying || isPaused) { toggleControls(); return; }
          setCurrentParagraph(index);
          toggleControls();
        }}
      />

      {/* Progress Tracker */}
      <View style={styles.progressContainer}>
         <ProgressTracker
           currentParagraph={isPlaying || isPaused ? currentIndex : currentParagraph}
           totalParagraphs={allParagraphs.length}
         />
      </View>

      {/* TTS Controls */}
      <Animated.View style={[styles.ttsControls, { opacity: controlsOpacity, pointerEvents: showControls ? 'auto' : 'none' }]}>
        <TTSControls
          isPlaying={isPlaying}
          isPaused={isPaused}
          onPlay={() => speak(currentParagraph)}
          onPause={pause}
          onResume={resume}
          onStop={stop}
          onSkipNext={skipNext}
          onSkipPrevious={skipPrevious}
          currentParagraph={isPlaying || isPaused ? currentIndex + 1 : currentParagraph + 1}
          totalParagraphs={allParagraphs.length}
          onStartFromHere={handleStartFromHere}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  ttsControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
});
