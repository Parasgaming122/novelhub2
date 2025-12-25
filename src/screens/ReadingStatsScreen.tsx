// Novel Reader - Reading Statistics Screen

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';
import { useStatisticsStore } from '../stores/statisticsStore';
import { themes, spacing, borderRadius, typography } from '../constants/theme';

const { width } = Dimensions.get('window');

interface StatCardProps {
  label: string;
  value: string | number;
  emoji: string;
  colors: any;
}

function StatCard({ label, value, emoji, colors }: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

export default function ReadingStatsScreen() {
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;
  const stats = useStatisticsStore();

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatWords = (words: number) => {
    if (words < 1000) return words.toString();
    return `${(words / 1000).toFixed(1)}k`;
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.header, { color: colors.text }]}>Reading Insights</Text>
      
      {/* Primary Stats Grid */}
      <View style={styles.grid}>
        <StatCard 
          emoji="⏱️" 
          label="Reading Time" 
          value={formatTime(stats.totalReadingTime)} 
          colors={colors} 
        />
        <StatCard 
          emoji="📖" 
          label="Chapters Read" 
          value={stats.totalChaptersRead} 
          colors={colors} 
        />
        <StatCard 
          emoji="✍️" 
          label="Words Devoured" 
          value={formatWords(stats.totalWordsRead)} 
          colors={colors} 
        />
        <StatCard 
          emoji="🔥" 
          label="Current Streak" 
          value={`${stats.currentStreak} days`} 
          colors={colors} 
        />
      </View>

      {/* Streak Dashboard */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Streak Records</Text>
        <View style={styles.streakRow}>
          <View style={styles.streakBox}>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Current</Text>
            <Text style={[styles.streakValue, { color: colors.primary }]}>{stats.currentStreak}d</Text>
          </View>
          <View style={[styles.streakDivider, { backgroundColor: colors.border }]} />
          <View style={styles.streakBox}>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Longest</Text>
            <Text style={[styles.streakValue, { color: colors.text }]}>{stats.longestStreak}d</Text>
          </View>
        </View>
      </View>

      {/* Recent Sessions */}
      <View style={styles.sessionsHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Recent Sessions</Text>
      </View>
      
      {stats.sessionsHistory.length === 0 ? (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, alignItems: 'center' }]}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No reading sessions yet. Start reading to see your activity!</Text>
        </View>
      ) : (
        stats.sessionsHistory.slice(0, 10).map((session) => (
          <View 
            key={session.id} 
            style={[styles.sessionItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
          >
            <View style={styles.sessionMain}>
              <Text style={[styles.sessionTitle, { color: colors.text }]} numberOfLines={1}>
                {session.novelTitle}
              </Text>
              <Text style={[styles.sessionSub, { color: colors.textSecondary }]}>
                {new Date(session.startTime).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.sessionStats}>
              <Text style={[styles.sessionValue, { color: colors.text }]}>
                {Math.round((session.endTime - session.startTime) / 60000)}m
              </Text>
              <Text style={[styles.sessionSub, { color: colors.textSecondary }]}>
                {session.chaptersRead} ch
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '700',
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '500',
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  cardTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBox: {
    flex: 1,
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: typography.fontSizes.xs,
    marginBottom: spacing.xs,
  },
  streakValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '700',
  },
  streakDivider: {
    width: 1,
    height: 40,
  },
  sessionsHeader: {
    marginBottom: spacing.md,
  },
  sessionItem: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  sessionMain: {
    flex: 1,
    marginRight: spacing.md,
  },
  sessionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  sessionSub: {
    fontSize: typography.fontSizes.xs,
  },
  sessionStats: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  sessionValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: typography.fontSizes.sm,
    lineHeight: 20,
  },
});
