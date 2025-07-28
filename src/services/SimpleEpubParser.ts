import { EPubBook, Chapter } from '../types';

export class SimpleEpubParser {
  static async parseEpub(filePath: string): Promise<EPubBook> {
    try {
      // For now, create a mock book structure
      // This will be replaced with actual EPUB parsing later
      const fileName = filePath.split('/').pop() || 'Unknown Book';
      const bookTitle = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
      
      // Create sample chapters for testing
      const chapters: Chapter[] = [
        {
          id: 'chapter1',
          title: 'Chapter 1: Introduction',
          content: this.createSampleChapterContent('Chapter 1: Introduction', 'This is the beginning of our story. Welcome to the world of EPUB reading with AI companions.'),
          href: 'chapter1.html',
          order: 0,
        },
        {
          id: 'chapter2',
          title: 'Chapter 2: Getting Started',
          content: this.createSampleChapterContent('Chapter 2: Getting Started', 'Now that you\'ve opened your first book, let\'s explore the features of this reader.'),
          href: 'chapter2.html',
          order: 1,
        },
        {
          id: 'chapter3',
          title: 'Chapter 3: AI Companion Features',
          content: this.createSampleChapterContent('Chapter 3: AI Companion Features', 'Soon, you\'ll be able to discuss this content with an AI companion that understands the context of what you\'re reading.'),
          href: 'chapter3.html',
          order: 2,
        },
      ];

      return {
        id: Date.now().toString(),
        title: bookTitle,
        author: 'Sample Author',
        filePath,
        chapters,
      };
    } catch (error) {
      console.error('Error parsing EPUB:', error);
      throw new Error('Failed to parse EPUB file');
    }
  }

  private static createSampleChapterContent(title: string, content: string): string {
    return `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Georgia, serif; line-height: 1.6; }
            h1 { color: #333; margin-bottom: 1em; }
            p { margin-bottom: 1em; text-align: justify; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>${content}</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
          <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
        </body>
      </html>
    `;
  }

  // Future: Add real EPUB parsing methods
  static async parseRealEpub(filePath: string): Promise<EPubBook> {
    // This will be implemented later with proper EPUB parsing
    // For now, fallback to sample content
    return this.parseEpub(filePath);
  }
}