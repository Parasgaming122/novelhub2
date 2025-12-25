// Novel Reader - Home Screen

import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Novel, ReadingProgress } from '../types';
import { useHomeData } from '../api/queries';
import { useSettingsStore } from '../stores/settingsStore';
import { useReaderStore } from '../stores/readerStore';
import { themes, spacing, typography } from '../constants/theme';
import NovelCard from '../components/NovelCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;
  const continueReading = useReaderStore((state) => state.continueReading);

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useHomeData();

  const handleNovelPress = useCallback(
    (novel: Novel) => {
      navigation.navigate('NovelInfo', { novelId: novel.id });
    },
    [navigation]
  );

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

  const renderNovelHorizontal = useCallback(
    ({ item }: { item: Novel }) => (
      <NovelCard
        novel={item}
        variant="horizontal"
        onPress={() => handleNovelPress(item)}
      />
    ),
    [handleNovelPress]
  );

  const renderContinueReading = useCallback(
    ({ item }: { item: ReadingProgress }) => (
      <NovelCard
        novel={{
          id: item.novelId,
          title: item.novelTitle,
          coverImage: item.coverImage || '',
          author: '',
          description: '',
          genre: '',
          status: '',
          updateTime: '',
        }}
        variant="horizontal"
        onPress={() => handleContinueReading(item)}
      />
    ),
    [handleContinueReading]
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading novels..." fullScreen />;
  }

  if (isError) {
    return (
      <ErrorView
        message={error?.message || 'Failed to load home data'}
        onRetry={refetch}
        fullScreen
      />
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Continue Reading Section */}
      {continueReading.length > 0 && (
        <View key="section-continue" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📖 Continue Reading
          </Text>
          <FlatList
            data={continueReading}
            renderItem={renderContinueReading}
            keyExtractor={(item) => item.novelId}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Recommended Novels Section */}
      {data?.recommended && data.recommended.length > 0 && (
        <View key="section-recommended" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            ⭐ Recommended
          </Text>
          <FlatList
            data={data.recommended}
            renderItem={renderNovelHorizontal}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Latest Releases Section */}
      {data?.latestReleases && data.latestReleases.length > 0 && (
        <View key="section-latest" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🆕 Latest Releases
          </Text>
          <View style={styles.grid}>
            {data.latestReleases.map((novel, index) => (
              <NovelCard
                key={`${novel.id}-${index}`}
                novel={novel}
                variant="vertical"
                onPress={() => handleNovelPress(novel)}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
});
