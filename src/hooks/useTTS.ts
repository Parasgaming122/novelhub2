// Novel Reader - TTS Hook

import { useState, useCallback, useEffect } from 'react';
import TTSManager from '../services/TTSManager';
import { useSettingsStore } from '../stores/settingsStore';

interface UseTTSOptions {
  paragraphs: string[];
  onParagraphChange?: (index: number) => void;
  onComplete?: () => void;
}

interface UseTTSReturn {
  isPlaying: boolean;
  isPaused: boolean;
  currentIndex: number;
  speak: (startIndex?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  updateParagraphs: (paragraphs: string[]) => void;
}

export function useTTS({
  paragraphs,
  onParagraphChange,
  onComplete,
}: UseTTSOptions): UseTTSReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const ttsSettings = useSettingsStore((state) => state.tts);

  // Sync internal state with manager monthly if needed, 
  // but usually we can just rely on callbacks
  
  const handleParagraphChange = useCallback((index: number) => {
    setCurrentIndex(index);
    onParagraphChange?.(index);
  }, [onParagraphChange]);

  const handleComplete = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    onComplete?.();
  }, [onComplete]);

  const handleError = useCallback((error: any) => {
    console.error('TTS Hook Error:', error);
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const speak = useCallback((startIndex = 0) => {
    setIsPlaying(true);
    setIsPaused(false);
    TTSManager.speak(paragraphs, startIndex, ttsSettings, {
      onParagraphChange: handleParagraphChange,
      onComplete: handleComplete,
      onError: handleError,
    });
  }, [paragraphs, ttsSettings, handleParagraphChange, handleComplete, handleError]);

  const pause = useCallback(async () => {
    await TTSManager.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(async () => {
    await TTSManager.resume(ttsSettings);
    setIsPaused(false);
  }, [ttsSettings]);

  const stop = useCallback(() => {
    TTSManager.stop();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const skipNext = useCallback(() => {
    TTSManager.skipNext(ttsSettings);
  }, [ttsSettings]);

  const skipPrevious = useCallback(() => {
    TTSManager.skipPrevious(ttsSettings);
  }, [ttsSettings]);

  const updateParagraphs = useCallback((newParagraphs: string[]) => {
    TTSManager.updateParagraphs(newParagraphs);
  }, []);

  // Stop on unmount
  useEffect(() => {
    return () => {
      TTSManager.stop();
    };
  }, []);

  return {
    isPlaying,
    isPaused,
    currentIndex,
    speak,
    pause,
    resume,
    stop,
    skipNext,
    skipPrevious,
    updateParagraphs,
  };
}
