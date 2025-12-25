// Novel Reader - Navigation Bar Component

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../stores/settingsStore';
import { themes, spacing, typography } from '../../constants/theme';

interface NavigationBarProps {
  title: string;
  chapterIndex: number;
  onBack: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

function NavigationBar({
  title,
  chapterIndex,
  onBack,
  onPrev,
  onNext,
}: NavigationBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface + 'F5',
          paddingTop: insets.top + spacing.sm,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.backIcon, { color: colors.primary }]}>←</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text
            style={[styles.chapterNumber, { color: colors.textMuted }]}
          >
            Chapter {chapterIndex + 1}
          </Text>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        <View style={styles.placeholder} />
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: onPrev ? colors.surfaceVariant : colors.surface },
          ]}
          onPress={onPrev}
          disabled={!onPrev}
        >
          <Text
            style={[
              styles.navButtonText,
              { color: onPrev ? colors.text : colors.textMuted },
            ]}
          >
            ← Prev
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: onNext ? colors.surfaceVariant : colors.surface },
          ]}
          onPress={onNext}
          disabled={!onNext}
        >
          <Text
            style={[
              styles.navButtonText,
              { color: onNext ? colors.text : colors.textMuted },
            ]}
          >
            Next →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default memo(NavigationBar);

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  chapterNumber: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '500',
  },
  title: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '600',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  navButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '500',
  },
});
