// Novel Reader - Search Screen

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Novel } from '../types';
import { useSearchNovels } from '../api/queries';
import { useSettingsStore } from '../stores/settingsStore';
import { themes, spacing, borderRadius, typography } from '../constants/theme';
import NovelCard from '../components/NovelCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { data, isLoading, isError, error, refetch } =
    useSearchNovels(debouncedQuery);

  const handleNovelPress = useCallback(
    (novel: Novel) => {
      Keyboard.dismiss();
      navigation.navigate('NovelInfo', { novelId: novel.id });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Novel }) => (
      <NovelCard
        novel={item}
        variant="compact"
        onPress={() => handleNovelPress(item)}
      />
    ),
    [handleNovelPress]
  );

  const showResults = debouncedQuery.trim().length > 0;
  const hasResults = data && data.length > 0;

  const ListEmptyComponent = useMemo(() => {
    if (!showResults) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Search for Novels
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
            Enter a title, author, or keyword to find novels
          </Text>
        </View>
      );
    }

    if (isLoading) {
      return <LoadingSpinner message="Searching..." />;
    }

    if (isError) {
      return (
        <ErrorView
          message={error?.message || 'Search failed'}
          onRetry={refetch}
        />
      );
    }

    if (!hasResults) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>😕</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Results
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
            No novels found for "{debouncedQuery}"
          </Text>
        </View>
      );
    }

    return null;
  }, [
    showResults,
    isLoading,
    isError,
    hasResults,
    debouncedQuery,
    colors,
    error,
    refetch,
  ]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search novels..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Text
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              ✕
            </Text>
          )}
        </View>
      </View>

      {/* Results */}
      <FlashList
        data={hasResults ? data : []}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        ListEmptyComponent={ListEmptyComponent}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    fontSize: 16,
    padding: spacing.sm,
    color: '#888',
  },
  listContent: {
    paddingBottom: spacing.xxxl * 3,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
    paddingHorizontal: spacing.xl,
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
    lineHeight: 20,
  },
});
