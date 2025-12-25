// Novel Reader - Main Tab Navigator

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { useSettingsStore } from '../stores/settingsStore';
import { themes, spacing } from '../constants/theme';
import { Text, View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ReadingListsScreen from '../screens/ReadingListsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Simple icon components (can be replaced with vector icons)
interface TabIconProps {
  focused: boolean;
  color: string;
}

function HomeIcon({ focused, color }: TabIconProps) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, { color }]}>🏠</Text>
    </View>
  );
}

function SearchIcon({ focused, color }: TabIconProps) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, { color }]}>🔍</Text>
    </View>
  );
}

function ListsIcon({ focused, color }: TabIconProps) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, { color }]}>📚</Text>
    </View>
  );
}

function HistoryIcon({ focused, color }: TabIconProps) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, { color }]}>📖</Text>
    </View>
  );
}

function SettingsIcon({ focused, color }: TabIconProps) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, { color }]}>⚙️</Text>
    </View>
  );
}

export default function MainTabNavigator() {
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: spacing.xs,
          paddingBottom: spacing.sm,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Search',
          tabBarIcon: SearchIcon,
        }}
      />
      <Tab.Screen
        name="Lists"
        component={ReadingListsScreen}
        options={{
          title: 'Lists',
          tabBarIcon: ListsIcon,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'History',
          tabBarIcon: HistoryIcon,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: SettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
});
