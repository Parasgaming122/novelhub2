// Novel Reader - App Navigator

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useSettingsStore } from '../stores/settingsStore';
import { themes } from '../constants/theme';
import MainTabNavigator from './MainTabNavigator';
import NovelInfoScreen from '../screens/NovelInfoScreen';
import ChapterReaderScreen from '../screens/ChapterReaderScreen';
import ListDetailsScreen from '../screens/ListDetailsScreen';
import ReadingStatsScreen from '../screens/ReadingStatsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NovelInfo"
          component={NovelInfoScreen}
          options={{
            title: 'Novel Details',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="ChapterReader"
          component={ChapterReaderScreen}
          options={{
            headerShown: false, // Reader has its own header
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="ListDetails"
          component={ListDetailsScreen}
          options={{
            title: 'Reading List',
            headerBackTitle: 'Lists',
          }}
        />
        <Stack.Screen
          name="ReadingStats"
          component={ReadingStatsScreen}
          options={{
            title: 'Reading Statistics',
            headerBackTitle: 'Back',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
