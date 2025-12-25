// Novel Reader - Progress Tracker Component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSettingsStore } from '../../stores/settingsStore';
import { themes, spacing, typography } from '../../constants/theme';

interface ProgressTrackerProps {
  currentParagraph: number;
  totalParagraphs: number;
}

export default function ProgressTracker({
  currentParagraph,
  totalParagraphs,
}: ProgressTrackerProps) {
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;

  // Calculate percentage
  const percentage = totalParagraphs > 0 
    ? Math.min(100, Math.round((currentParagraph / (totalParagraphs - 1)) * 100))
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <View style={styles.content}>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          Progress: {percentage}%
        </Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          {currentParagraph + 1} / {totalParagraphs} paragraphs
        </Text>
      </View>
      
      {/* Progress Bar Background */}
      <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
        {/* Active Progress */}
        <View 
          style={[
            styles.progressBarActive, 
            { 
              backgroundColor: colors.primary, 
              width: `${percentage}%` 
            }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  text: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarActive: {
    height: '100%',
  },
});
