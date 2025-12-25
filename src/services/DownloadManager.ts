// Novel Reader - Download Manager Service

import { fetchChapter } from '../api/client';
import { useDownloadsStore as useDownloads } from '../stores/downloadsStore';
import { parseChapterContent } from '../utils/textParser';
import { Chapter, DownloadedChapter } from '../types';

class DownloadManager {
  private static instance: DownloadManager;
  private queue: { novelId: string; novelTitle: string; chapter: Chapter }[] = [];
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
    chapters: Chapter[]
  ) {
    const downloadsStore = useDownloads.getState();
    
    // Filter out already downloaded chapters
    const toDownload = chapters.filter(
      (ch) => !downloadsStore.isChapterDownloaded(novelId, ch.id)
    );

    // Add to queue
    toDownload.forEach((chapter) => {
      this.queue.push({ novelId, novelTitle, chapter });
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

      // 4. Save to store
      useDownloads.getState().addChapter(downloadedChapter);
      
      console.log(`Downloaded: ${chapter.title}`);
    } catch (error) {
      console.error(`Failed to download chapter: ${item.chapter.title}`, error);
      // We could add retry logic here
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
