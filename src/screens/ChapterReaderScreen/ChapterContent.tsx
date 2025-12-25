// Novel Reader - Chapter Content Component

import React, { memo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { useSettingsStore } from '../../stores/settingsStore';
import { themes, spacing } from '../../constants/theme';

interface ChapterContentProps {
  paragraphs: string[];
  currentParagraph: number;
  onPress: () => void;
  onParagraphPress: (index: number) => void;
}

function ChapterContent({
  paragraphs,
  currentParagraph,
  onPress,
  onParagraphPress,
}: ChapterContentProps) {
  const theme = useSettingsStore((state) => state.reader.theme);
  const readerSettings = useSettingsStore((state) => state.reader);
  const ttsSettings = useSettingsStore((state) => state.tts);
  const colors = themes[theme].colors;
  const scrollViewRef = useRef<ScrollView>(null);
  const paragraphLayouts = useRef<{ [key: number]: number }>({});

  // Scroll to paragraph when TTS is playing
  React.useEffect(() => {
    if (currentParagraph >= 0 && ttsSettings.autoScrollEnabled) {
      const yOffset = paragraphLayouts.current[currentParagraph];
      if (yOffset !== undefined) {
        scrollViewRef.current?.scrollTo({
          y: yOffset - 100,
          animated: true,
        });
      }
    }
  }, [currentParagraph, ttsSettings.autoScrollEnabled]);

  const handleParagraphLayout = useCallback(
    (index: number, y: number) => {
      paragraphLayouts.current[index] = y;
    },
    []
  );

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: 80, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {paragraphs.map((paragraph, index) => {
          const isFocused = currentParagraph === index && ttsSettings.focusEnabled;
          
          return (
            <TouchableWithoutFeedback
              key={index}
              onPress={() => onParagraphPress(index)}
            >
              <View
                onLayout={(e) =>
                  handleParagraphLayout(index, e.nativeEvent.layout.y)
                }
                style={[
                  styles.paragraphContainer,
                  isFocused && {
                    backgroundColor: colors.focusHighlight,
                    borderRadius: 8,
                    marginHorizontal: -spacing.sm,
                    paddingHorizontal: spacing.sm,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.paragraph,
                    {
                      color: isFocused ? colors.primary : colors.readerText,
                      fontSize: readerSettings.fontSize,
                      lineHeight: readerSettings.fontSize * readerSettings.lineHeight,
                      fontFamily: readerSettings.fontFamily,
                    },
                  ]}
                >
                  {paragraph}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          );
        })}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

export default memo(ChapterContent);

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  paragraphContainer: {
    paddingVertical: spacing.sm,
  },
  paragraph: {
    textAlign: 'justify',
  },
});
