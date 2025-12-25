// Novel Reader - List Details Screen

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useSettingsStore } from '../stores/settingsStore';
import { useReadingListsStore } from '../stores/readingListsStore';
import { themes, spacing, typography } from '../constants/theme';
import NovelCard from '../components/NovelCard';

type RouteProps = RouteProp<RootStackParamList, 'ListDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ListDetailsScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { listId } = route.params;

  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;

  const list = useReadingListsStore((state) => state.getList(listId));
  const removeNovelFromList = useReadingListsStore(
    (state) => state.removeNovelFromList
  );

  const handleNovelPress = useCallback(
    (novelId: string) => {
      navigation.navigate('NovelInfo', { novelId });
    },
    [navigation]
  );

  const handleRemoveNovel = useCallback(
    (novelId: string) => {
      Alert.alert(
        'Remove Novel',
        'Remove this novel from the list?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => removeNovelFromList(listId, novelId),
          },
        ]
      );
    },
    [listId, removeNovelFromList]
  );

  const renderItem = useCallback(
    ({ item: novelId }: { item: string }) => (
      <NovelCard
        novel={{
          id: novelId,
          title: novelId, // In a real app, you'd fetch the novel info
          author: '',
          coverImage: '',
          description: '',
          genre: '',
          status: '',
          updateTime: '',
        }}
        variant="compact"
        onPress={() => handleNovelPress(novelId)}
      />
    ),
    [handleNovelPress]
  );

  if (!list) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            List not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* List Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.listName, { color: colors.text }]}>
          {list.name}
        </Text>
        {list.description && (
          <Text style={[styles.listDescription, { color: colors.textSecondary }]}>
            {list.description}
          </Text>
        )}
        <Text style={[styles.novelCount, { color: colors.textMuted }]}>
          {list.novelIds.length} novels
        </Text>
      </View>

      {/* Novel List */}
      {list.novelIds.length > 0 ? (
        <FlashList
          data={list.novelIds}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Novels
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
            Add novels from the novel info screen
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  listName: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '700',
  },
  listDescription: {
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  novelCount: {
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
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
