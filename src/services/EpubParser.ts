import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import { EPubBook, Chapter } from '../types';

export class EpubParser {
  static async parseEpub(filePath: string): Promise<EPubBook> {
    try {
      const tempDir = `${RNFS.DocumentDirectoryPath}/temp_epub_${Date.now()}`;
      
      await unzip(filePath, tempDir);
      
      const metaInfPath = `${tempDir}/META-INF/container.xml`;
      const containerXml = await RNFS.readFile(metaInfPath);
      
      const opfPath = this.extractOpfPath(containerXml);
      const fullOpfPath = `${tempDir}/${opfPath}`;
      const opfContent = await RNFS.readFile(fullOpfPath);
      
      const metadata = this.extractMetadata(opfContent);
      const spine = this.extractSpine(opfContent);
      const manifest = this.extractManifest(opfContent);
      
      const basePath = fullOpfPath.substring(0, fullOpfPath.lastIndexOf('/'));
      const chapters = await this.extractChapters(spine, manifest, basePath);
      
      await RNFS.unlink(tempDir);
      
      return {
        id: Date.now().toString(),
        title: metadata.title || 'Unknown Title',
        author: metadata.creator || 'Unknown Author',
        cover: metadata.cover,
        filePath,
        chapters,
      };
    } catch (error) {
      console.error('Error parsing EPUB:', error);
      throw new Error('Failed to parse EPUB file');
    }
  }

  private static extractOpfPath(containerXml: string): string {
    const match = containerXml.match(/full-path="([^"]+)"/);
    return match ? match[1] : 'content.opf';
  }

  private static extractMetadata(opfContent: string): any {
    const metadata: any = {};
    
    const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
    if (titleMatch) metadata.title = titleMatch[1].trim();
    
    const creatorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
    if (creatorMatch) metadata.creator = creatorMatch[1].trim();
    
    return metadata;
  }

  private static extractSpine(opfContent: string): string[] {
    const spine: string[] = [];
    const spineMatch = opfContent.match(/<spine[^>]*>(.*?)<\/spine>/s);
    if (spineMatch) {
      const itemrefs = spineMatch[1].match(/<itemref[^>]*idref="([^"]+)"/g);
      if (itemrefs) {
        itemrefs.forEach(itemref => {
          const idMatch = itemref.match(/idref="([^"]+)"/);
          if (idMatch) spine.push(idMatch[1]);
        });
      }
    }
    return spine;
  }

  private static extractManifest(opfContent: string): Map<string, string> {
    const manifest = new Map<string, string>();
    const manifestMatch = opfContent.match(/<manifest[^>]*>(.*?)<\/manifest>/s);
    if (manifestMatch) {
      const items = manifestMatch[1].match(/<item[^>]*\/>/g);
      if (items) {
        items.forEach(item => {
          const idMatch = item.match(/id="([^"]+)"/);
          const hrefMatch = item.match(/href="([^"]+)"/);
          if (idMatch && hrefMatch) {
            manifest.set(idMatch[1], hrefMatch[1]);
          }
        });
      }
    }
    return manifest;
  }

  private static async extractChapters(
    spine: string[],
    manifest: Map<string, string>,
    basePath: string
  ): Promise<Chapter[]> {
    const chapters: Chapter[] = [];
    
    for (let i = 0; i < spine.length; i++) {
      const id = spine[i];
      const href = manifest.get(id);
      
      if (href) {
        try {
          const chapterPath = `${basePath}/${href}`;
          const content = await RNFS.readFile(chapterPath);
          
          const title = this.extractChapterTitle(content) || `Chapter ${i + 1}`;
          
          chapters.push({
            id,
            title,
            content,
            href,
            order: i,
          });
        } catch (error) {
          console.warn(`Failed to load chapter ${href}:`, error);
        }
      }
    }
    
    return chapters;
  }

  private static extractChapterTitle(htmlContent: string): string | null {
    const titleMatches = [
      /<title[^>]*>([^<]+)<\/title>/i,
      /<h1[^>]*>([^<]+)<\/h1>/i,
      /<h2[^>]*>([^<]+)<\/h2>/i,
    ];
    
    for (const regex of titleMatches) {
      const match = htmlContent.match(regex);
      if (match) return match[1].trim();
    }
    
    return null;
  }
}