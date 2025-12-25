// Novel Reader - Chapter List Item Component

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Chapter } from '../types';
import { useSettingsStore } from '../stores/settingsStore';
import { themes, spacing, borderRadius } from '../constants/theme';

interface ChapterListItemProps {
  chapter: Chapter;
  index: number;
  isDownloaded?: boolean;
  isCurrentChapter?: boolean;
  onPress: () => void;
}

function ChapterListItem({
  chapter,
  index,
  isDownloaded = false,
  isCurrentChapter = false,
  onPress,
}: ChapterListItemProps) {
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isCurrentChapter
            ? colors.focusHighlight
            : colors.cardBackground,
          borderBottomColor: colors.divider,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={[styles.index, { color: colors.textMuted }]}>
          {index + 1}
        </Text>
        <Text
          style={[
            styles.title,
            {
              color: isCurrentChapter ? colors.primary : colors.text,
              fontWeight: isCurrentChapter ? '600' : '400',
            },
          ]}
          numberOfLines={2}
        >
          {chapter.title}
        </Text>
      </View>
      <View style={styles.indicators}>
        {isDownloaded && (
          <View
            style={[styles.downloadBadge, { backgroundColor: colors.success }]}
          >
            <Text style={styles.downloadIcon}>✓</Text>
          </View>
        )}
        {isCurrentChapter && (
          <View
            style={[styles.currentBadge, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.currentText}>Reading</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default memo(ChapterListItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  index: {
    width: 40,
    fontSize: 13,
    fontWeight: '500',
  },
  title: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  downloadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  downloadIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  currentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  currentText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
