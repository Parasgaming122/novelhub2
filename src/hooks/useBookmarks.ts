// Novel Reader - Bookmarks Hook

import { useCallback } from 'react';
import { useReaderStore } from '../stores/readerStore';
import { Bookmark, BookmarkColor } from '../types';

export function useBookmarks(novelId?: string, chapterId?: string) {
  const {
    bookmarks,
    addBookmark: addBookmarkToStore,
    removeBookmark,
    updateBookmarkColor,
    getBookmarksForChapter,
    getBookmarksForNovel,
  } = useReaderStore();

  const chapterBookmarks = novelId && chapterId 
    ? getBookmarksForChapter(novelId, chapterId) 
    : [];
    
  const novelBookmarks = novelId 
    ? getBookmarksForNovel(novelId) 
    : [];

  const addBookmark = useCallback((
    chapterTitle: string,
    novelTitle: string,
    paragraphIndex: number,
    paragraphText: string,
    color: BookmarkColor = 'yellow'
  ) => {
    if (!novelId || !chapterId) return;
    
    addBookmarkToStore({
      novelId,
      novelTitle,
      chapterId,
      chapterTitle,
      paragraphIndex,
      paragraphText,
      color,
    });
  }, [novelId, chapterId, addBookmarkToStore]);

  const isParagraphBookmarked = useCallback((paragraphIndex: number) => {
    return chapterBookmarks.some(b => b.paragraphIndex === paragraphIndex);
  }, [chapterBookmarks]);

  const toggleBookmark = useCallback((
    chapterTitle: string,
    novelTitle: string,
    paragraphIndex: number,
    paragraphText: string
  ) => {
    const existing = chapterBookmarks.find(b => b.paragraphIndex === paragraphIndex);
    if (existing) {
      removeBookmark(existing.id);
    } else {
      addBookmark(chapterTitle, novelTitle, paragraphIndex, paragraphText);
    }
  }, [chapterBookmarks, removeBookmark, addBookmark]);

  return {
    bookmarks,
    chapterBookmarks,
    novelBookmarks,
    addBookmark,
    removeBookmark,
    updateBookmarkColor,
    isParagraphBookmarked,
    toggleBookmark,
  };
}
