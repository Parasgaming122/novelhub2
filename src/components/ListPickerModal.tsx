// Novel Reader - List Picker Modal
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useReadingListsStore } from '../stores/readingListsStore';
import { useSettingsStore } from '../stores/settingsStore';
import { themes, spacing, borderRadius, typography } from '../constants/theme';
import { ReadingList } from '../types';

interface ListPickerModalProps {
  visible: boolean;
  onClose: () => void;
  novelId: string;
}

export default function ListPickerModal({
  visible,
  onClose,
  novelId,
}: ListPickerModalProps) {
  const theme = useSettingsStore((state) => state.reader.theme);
  const colors = themes[theme].colors;
  
  const lists = useReadingListsStore((state) => state.lists);
  const addNovelToList = useReadingListsStore((state) => state.addNovelToList);
  const removeNovelFromList = useReadingListsStore((state) => state.removeNovelFromList);
  const isNovelInList = useReadingListsStore((state) => state.isNovelInList);

  const toggleNovelInList = (listId: string) => {
    if (isNovelInList(listId, novelId)) {
      removeNovelFromList(listId, novelId);
    } else {
      addNovelToList(listId, novelId);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Add to Reading List</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeLabel, { color: colors.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.listContainer}>
            {lists.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No lists found. Create one from the Lists tab.
                </Text>
              </View>
            ) : (
              lists.map((list) => {
                const inList = isNovelInList(list.id, novelId);
                return (
                  <TouchableOpacity
                    key={list.id}
                    style={[
                      styles.listItem,
                      { borderBottomColor: colors.divider }
                    ]}
                    onPress={() => toggleNovelInList(list.id)}
                  >
                    <View style={styles.listInfo}>
                      <Text style={[styles.listName, { color: colors.text }]}>{list.name}</Text>
                      <Text style={[styles.listCount, { color: colors.textMuted }]}>
                        {list.novelIds.length} novels
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        { borderColor: colors.primary },
                        inList && { backgroundColor: colors.primary }
                      ]}
                    >
                      {inList && <Text style={styles.checkIcon}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
  },
  closeLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
  },
  listContainer: {
    padding: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
  },
  listCount: {
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: typography.fontSizes.sm,
  },
});
