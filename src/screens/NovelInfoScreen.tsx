// Novel Reader - Novel Info Screen (Optimized Virtualization)

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Chapter } from '../types';
import { useNovelInfo } from '../api/queries';
import { useSettingsStore } from '../stores/settingsStore';
import { useReaderStore } from '../stores/readerStore';
import { useDownloadsStore } from '../stores/downloadsStore';
import { useReadingListsStore } from '../stores/readingListsStore';
import DownloadManager from '../services/DownloadManager';
import { themes, spacing, borderRadius, shadows, typography } from '../constants/theme';
import ChapterListItem from '../components/ChapterListItem';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';
import ListPickerModal from '../components/ListPickerModal';

type RouteProps = RouteProp<RootStackParamList, 'NovelInfo'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_WIDTH = 120;
const COVER_HEIGHT = 170;

export default function NovelInfoScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { novelId } = route.params;

  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;
  const progress = useReaderStore((state) => state.getProgress(novelId));
  const isChapterDownloaded = useDownloadsStore((state) => state.isChapterDownloaded);

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [sortDescending, setSortDescending] = useState(false);
  const [showListPicker, setShowListPicker] = useState(false);

  const { data, isLoading, isError, error, refetch } = useNovelInfo(novelId);

  const sortedChapters = useMemo(() => {
    if (!data?.chapters) return [];
    const chapters = [...data.chapters];
    return sortDescending ? chapters.reverse() : chapters;
  }, [data?.chapters, sortDescending]);

  const handleChapterPress = useCallback(
    (chapter: Chapter, index: number) => {
      if (!data) return;
      navigation.navigate('ChapterReader', {
        novelId: data.id,
        chapterId: chapter.id,
        novelTitle: data.title,
        chapterTitle: chapter.title,
        chapterIndex: sortDescending
          ? data.chapters.length - 1 - index
          : index,
      });
    },
    [navigation, data, sortDescending]
  );

  const handleStartReading = useCallback(() => {
    if (!data || !data.chapters.length) return;
    const firstChapter = data.chapters[0];
    navigation.navigate('ChapterReader', {
      novelId: data.id,
      chapterId: firstChapter.id,
      novelTitle: data.title,
      chapterTitle: firstChapter.title,
      chapterIndex: 0,
    });
  }, [data, navigation]);

  const handleContinueReading = useCallback(() => {
    if (!data || !progress) return;
    navigation.navigate('ChapterReader', {
      novelId: data.id,
      chapterId: progress.chapterId,
      novelTitle: data.title,
      chapterTitle: progress.chapterTitle,
      chapterIndex: progress.chapterIndex,
    });
  }, [data, progress, navigation]);

  const renderHeader = useMemo(() => {
    if (!data) return null;
    return (
      <View>
        {/* Novel Info Section */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Image
            source={{ uri: data.coverImage }}
            style={[styles.cover, shadows.md]}
            resizeMode="cover"
          />
          <View style={styles.info}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={3}>
              {data.title}
            </Text>
            <Text style={[styles.author, { color: colors.textSecondary }]}>
              by {data.author}
            </Text>
            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{data.genre}</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      data.status === 'Completed'
                        ? colors.success
                        : colors.warning,
                  },
                ]}
              >
                <Text style={styles.badgeText}>{data.status}</Text>
              </View>
            </View>
            <Text style={[styles.chaptersInfo, { color: colors.textMuted }]}>
              {data.chapters.length} Chapters
            </Text>
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {
              DownloadManager.downloadChapters(data.id, data.title, data.chapters, data.coverImage);
              Alert.alert('Download Started', `Adding ${data.chapters.length} chapters to the download queue.`);
            }}
          >
            <Text style={styles.actionIcon}>📥</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Download All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowListPicker(true)}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Add to List</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <TouchableOpacity
          style={[styles.description, { borderBottomColor: colors.divider }]}
          onPress={() => setShowFullDescription(!showFullDescription)}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.descriptionText, { color: colors.textSecondary }]}
            numberOfLines={showFullDescription ? undefined : 3}
          >
            {data.description}
          </Text>
          <Text style={[styles.showMore, { color: colors.primary }]}>
            {showFullDescription ? 'Show Less' : 'Show More'}
          </Text>
        </TouchableOpacity>

        {/* Chapters Section Header */}
        <View
          style={[
            styles.chaptersHeader,
            { backgroundColor: colors.background, borderBottomColor: colors.divider },
          ]}
        >
          <Text style={[styles.chaptersTitle, { color: colors.text }]}>
            Chapters
          </Text>
          <TouchableOpacity
            style={[styles.sortButton, { backgroundColor: colors.surface }]}
            onPress={() => setSortDescending(!sortDescending)}
          >
            <Text style={[styles.sortText, { color: colors.textSecondary }]}>
              {sortDescending ? '↓ Newest' : '↑ Oldest'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [data, colors, showFullDescription, sortDescending]);

  const renderChapter = useCallback(
    ({ item, index }: { item: Chapter; index: number }) => (
      <ChapterListItem
        chapter={item}
        index={sortDescending
          ? (data?.chapters.length || 0) - 1 - index
          : index}
        isCurrentChapter={progress?.chapterId === item.id}
        isDownloaded={isChapterDownloaded(novelId, item.id)}
        onPress={() => handleChapterPress(item, index)}
      />
    ),
    [handleChapterPress, progress, sortDescending, data?.chapters.length, isChapterDownloaded, novelId]
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading novel info..." fullScreen />;
  }

  if (isError) {
    return (
      <ErrorView
        message={error?.message || 'Failed to load novel'}
        onRetry={refetch}
        fullScreen
      />
    );
  }

  if (!data) {
    return <ErrorView message="Novel not found" fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlashList
        data={sortedChapters}
        renderItem={renderChapter}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
      />

      {/* Bottom Action Buttons */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {progress ? (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleContinueReading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              Continue Ch. {progress.chapterIndex + 1}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleStartReading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Start Reading</Text>
          </TouchableOpacity>
        )}
      </View>
      <ListPickerModal
        visible={showListPicker}
        onClose={() => setShowListPicker(false)}
        novelId={novelId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  cover: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: borderRadius.md,
  },
  info: {
    flex: 1,
    marginLeft: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
  author: {
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  chaptersInfo: {
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  actionLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '500',
  },
  description: {
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  descriptionText: {
    fontSize: typography.fontSizes.sm,
    lineHeight: 22,
  },
  showMore: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '500',
    marginTop: spacing.sm,
  },
  chaptersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  chaptersTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
  },
  sortButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  sortText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '500',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  primaryButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
  },
});
