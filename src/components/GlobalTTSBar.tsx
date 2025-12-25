// Novel Reader - Global TTS Notification Bar
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { navigationRef } from '../navigation/navigationRef';
import { useUIStore } from '../stores/uiStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsStore } from '../stores/settingsStore';
import { useReaderStore } from '../stores/readerStore';
import { themes, spacing, borderRadius, shadows, typography } from '../constants/theme';
import { useTTS } from '../hooks/useTTS';
import TTSManager from '../services/TTSManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function GlobalTTSBar() {
  const insets = useSafeAreaInsets();
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;
  
  // We use currentProgress from readerStore to know what's being read
  const currentProgress = useReaderStore((state) => state.currentProgress);
  
  const isReaderOpen = useUIStore((state) => state.isReaderOpen);
  
  // We need the TTS state, but since we're in a global component, 
  // we might want to listen to TTSManager status directly or use a simplified hook.
  // For the global bar, we'll check TTSManager's internal state.
  const [isPlaying, setIsPlaying] = React.useState(TTSManager.getState().isPlaying);
  const [isPaused, setIsPaused] = React.useState(TTSManager.getState().isPaused);
  const [currentIndex, setCurrentIndex] = React.useState(TTSManager.getCurrentIndex());

  React.useEffect(() => {
    const interval = setInterval(() => {
      const state = TTSManager.getState();
      if (state.isPlaying !== isPlaying) setIsPlaying(state.isPlaying);
      if (state.isPaused !== isPaused) setIsPaused(state.isPaused);
      if (TTSManager.getCurrentIndex() !== currentIndex) setCurrentIndex(TTSManager.getCurrentIndex());
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying, isPaused, currentIndex]);

  if (isReaderOpen) return null;
  if (!isPlaying && !isPaused) return null;
  if (!currentProgress) return null;

  const handlePress = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('ChapterReader', {
        novelId: currentProgress.novelId,
        chapterId: currentProgress.chapterId,
        novelTitle: currentProgress.novelTitle,
        chapterTitle: currentProgress.chapterTitle,
        chapterIndex: currentProgress.chapterIndex,
        coverImage: currentProgress.coverImage,
      });
    }
  };

  const togglePlayback = () => {
    if (isPaused) {
      TTSManager.resume(useSettingsStore.getState().tts);
    } else {
      TTSManager.pause();
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.surface, 
          borderTopColor: colors.border,
          bottom: (insets.bottom || 0) + 60, // Positioned exactly above the 60px tab bar
        }, 
        shadows.lg
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.flexRow}>
        {currentProgress.coverImage ? (
          <Image source={{ uri: currentProgress.coverImage }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, { backgroundColor: colors.surfaceVariant }]} />
        )}
        
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {currentProgress.novelTitle}
          </Text>
          <Text style={[styles.chapter, { color: colors.textSecondary }]} numberOfLines={1}>
            {currentProgress.chapterTitle}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
            <Text style={{ fontSize: 24, color: colors.primary }}>
              {isPaused ? '▶️' : '⏸️'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => TTSManager.stop()} style={styles.stopButton}>
            <Text style={{ fontSize: 20 }}>⏹️</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Mini Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.surfaceVariant }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              backgroundColor: colors.primary, 
              width: `${(currentIndex / 200) * 100}%` // Estimate for now, or fetch total if possible
            }
          ]} 
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 52, // Just above the tab bar if possible, or adjusted in navigator
    left: 0,
    right: 0,
    height: 60,
    borderTopWidth: 1,
    zIndex: 1000,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: '100%',
  },
  cover: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  chapter: {
    fontSize: 11,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  playButton: {
    padding: spacing.xs,
  },
  stopButton: {
    padding: spacing.xs,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  progressFill: {
    height: '100%',
  },
});
