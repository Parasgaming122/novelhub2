// Novel Reader - Download Manager Service

import { fetchChapter } from '../api/client';
import { useDownloadsStore as useDownloads } from '../stores/downloadsStore';
import { useSettingsStore } from '../stores/settingsStore';
import { parseChapterContent } from '../utils/textParser';
import { Chapter, DownloadedChapter } from '../types';

class DownloadManager {
  private static instance: DownloadManager;
  private queue: { novelId: string; novelTitle: string; coverImage?: string; chapter: Chapter }[] = [];
  private isProcessing: boolean = false;
  private activeDownloads: number = 0;
  private MAX_CONCURRENT = 3;

  private constructor() {}

  public static getInstance(): DownloadManager {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
  }

  public async downloadChapters(
    novelId: string,
    novelTitle: string,
    chapters: Chapter[],
    coverImage?: string
  ) {
    const downloadsStore = useDownloads.getState();
    
    // Filter out already downloaded chapters
    const toDownload = chapters.filter(
      (ch) => !downloadsStore.isChapterDownloaded(novelId, ch.id)
    );

    // Add to queue
    toDownload.forEach((chapter) => {
      this.queue.push({ novelId, novelTitle, coverImage, chapter });
    });

    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    if (this.activeDownloads >= this.MAX_CONCURRENT) return;

    this.isProcessing = true;

    while (this.queue.length > 0 && this.activeDownloads < this.MAX_CONCURRENT) {
      const item = this.queue.shift();
      if (!item) break;

      this.activeDownloads++;
      this.startDownload(item).finally(() => {
        this.activeDownloads--;
        this.processQueue();
      });
    }

    this.isProcessing = false;
  }

  private async startDownload(item: {
    novelId: string;
    novelTitle: string;
    coverImage?: string;
    chapter: Chapter;
  }) {
    try {
      const { novelId, novelTitle, chapter } = item;
      
      // 1. Fetch content
      const contentData = await fetchChapter(novelId, chapter.id);
      
      // 2. Parse content (optional, but good for offline speed)
      const parsed = parseChapterContent(contentData.content);
      
      // 3. Create downloaded chapter object
      const downloadedChapter: DownloadedChapter = {
        novelId,
        novelTitle,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        content: contentData.content,
        paragraphs: parsed.paragraphs,
        downloadedAt: Date.now(),
        size: contentData.content.length, // Rough size estimate in bytes
      };

      // 4. Enforce storage limits (LRU)
      this.enforceStorageLimits(downloadedChapter.size);
      
      // 5. Save to store
      useDownloads.getState().addChapter(downloadedChapter, item.coverImage);
      
      console.log(`Downloaded: ${chapter.title}`);
    } catch (error) {
      console.error(`Failed to download chapter: ${item.chapter.title}`, error);
      // We could add retry logic here
    }
  }

  private enforceStorageLimits(newChapterSize: number) {
    const downloadsStore = useDownloads.getState();
    const settingsStore = useSettingsStore.getState();
    
    const maxChapters = settingsStore.maxDownloadedChapters;
    const maxSize = settingsStore.maxStorageSize * 1024 * 1024; // MB to bytes
    
    let currentNovels = [...downloadsStore.downloadedNovels];
    
    // Sort all chapters by date across all novels to find the oldest
    interface ChapterInfo {
      novelId: string;
      chapterId: string;
      downloadedAt: number;
    }
    
    let allChapters: ChapterInfo[] = [];
    let totalSize = newChapterSize;
    let totalChaptersCount = 1;

    currentNovels.forEach(novel => {
      totalSize += novel.totalSize;
      totalChaptersCount += novel.chapters.length;
      novel.chapters.forEach(ch => {
        allChapters.push({
          novelId: novel.novelId,
          chapterId: ch.chapterId,
          downloadedAt: ch.downloadedAt,
        });
      });
    });

    // Sort by oldest first
    allChapters.sort((a, b) => a.downloadedAt - b.downloadedAt);

    // Remove oldest until within limits
    while (
      (totalChaptersCount > maxChapters || totalSize > maxSize) && 
      allChapters.length > 0
    ) {
      const oldest = allChapters.shift();
      if (!oldest) break;

      const novel = currentNovels.find(n => n.novelId === oldest.novelId);
      const chapter = novel?.chapters.find(c => c.chapterId === oldest.chapterId);
      
      if (chapter) {
        totalSize -= chapter.size;
        totalChaptersCount -= 1;
        downloadsStore.removeChapter(oldest.novelId, oldest.chapterId);
      }
    }
  }

  public getQueueLength() {
    return this.queue.length;
  }

  public cancelAll() {
    this.queue = [];
  }
}

export default DownloadManager.getInstance();
