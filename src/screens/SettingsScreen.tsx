// Novel Reader - Settings Screen

import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSettingsStore } from '../stores/settingsStore';
import { themes, spacing, borderRadius, typography } from '../constants/theme';
import { ThemeMode, RootStackParamList } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;

  // Reader settings
  const readerSettings = useSettingsStore((state) => state.reader);
  const setFontSize = useSettingsStore((state) => state.setFontSize);
  const setLineHeight = useSettingsStore((state) => state.setLineHeight);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const setKeepScreenOn = useSettingsStore((state) => state.setKeepScreenOn);

  // TTS settings
  const ttsSettings = useSettingsStore((state) => state.tts);
  const setPitch = useSettingsStore((state) => state.setPitch);
  const setSpeed = useSettingsStore((state) => state.setSpeed);
  const setAutoScrollEnabled = useSettingsStore((state) => state.setAutoScrollEnabled);
  const setFocusEnabled = useSettingsStore((state) => state.setFocusEnabled);

  // Reset
  const resetToDefaults = useSettingsStore((state) => state.resetToDefaults);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetToDefaults,
        },
      ]
    );
  }, [resetToDefaults]);

  const themeOptions: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: 'light', label: 'Light', icon: '☀️' },
    { mode: 'dark', label: 'Dark', icon: '🌙' },
    { mode: 'sepia', label: 'Sepia', icon: '📜' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Theme Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>
        <View style={styles.themeOptions}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.themeOption,
                {
                  backgroundColor:
                    readerSettings.theme === option.mode
                      ? colors.primary
                      : colors.surface,
                  borderColor:
                    readerSettings.theme === option.mode
                      ? colors.primary
                      : colors.border,
                },
              ]}
              onPress={() => setTheme(option.mode)}
            >
              <Text style={styles.themeIcon}>{option.icon}</Text>
              <Text
                style={[
                  styles.themeLabel,
                  {
                    color:
                      readerSettings.theme === option.mode
                        ? '#FFFFFF'
                        : colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Reader Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Reader
        </Text>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Font Size: {readerSettings.fontSize}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={12}
            maximumValue={28}
            step={1}
            value={readerSettings.fontSize}
            onValueChange={setFontSize}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.surfaceVariant}
            thumbTintColor={colors.primary}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Line Height: {readerSettings.lineHeight.toFixed(2)}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={1.2}
            maximumValue={2.5}
            step={0.05}
            value={readerSettings.lineHeight}
            onValueChange={setLineHeight}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.surfaceVariant}
            thumbTintColor={colors.primary}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Keep Screen On
          </Text>
          <Switch
            value={readerSettings.keepScreenOn}
            onValueChange={setKeepScreenOn}
            trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* TTS Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Text-to-Speech
        </Text>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Speed: {ttsSettings.speed.toFixed(1)}x
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={2.0}
            step={0.1}
            value={ttsSettings.speed}
            onValueChange={setSpeed}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.surfaceVariant}
            thumbTintColor={colors.primary}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Pitch: {ttsSettings.pitch.toFixed(1)}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={2.0}
            step={0.1}
            value={ttsSettings.pitch}
            onValueChange={setPitch}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.surfaceVariant}
            thumbTintColor={colors.primary}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Auto-Scroll
          </Text>
          <Switch
            value={ttsSettings.autoScrollEnabled}
            onValueChange={setAutoScrollEnabled}
            trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Focus Mode (Highlight)
          </Text>
          <Switch
            value={ttsSettings.focusEnabled}
            onValueChange={setFocusEnabled}
            trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Stats and Insights */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Insights</Text>
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('ReadingStats')}
        >
          <Text style={styles.menuIcon}>📊</Text>
          <View style={styles.menuContent}>
            <Text style={[styles.menuLabel, { color: colors.text }]}>Reading Statistics</Text>
            <Text style={[styles.menuSub, { color: colors.textSecondary }]}>View your reading habits and streaks</Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Reset */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: colors.error }]}
          onPress={handleReset}
        >
          <Text style={[styles.resetText, { color: colors.error }]}>
            Reset All Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Version Info */}
      <View style={styles.footer}>
        <Text style={[styles.version, { color: colors.textMuted }]}>
          Novel Reader v1.0.0
        </Text>
        <Text style={[styles.version, { color: colors.textMuted }]}>
          Built with Expo SDK 54
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  themeIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  themeLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '500',
  },
  settingRow: {
    marginBottom: spacing.lg,
  },
  settingLabel: {
    fontSize: typography.fontSizes.md,
    marginBottom: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: spacing.lg,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuSub: {
    fontSize: typography.fontSizes.xs,
  },
  chevron: {
    fontSize: 24,
    marginLeft: spacing.sm,
  },
  resetButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetText: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  version: {
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.xs,
  },
});
