// Novel Reader - TTS Manager Service (Singleton)

import * as Speech from 'expo-speech';
import { TTSSettings } from '../types';

class TTSManager {
  private static instance: TTSManager;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private currentParagraphIndex: number = 0;
  private paragraphs: string[] = [];
  
  private onParagraphChange?: (index: number) => void;
  private onComplete?: () => void;
  private onError?: (error: any) => void;

  private constructor() {}

  public static getInstance(): TTSManager {
    if (!TTSManager.instance) {
      TTSManager.instance = new TTSManager();
    }
    return TTSManager.instance;
  }

  public async speak(
    paragraphs: string[],
    startIndex: number,
    settings: TTSSettings,
    callbacks: {
      onParagraphChange: (index: number) => void;
      onComplete: () => void;
      onError: (error: any) => void;
    }
  ) {
    this.paragraphs = paragraphs;
    this.currentParagraphIndex = startIndex;
    this.onParagraphChange = callbacks.onParagraphChange;
    this.onComplete = callbacks.onComplete;
    this.onError = callbacks.onError;
    
    this.isPlaying = true;
    this.isPaused = false;
    
    await this.playParagraph(this.currentParagraphIndex, settings);
  }

  private async playParagraph(index: number, settings: TTSSettings) {
    if (index >= this.paragraphs.length) {
      this.isPlaying = false;
      this.onComplete?.();
      return;
    }

    if (!this.isPlaying) return;

    this.currentParagraphIndex = index;
    this.onParagraphChange?.(index);

    const text = this.paragraphs[index];
    if (!text || text.trim().length === 0) {
      await this.playParagraph(index + 1, settings);
      return;
    }

    try {
      await Speech.speak(text, {
        pitch: settings.pitch,
        rate: settings.speed,
        voice: settings.selectedVoiceIdentifier,
        onDone: () => {
          if (this.isPlaying && !this.isPaused) {
            this.playParagraph(index + 1, settings);
          }
        },
        onError: (error) => {
          this.isPlaying = false;
          this.onError?.(error);
        },
      });
    } catch (error) {
      this.isPlaying = false;
      this.onError?.(error);
    }
  }

  public async pause() {
    await Speech.pause();
    this.isPaused = true;
  }

  public async resume(settings: TTSSettings) {
    this.isPaused = false;
    // Standard resume is unreliable on many Android/iOS engines,
    // so we re-speak the current paragraph if it was paused.
    await Speech.stop();
    await this.playParagraph(this.currentParagraphIndex, settings);
  }

  public async stop() {
    this.isPlaying = false;
    this.isPaused = false;
    await Speech.stop();
  }

  public async getAvailableVoices() {
    try {
      return await Speech.getAvailableVoicesAsync();
    } catch (error) {
      console.warn('[TTS] Failed to get voices:', error);
      return [];
    }
  }

  public skipNext(settings: TTSSettings) {
    if (this.currentParagraphIndex < this.paragraphs.length - 1) {
      this.stop();
      this.isPlaying = true;
      this.playParagraph(this.currentParagraphIndex + 1, settings);
    }
  }

  public skipPrevious(settings: TTSSettings) {
    if (this.currentParagraphIndex > 0) {
      this.stop();
      this.isPlaying = true;
      this.playParagraph(this.currentParagraphIndex - 1, settings);
    }
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentParagraphIndex: this.currentParagraphIndex,
    };
  }
}

export default TTSManager.getInstance();
