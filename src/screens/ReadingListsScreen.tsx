// Novel Reader - Reading Lists Screen

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ReadingList } from '../types';
import { useSettingsStore } from '../stores/settingsStore';
import { themes, spacing, borderRadius, typography, shadows } from '../constants/theme';
import { useReadingListsStore } from '../stores/readingListsStore';
import { useDownloadsStore } from '../stores/downloadsStore';
import { getProxiedImageUrl, reconstructCoverImage } from '../utils/image';
import { Image } from 'react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ReadingListsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;

  const lists = useReadingListsStore((state) => state.lists);
  const addList = useReadingListsStore((state) => state.addList);
  const removeList = useReadingListsStore((state) => state.removeList);

  const downloadedNovels = useDownloadsStore((state) => state.downloadedNovels);
  const downloadedNovelsCount = downloadedNovels.length;
  const totalStorage = useDownloadsStore((state) => state.getTotalSize());

  const [showModal, setShowModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1014)).toFixed(1)} MB`;
  };

  const handleCreateList = useCallback(() => {
    if (!newListName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    addList({
      name: newListName.trim(),
      description: newListDescription.trim() || undefined,
    });

    setNewListName('');
    setNewListDescription('');
    setShowModal(false);
  }, [newListName, newListDescription, addList]);

  const handleDeleteList = useCallback(
    (listId: string, listName: string) => {
      Alert.alert(
        'Delete List',
        `Are you sure you want to delete "${listName}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => removeList(listId),
          },
        ]
      );
    },
    [removeList]
  );

  const renderItem = useCallback(
    ({ item }: { item: ReadingList }) => {
      const isSystemList = item.id === 'downloads-list';
      
      // Get cover image for the list
      const coverImage = (() => {
        if (isSystemList) {
          // Use the cover of the first downloaded novel if available
          if (downloadedNovels.length > 0) return downloadedNovels[0].coverImage;
          return null;
        }
        // For user lists, use the first novel's ID to reconstruct or a explicit cover
        if (item.novelIds.length > 0) {
          return reconstructCoverImage(item.novelIds[0]);
        }
        return null;
      })();

      return (
        <TouchableOpacity
          style={[
            styles.listCard,
            { 
              backgroundColor: isSystemList ? colors.primary + '10' : colors.cardBackground, 
              borderColor: isSystemList ? colors.primary : colors.border,
              borderWidth: isSystemList ? 1.5 : 1
            },
          ]}
          onPress={() => {
            if (isSystemList) {
              navigation.navigate('Downloads' as any);
            } else {
              navigation.navigate('ListDetails', { listId: item.id });
            }
          }}
          onLongPress={() => !isSystemList && handleDeleteList(item.id, item.name)}
          activeOpacity={0.7}
        >
          <Image 
            source={{ uri: getProxiedImageUrl(coverImage) }}
            style={styles.listCover}
            resizeMode="cover"
          />
          <View style={styles.listInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.listName, { color: colors.text }]}>
                {isSystemList ? '📥 ' : ''}{item.name}
              </Text>
              {isSystemList && (
                <View style={[styles.systemBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.systemBadgeText}>SYSTEM</Text>
                </View>
              )}
            </View>
            
            <Text
              style={[styles.listDescription, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {isSystemList ? `Total: ${formatSize(totalStorage)}` : item.description}
            </Text>
            
            <Text style={[styles.listCount, { color: colors.textMuted }]}>
              {isSystemList ? downloadedNovelsCount : item.novelIds.length} {isSystemList ? 'novels downloaded' : 'novels'}
            </Text>
          </View>
          <Text style={[styles.arrow, { color: colors.textMuted }]}>→</Text>
        </TouchableOpacity>
      );
    },
    [colors, navigation, handleDeleteList, downloadedNovelsCount, totalStorage, downloadedNovels]
  );

  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📚</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Reading Lists
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        Create lists to organize your novels
      </Text>
    </View>
  ), [colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlashList<ReadingList>
        data={lists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.listContent}
      />

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }, shadows.lg]}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Create List Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Create New List
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="List name"
              placeholderTextColor={colors.textMuted}
              value={newListName}
              onChangeText={setNewListName}
            />

            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textMuted}
              value={newListDescription}
              onChangeText={setNewListDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surfaceVariant }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleCreateList}
              >
                <Text style={styles.modalButtonTextWhite}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  listCover: {
    width: 50,
    height: 70,
    borderRadius: borderRadius.sm,
    backgroundColor: '#eee',
  },
  listInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  listName: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
  },
  listDescription: {
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
  },
  listCount: {
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.sm,
  },
  arrow: {
    fontSize: 18,
    marginLeft: spacing.md,
  },
  systemBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
  systemBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
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
  addButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '700',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSizes.md,
    marginBottom: spacing.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
  },
  modalButtonTextWhite: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
