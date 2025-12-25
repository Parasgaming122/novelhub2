// Novel Reader - Downloads Screen

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DownloadedNovel } from '../types';
import { useSettingsStore } from '../stores/settingsStore';
import { useDownloadsStore } from '../stores/downloadsStore';
import { themes, spacing, borderRadius, typography } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DownloadsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;

  const downloads = useDownloadsStore((state) => state.downloadedNovels);
  const totalSize = useDownloadsStore((state) => state.getTotalSize());
  const removeNovel = useDownloadsStore((state) => state.removeNovel);
  const clearAllDownloads = useDownloadsStore((state) => state.clearAll);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleNovelPress = useCallback(
    (novelId: string) => {
      navigation.navigate('NovelInfo', { novelId });
    },
    [navigation]
  );

  const handleDeleteNovel = useCallback(
    (novelId: string, novelTitle: string) => {
      Alert.alert(
        'Delete Downloads',
        `Delete all downloaded chapters for "${novelTitle}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => removeNovel(novelId),
          },
        ]
      );
    },
    [removeNovel]
  );

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All Downloads',
      'Are you sure you want to delete all downloaded content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: clearAllDownloads,
        },
      ]
    );
  }, [clearAllDownloads]);

  const renderItem = useCallback(
    ({ item }: { item: DownloadedNovel }) => (
      <TouchableOpacity
        style={[
          styles.downloadCard,
          { backgroundColor: colors.cardBackground, borderColor: colors.border },
        ]}
        onPress={() => handleNovelPress(item.novelId)}
        onLongPress={() => handleDeleteNovel(item.novelId, item.novelTitle)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <Text
            style={[styles.novelTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.novelTitle}
          </Text>
          <Text style={[styles.chapterCount, { color: colors.textSecondary }]}>
            {item.chapters.length} chapters downloaded
          </Text>
          <Text style={[styles.size, { color: colors.textMuted }]}>
            {formatSize(item.totalSize)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.error + '20' }]}
          onPress={() => handleDeleteNovel(item.novelId, item.novelTitle)}
        >
          <Text style={[styles.deleteText, { color: colors.error }]}>🗑</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [colors, handleNovelPress, handleDeleteNovel]
  );

  const ListHeaderComponent = downloads.length > 0 ? (
    <View style={[styles.header, { borderBottomColor: colors.divider }]}>
      <View>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
          Total Storage Used
        </Text>
        <Text style={[styles.totalSize, { color: colors.text }]}>
          {formatSize(totalSize)}
        </Text>
      </View>
      <TouchableOpacity onPress={handleClearAll}>
        <Text style={[styles.clearAll, { color: colors.error }]}>
          Clear All
        </Text>
      </TouchableOpacity>
    </View>
  ) : null;

  const ListEmptyComponent = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📥</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Downloads
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        Download chapters from the novel info screen for offline reading
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlashList
        data={downloads}
        renderItem={renderItem}
        keyExtractor={(item) => item.novelId}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },
  totalLabel: {
    fontSize: typography.fontSizes.sm,
  },
  totalSize: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  clearAll: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '500',
  },
  downloadCard: {
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
  chapterCount: {
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
  },
  size: {
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.sm,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  deleteText: {
    fontSize: 18,
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
    paddingHorizontal: spacing.xl,
  },
});
