// Novel Reader - History Screen

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ReadingProgress } from '../types';
import { useSettingsStore } from '../stores/settingsStore';
import { useReaderStore } from '../stores/readerStore';
import { themes, spacing, borderRadius, typography } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;

  const history = useReaderStore((state) => state.history);
  const clearHistory = useReaderStore((state) => state.clearHistory);

  const handleContinueReading = useCallback(
    (progress: ReadingProgress) => {
      navigation.navigate('ChapterReader', {
        novelId: progress.novelId,
        chapterId: progress.chapterId,
        novelTitle: progress.novelTitle,
        chapterTitle: progress.chapterTitle,
        chapterIndex: progress.chapterIndex,
      });
    },
    [navigation]
  );

  const handleViewNovel = useCallback(
    (novelId: string) => {
      navigation.navigate('NovelInfo', { novelId });
    },
    [navigation]
  );

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your reading history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearHistory,
        },
      ]
    );
  }, [clearHistory]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const renderItem = useCallback(
    ({ item }: { item: ReadingProgress }) => (
      <TouchableOpacity
        style={[
          styles.historyCard,
          { backgroundColor: colors.cardBackground, borderColor: colors.border },
        ]}
        onPress={() => handleContinueReading(item)}
        onLongPress={() => handleViewNovel(item.novelId)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <Text
            style={[styles.novelTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.novelTitle}
          </Text>
          <Text
            style={[styles.chapterTitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            Ch. {item.chapterIndex + 1}: {item.chapterTitle}
          </Text>
          <Text style={[styles.timestamp, { color: colors.textMuted }]}>
            {formatDate(item.timestamp)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={() => handleContinueReading(item)}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [colors, handleContinueReading, handleViewNovel]
  );

  const ListEmptyComponent = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📖</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Reading History
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        Start reading to build your history
      </Text>
    </View>
  );

  const ListHeaderComponent = history.length > 0 ? (
    <View style={styles.headerActions}>
      <TouchableOpacity onPress={handleClearHistory}>
        <Text style={[styles.clearButton, { color: colors.error }]}>
          Clear History
        </Text>
      </TouchableOpacity>
    </View>
  ) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlashList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.novelId}-${item.timestamp}`}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxxl * 3, // Increased padding for bottom bars
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '500',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  cardContent: {
    flex: 1,
  },
  novelTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
  },
  chapterTitle: {
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
  },
  timestamp: {
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.sm,
  },
  continueButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.md,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: typography.fontSizes.sm,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.fontSizes.sm,
    textAlign: 'center',
  },
});
