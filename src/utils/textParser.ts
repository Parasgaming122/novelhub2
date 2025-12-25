// Novel Reader - Text Parser Utility

import { ParsedChapter } from '../types';

// Simple HTML tag regex
const HTML_TAG_REGEX = /<[^>]*>/g;
const MULTIPLE_SPACES_REGEX = /\s+/g;
const MULTIPLE_NEWLINES_REGEX = /\n{3,}/g;

/**
 * Strip HTML tags from text
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  
  // Replace common HTML entities
  let text = html
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'");

  // Replace <br>, <p>, <div> with newlines
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n');

  // Remove all other HTML tags
  text = text.replace(HTML_TAG_REGEX, '');

  // Clean up whitespace
  text = text
    .replace(MULTIPLE_SPACES_REGEX, ' ')
    .replace(MULTIPLE_NEWLINES_REGEX, '\n\n')
    .trim();

  return text;
}

/**
 * Split text into paragraphs
 */
export function splitIntoParagraphs(text: string): string[] {
  if (!text) return [];

  // Split by double newlines or single newlines
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // If we only got one paragraph and it's long, try to split by single newlines
  if (paragraphs.length === 1 && paragraphs[0].length > 500) {
    const singleNewlineSplit = text
      .split(/\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    
    if (singleNewlineSplit.length > 1) {
      return singleNewlineSplit;
    }
  }

  return paragraphs;
}

/**
 * Clean text for TTS reading
 */
export function cleanForTTS(text: string): string {
  if (!text) return '';

  return text
    // Remove URLs
    .replace(/https?:\/\/[^\s]+/g, '')
    // Remove email addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
    // Replace common abbreviations for better pronunciation
    .replace(/\bCh\.\s*(\d+)/gi, 'Chapter $1')
    .replace(/\bVol\.\s*(\d+)/gi, 'Volume $1')
    .replace(/\betc\./gi, 'etcetera')
    .replace(/\bi\.e\./gi, 'that is')
    .replace(/\be\.g\./gi, 'for example')
    // Remove excessive punctuation
    .replace(/\.{3,}/g, '...')
    .replace(/!{2,}/g, '!')
    .replace(/\?{2,}/g, '?')
    .trim();
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  if (!text) return 0;
  
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  
  return words.length;
}

/**
 * Parse chapter HTML content into clean paragraphs
 */
export function parseChapterContent(htmlContent: string): ParsedChapter {
  // Strip HTML
  const plainText = stripHtml(htmlContent);
  
  // Split into paragraphs
  const paragraphs = splitIntoParagraphs(plainText);
  
  // Clean paragraphs for TTS
  const cleanedParagraphs = paragraphs.map(cleanForTTS);
  
  // Count total words
  const wordCount = cleanedParagraphs.reduce(
    (total, p) => total + countWords(p),
    0
  );

  return {
    paragraphs: cleanedParagraphs,
    wordCount,
  };
}

/**
 * Get reading time estimate in minutes
 */
export function getReadingTime(wordCount: number, wordsPerMinute = 200): number {
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Extract chapter number from title
 */
export function extractChapterNumber(title: string): number | null {
  const match = title.match(/chapter\s*(\d+)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  const numMatch = title.match(/^(\d+)/);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }
  
  return null;
}
