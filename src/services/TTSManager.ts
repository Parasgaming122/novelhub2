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
    startIndex: number = 0,
    settings: TTSSettings,
    callbacks: {
      onParagraphChange: (index: number) => void;
      onComplete: () => void;
      onError: (error: any) => void;
    }
  ) {
    // Clean paragraphs of any invisible characters that might cause delays
    this.paragraphs = paragraphs.map(p => p.replace(/[\u200B-\u200D\uFEFF]/g, '').trim());
    this.currentParagraphIndex = startIndex;
    this.onParagraphChange = callbacks.onParagraphChange;
    this.onComplete = callbacks.onComplete;
    this.onError = callbacks.onError;
    this.isPlaying = true;
    this.isPaused = false;
    
    await Speech.stop(); // Stop any current speech before starting
    await this.playParagraph(this.currentParagraphIndex, settings);
  }

  /**
   * Update the paragraphs list without stopping playback (for continuous reading)
   */
  public updateParagraphs(paragraphs: string[]) {
    this.paragraphs = paragraphs.map(p => p.replace(/[\u200B-\u200D\uFEFF]/g, '').trim());
  }

  private async playParagraph(index: number, settings: TTSSettings) {
    if (index >= this.paragraphs.length) {
      this.isPlaying = false;
      this.isPaused = false;
      this.onComplete?.();
      return;
    }

    if (!this.isPlaying || this.isPaused) return;

    this.currentParagraphIndex = index;
    this.onParagraphChange?.(index);

    const text = this.paragraphs[index];
    if (!text || text.length === 0) {
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
          if (this.isPaused) return; // Ignore errors caused by manual pause/stop
          console.error('[TTS] Speech error:', error);
          this.isPlaying = false;
          this.onError?.(error);
        },
      });
    } catch (error) {
      if (this.isPaused) return;
      this.isPlaying = false;
      this.onError?.(error);
    }
  }

  public async pause() {
    this.isPaused = true;
    await Speech.stop();
  }

  public async resume(settings: TTSSettings) {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.isPlaying = true; // Ensure isPlaying is true on resume
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
      this.currentParagraphIndex++;
      if (this.isPlaying && !this.isPaused) {
        Speech.stop().then(() => this.playParagraph(this.currentParagraphIndex, settings));
      } else {
        this.onParagraphChange?.(this.currentParagraphIndex);
      }
    }
  }

  public skipPrevious(settings: TTSSettings) {
    if (this.currentParagraphIndex > 0) {
      this.currentParagraphIndex--;
      if (this.isPlaying && !this.isPaused) {
        Speech.stop().then(() => this.playParagraph(this.currentParagraphIndex, settings));
      } else {
        this.onParagraphChange?.(this.currentParagraphIndex);
      }
    }
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentParagraphIndex: this.currentParagraphIndex,
    };
  }

  public getCurrentIndex(): number {
    return this.currentParagraphIndex;
  }
}

export default TTSManager.getInstance();
