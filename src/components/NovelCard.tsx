// Novel Reader - Novel Card Component

import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Novel } from '../types';
import { useSettingsStore } from '../stores/settingsStore';
import { themes, spacing, borderRadius, shadows } from '../constants/theme';

interface NovelCardProps {
  novel: Novel;
  onPress: () => void;
  variant?: 'horizontal' | 'vertical' | 'compact';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 3) / 2;
const HORIZONTAL_CARD_WIDTH = 140;

function NovelCard({ novel, onPress, variant = 'vertical' }: NovelCardProps) {
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        style={[
          styles.horizontalCard,
          { backgroundColor: colors.cardBackground },
          shadows.sm,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: novel.coverImage }}
          style={styles.horizontalCover}
          resizeMode="cover"
        />
        <Text
          style={[styles.horizontalTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {novel.title}
        </Text>
        <Text
          style={[styles.horizontalAuthor, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {novel.author}
        </Text>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[
          styles.compactCard,
          { backgroundColor: colors.cardBackground, borderColor: colors.border },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: novel.coverImage }}
          style={styles.compactCover}
          resizeMode="cover"
        />
        <View style={styles.compactInfo}>
          <Text
            style={[styles.compactTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {novel.title}
          </Text>
          <Text
            style={[styles.compactAuthor, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {novel.author}
          </Text>
          <View style={styles.compactMeta}>
            <Text style={[styles.compactGenre, { color: colors.primary }]}>
              {novel.genre}
            </Text>
            <Text style={[styles.compactStatus, { color: colors.textMuted }]}>
              {novel.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Default vertical card
  return (
    <TouchableOpacity
      style={[
        styles.verticalCard,
        { backgroundColor: colors.cardBackground },
        shadows.md,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: novel.coverImage }}
        style={styles.verticalCover}
        resizeMode="cover"
      />
      <View style={styles.verticalInfo}>
        <Text
          style={[styles.verticalTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {novel.title}
        </Text>
        <Text
          style={[styles.verticalAuthor, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {novel.author}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default memo(NovelCard);

const styles = StyleSheet.create({
  // Horizontal card (for horizontal scroll)
  horizontalCard: {
    width: HORIZONTAL_CARD_WIDTH,
    marginRight: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  horizontalCover: {
    width: HORIZONTAL_CARD_WIDTH,
    height: 180,
    borderRadius: borderRadius.md,
  },
  horizontalTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  horizontalAuthor: {
    fontSize: 12,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
  },

  // Vertical card (grid display)
  verticalCard: {
    width: CARD_WIDTH,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  verticalCover: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  verticalInfo: {
    padding: spacing.md,
  },
  verticalTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  verticalAuthor: {
    fontSize: 12,
    marginTop: spacing.xs,
  },

  // Compact card (list display)
  compactCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  compactCover: {
    width: 60,
    height: 85,
    borderRadius: borderRadius.sm,
  },
  compactInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  compactAuthor: {
    fontSize: 13,
    marginTop: spacing.xs,
  },
  compactMeta: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  compactGenre: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: spacing.md,
  },
  compactStatus: {
    fontSize: 12,
  },
});
