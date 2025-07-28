import { EPubBook, Chapter } from '../types';

export class EpubParser {
  static async parseEpub(filePath: string): Promise<EPubBook> {
    try {
      // Use simplified parser for now - will implement full EPUB parsing later
      return this.parseSimpleEpub(filePath);
    } catch (error) {
      console.error('Error parsing EPUB:', error);
      throw new Error('Failed to parse EPUB file');
    }
  }

  private static async parseSimpleEpub(filePath: string): Promise<EPubBook> {
    const fileName = filePath.split('/').pop() || 'Unknown Book';
    const bookTitle = fileName.replace(/\.[^/.]+$/, '');
    
    const chapters: Chapter[] = [
      {
        id: 'chapter1',
        title: 'Chapter 1: Getting Started',
        content: this.createSampleChapterContent('Chapter 1: Getting Started', 'Welcome to your EPUB reader! This is a sample chapter to demonstrate the reading interface.'),
        href: 'chapter1.html',
        order: 0,
      },
      {
        id: 'chapter2',
        title: 'Chapter 2: Features',
        content: this.createSampleChapterContent('Chapter 2: Features', 'This reader is designed to work with AI companions for enhanced reading experiences.'),
        href: 'chapter2.html',
        order: 1,
      },
      {
        id: 'chapter3',
        title: 'Chapter 3: Future Plans',
        content: this.createSampleChapterContent('Chapter 3: Future Plans', 'Soon you\'ll be able to discuss books with intelligent AI assistants!'),
        href: 'chapter3.html',
        order: 2,
      },
    ];

    return {
      id: Date.now().toString(),
      title: bookTitle,
      author: 'Demo Author',
      filePath,
      chapters,
    };
  }

  private static createSampleChapterContent(title: string, content: string): string {
    return `
      <html>
        <head>
          <title>${title}</title>
        </head>
        <body>
          <h1>${title}</h1>
          <p>${content}</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
        </body>
      </html>
    `;
  }

  // TODO: Implement full EPUB parsing with ZIP extraction
  // These methods will be restored once we solve the CocoaPods dependency issues
}