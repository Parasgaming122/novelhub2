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
        <Text style={[styles.progressText, { color: colors.textMuted }]}>
          {currentParagraph} / {totalParagraphs}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Skip Previous */}
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={onSkipPrevious}
          disabled={!isPlaying && !isPaused}
        >
          <Text
            style={[
              styles.controlIcon,
              { color: isPlaying || isPaused ? colors.text : colors.textMuted },
            ]}
          >
            ⏮
          </Text>
        </TouchableOpacity>

        {/* Play/Pause */}
        {!isPlaying && !isPaused ? (
          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: colors.primary }]}
            onPress={onPlay}
          >
            <Text style={styles.mainButtonIcon}>▶</Text>
          </TouchableOpacity>
        ) : isPaused ? (
          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: colors.primary }]}
            onPress={onResume}
          >
            <Text style={styles.mainButtonIcon}>▶</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: colors.primary }]}
            onPress={onPause}
          >
            <Text style={styles.mainButtonIcon}>⏸</Text>
          </TouchableOpacity>
        )}

        {/* Skip Next */}
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={onSkipNext}
          disabled={!isPlaying && !isPaused}
        >
          <Text
            style={[
              styles.controlIcon,
              { color: isPlaying || isPaused ? colors.text : colors.textMuted },
            ]}
          >
            ⏭
          </Text>
        </TouchableOpacity>

        {/* Stop */}
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={onStop}
          disabled={!isPlaying && !isPaused}
        >
          <Text
            style={[
              styles.controlIcon,
              { color: isPlaying || isPaused ? colors.error : colors.textMuted },
            ]}
          >
            ⏹
          </Text>
        </TouchableOpacity>
      </View>

      {/* Speed Indicator */}
      <View style={styles.settingsRow}>
        <Text style={[styles.settingLabel, { color: colors.textMuted }]}>
          Speed: {ttsSettings.speed.toFixed(1)}x
        </Text>
        <Text style={[styles.settingLabel, { color: colors.textMuted }]}>
          Pitch: {ttsSettings.pitch.toFixed(1)}
        </Text>
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
    fontSize: typography.fontSizes.xs,
    minWidth: 60,
    textAlign: 'right',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
  controlIcon: {
    fontSize: 18,
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
  },
  mainButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.xl,
  },
  settingLabel: {
    fontSize: typography.fontSizes.xs,
  },
});
