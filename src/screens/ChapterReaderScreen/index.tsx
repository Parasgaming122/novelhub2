// Novel Reader - Chapter Reader Screen (Modular Orchestrator)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useChapter } from '../../api/queries';
import { useSettingsStore } from '../../stores/settingsStore';
import { useReaderStore } from '../../stores/readerStore';
import { themes } from '../../constants/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorView from '../../components/ErrorView';
import ChapterContent from './ChapterContent';
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
  const { novelId, chapterId, novelTitle, chapterTitle, chapterIndex } =
    route.params;

  // Settings and stores
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;
  const setProgress = useReaderStore((state) => state.setProgress);
  const addToHistory = useReaderStore((state) => state.addToHistory);

  // UI State
  const [showControls, setShowControls] = useState(true);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const controlsOpacity = useRef(new Animated.Value(1)).current;

  // Fetch chapter content
  const { data, isLoading, isError, error, refetch } = useChapter(
    novelId,
    chapterId
  );

  // Parse content into paragraphs
  const parsedContent = React.useMemo(() => {
    if (!data?.content) return { paragraphs: [], wordCount: 0 };
    return parseChapterContent(data.content);
  }, [data?.content]);

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
  } = useTTS({
    paragraphs: parsedContent.paragraphs,
    onParagraphChange: setCurrentParagraph,
    onComplete: handleTTSComplete,
  });

  // Reading Progress Hook
  const { saveProgress } = useChapterProgress({
    novelId,
    novelTitle,
    chapterId,
    chapterTitle,
    chapterIndex,
    currentParagraph,
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

  // Handle chapter navigation
  const navigateToChapter = useCallback(
    (nav: { id: string; url: string } | null, delta: number) => {
      if (!nav) return;
      stop();
      saveProgress();
      navigation.replace('ChapterReader', {
        novelId,
        chapterId: nav.id,
        novelTitle,
        chapterTitle: `Chapter ${chapterIndex + 1 + delta}`,
        chapterIndex: chapterIndex + delta,
      });
    },
    [navigation, novelId, novelTitle, chapterIndex, stop, saveProgress]
  );

  const handlePrevChapter = useCallback(() => {
    navigateToChapter(data?.navigation.prev ?? null, -1);
  }, [data?.navigation.prev, navigateToChapter]);

  const handleNextChapter = useCallback(() => {
    navigateToChapter(data?.navigation.next ?? null, 1);
  }, [data?.navigation.next, navigateToChapter]);

  function handleTTSComplete() {
    // Auto-advance to next chapter when TTS finishes
    if (data?.navigation.next) {
      handleNextChapter();
    }
  }

  // Handle back navigation
  const handleBack = useCallback(() => {
    saveProgress();
    stop();
    navigation.goBack();
  }, [navigation, saveProgress, stop]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.readerBackground }]}>
        <StatusBar
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <LoadingSpinner message="Loading chapter..." fullScreen />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.readerBackground }]}>
        <StatusBar
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <ErrorView
          message={error?.message || 'Failed to load chapter'}
          onRetry={refetch}
          fullScreen
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.readerBackground }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      />

      {/* Navigation Bar */}
      <Animated.View style={[styles.navBar, { opacity: controlsOpacity }]}>
        <NavigationBar
          title={chapterTitle}
          chapterIndex={chapterIndex}
          onBack={handleBack}
          onPrev={data?.navigation.prev ? handlePrevChapter : undefined}
          onNext={data?.navigation.next ? handleNextChapter : undefined}
        />
      </Animated.View>

      {/* Chapter Content */}
      <ChapterContent
        paragraphs={parsedContent.paragraphs}
        currentParagraph={isPlaying || isPaused ? currentIndex : -1}
        onPress={toggleControls}
        onParagraphPress={(index) => {
          setCurrentParagraph(index);
          if (isPlaying) {
            stop();
            speak(index);
          }
        }}
      />

      {/* Progress Tracker (visible when controls are hidden or always) */}
      <View style={styles.progressContainer}>
         <ProgressTracker
           currentParagraph={isPlaying || isPaused ? currentIndex : currentParagraph}
           totalParagraphs={parsedContent.paragraphs.length}
         />
      </View>

      {/* TTS Controls */}
      <Animated.View style={[styles.ttsControls, { opacity: controlsOpacity }]}>
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
          totalParagraphs={parsedContent.paragraphs.length}
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
