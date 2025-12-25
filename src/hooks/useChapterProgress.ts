// Novel Reader - Chapter Progress Hook

import { useCallback, useEffect, useRef } from 'react';
import { useReaderStore } from '../stores/readerStore';
import { ReadingProgress } from '../types';

interface UseChapterProgressProps {
  novelId: string;
  novelTitle: string;
  chapterId: string;
  chapterTitle: string;
  chapterIndex: number;
  currentParagraph: number;
  coverImage?: string;
}

export function useChapterProgress({
  novelId,
  novelTitle,
  chapterId,
  chapterTitle,
  chapterIndex,
  currentParagraph,
  coverImage,
}: UseChapterProgressProps) {
  const setProgress = useReaderStore((state) => state.setProgress);
  const addToHistory = useReaderStore((state) => state.addToHistory);
  
  const currentParagraphRef = useRef(currentParagraph);

  // Update ref when paragraph changes
  useEffect(() => {
    currentParagraphRef.current = currentParagraph;
  }, [currentParagraph]);

  const saveProgress = useCallback(() => {
    const progress: ReadingProgress = {
      novelId,
      novelTitle,
      chapterId,
      chapterTitle,
      chapterIndex,
      paragraphIndex: currentParagraphRef.current,
      scrollPosition: 0, // In a more advanced implementation, this would be updated from scroll events
      timestamp: Date.now(),
      coverImage,
    };
    
    setProgress(progress);
    addToHistory(progress);
  }, [
    novelId,
    novelTitle,
    chapterId,
    chapterTitle,
    chapterIndex,
    setProgress,
    addToHistory,
  ]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveProgress, 30000);
    return () => clearInterval(interval);
  }, [saveProgress]);

  // Manual save trigger (useful for back buttons or chapter switches)
  return { saveProgress };
}
