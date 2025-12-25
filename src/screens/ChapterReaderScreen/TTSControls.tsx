// Novel Reader - TTS Controls Component

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../stores/settingsStore';
import { themes, spacing, borderRadius, typography } from '../../constants/theme';

interface TTSControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  currentParagraph: number;
  totalParagraphs: number;
}

function TTSControls({
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onResume,
  onStop,
  onSkipNext,
  onSkipPrevious,
  currentParagraph,
  totalParagraphs,
}: TTSControlsProps) {
  const insets = useSafeAreaInsets();
  const theme = useSettingsStore((state) => state.reader.theme);
  const ttsSettings = useSettingsStore((state) => state.tts);
  const colors = themes[theme].colors;

  const progress =
    totalParagraphs > 0 ? (currentParagraph / totalParagraphs) * 100 : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface + 'F5',
          paddingBottom: insets.bottom + spacing.md,
          borderTopColor: colors.border,
        },
      ]}
    >
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[styles.progressTrack, { backgroundColor: colors.surfaceVariant }]}
        >
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: `${progress}%` },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {Math.round(progress)}%
        </Text>
      </View>

      {/* Main Controls Row */}
      <View style={styles.controlsRow}>
        {/* Speed Down */}
        <TouchableOpacity
          style={[styles.smallButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={() => useSettingsStore.getState().setSpeed(Math.max(0.5, ttsSettings.speed - 0.1))}
        >
          <Text style={[styles.smallButtonText, { color: colors.text }]}>-</Text>
        </TouchableOpacity>

        {/* Previous */}
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={onSkipPrevious}
          disabled={!isPlaying && !isPaused}
        >
          <Text style={[styles.icon, { color: isPlaying || isPaused ? colors.text : colors.textMuted }]}>⏮</Text>
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: colors.primary }]}
          onPress={!isPlaying && !isPaused ? onPlay : isPaused ? onResume : onPause}
        >
          <Text style={styles.playIcon}>
            {!isPlaying && !isPaused ? '▶' : isPaused ? '▶' : '⏸'}
          </Text>
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={onSkipNext}
          disabled={!isPlaying && !isPaused}
        >
          <Text style={[styles.icon, { color: isPlaying || isPaused ? colors.text : colors.textMuted }]}>⏭</Text>
        </TouchableOpacity>

        {/* Speed Up */}
        <TouchableOpacity
          style={[styles.smallButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={() => useSettingsStore.getState().setSpeed(Math.min(5.0, ttsSettings.speed + 0.1))}
        >
          <Text style={[styles.smallButtonText, { color: colors.text }]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Stats & Volume indicator */}
      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Paragraph {currentParagraph} of {totalParagraphs}
        </Text>
        <View style={styles.badge}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            {ttsSettings.speed.toFixed(1)}x Speed
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.stopButton} 
          onPress={onStop}
          disabled={!isPlaying && !isPaused}
        >
          <Text style={[styles.stopText, { color: (isPlaying || isPaused) ? colors.error : colors.textMuted }]}>Stop</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

export default memo(TTSControls);

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
    width: 35,
    textAlign: 'right',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    marginLeft: 2, // Slight offset for visual centering of triangle
  },
  icon: {
    fontSize: 22,
  },
  smallButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  footerText: {
    fontSize: 11,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: spacing.md,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stopButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  stopText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingLabel: {
    fontSize: 12,
  },
});
