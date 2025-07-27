export interface EPubBook {
  id: string;
  title: string;
  author: string;
  cover?: string;
  filePath: string;
  lastPosition?: number;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  href: string;
  order: number;
}

export interface ReadingProgress {
  bookId: string;
  chapterIndex: number;
  scrollPosition: number;
  timestamp: number;
}

export interface ReaderSettings {
  fontSize: number;
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
  lineHeight: number;
  marginHorizontal: number;
  marginVertical: number;
}