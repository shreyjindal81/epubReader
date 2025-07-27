import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EPubBook, Chapter, ReadingProgress, ReaderSettings } from '../types';

interface EpubReaderProps {
  book: EPubBook;
  onBack: () => void;
}

export const EpubReader: React.FC<EpubReaderProps> = ({ book, onBack }) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 16,
    fontFamily: 'Georgia',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    lineHeight: 1.6,
    marginHorizontal: 20,
    marginVertical: 20,
  });

  const currentChapter = book.chapters[currentChapterIndex];

  const loadReadingProgress = React.useCallback(async () => {
    try {
      const progressData = await AsyncStorage.getItem(`progress_${book.id}`);
      if (progressData) {
        const progress: ReadingProgress = JSON.parse(progressData);
        setCurrentChapterIndex(progress.chapterIndex);
      }
    } catch (error) {
      console.error('Error loading reading progress:', error);
    }
  }, [book.id]);

  const saveReadingProgress = React.useCallback(async () => {
    try {
      const progress: ReadingProgress = {
        bookId: book.id,
        chapterIndex: currentChapterIndex,
        scrollPosition: 0,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(`progress_${book.id}`, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving reading progress:', error);
    }
  }, [book.id, currentChapterIndex]);

  const loadSettings = React.useCallback(async () => {
    try {
      const settingsData = await AsyncStorage.getItem('reader_settings');
      if (settingsData) {
        const savedSettings: ReaderSettings = JSON.parse(settingsData);
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  useEffect(() => {
    const initializeReader = async () => {
      await loadReadingProgress();
      await loadSettings();
    };
    initializeReader();
  }, [loadReadingProgress, loadSettings]);

  useEffect(() => {
    const saveProgress = async () => {
      await saveReadingProgress();
    };
    saveProgress();
  }, [currentChapterIndex, saveReadingProgress]);

  const goToNextChapter = () => {
    if (currentChapterIndex < book.chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  const goToPreviousChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  const generateHTML = (chapter: Chapter) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${chapter.title}</title>
          <style>
            body {
              font-family: ${settings.fontFamily};
              font-size: ${settings.fontSize}px;
              line-height: ${settings.lineHeight};
              color: ${settings.textColor};
              background-color: ${settings.backgroundColor};
              margin: ${settings.marginVertical}px ${settings.marginHorizontal}px;
              padding: 0;
              text-align: justify;
            }
            h1, h2, h3, h4, h5, h6 {
              color: ${settings.textColor};
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            p {
              margin-bottom: 1em;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            .chapter-title {
              font-size: 1.5em;
              font-weight: bold;
              margin-bottom: 1em;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="chapter-title">${chapter.title}</div>
          ${chapter.content}
          <script>
            document.addEventListener('click', function(event) {
              const x = event.clientX;
              const screenWidth = window.innerWidth;
              
              if (x < screenWidth / 3) {
                window.ReactNativeWebView.postMessage(JSON.stringify({action: 'prev'}));
              } else if (x > (screenWidth * 2) / 3) {
                window.ReactNativeWebView.postMessage(JSON.stringify({action: 'next'}));
              } else {
                window.ReactNativeWebView.postMessage(JSON.stringify({action: 'toggle_controls'}));
              }
            });
          </script>
        </body>
      </html>
    `;
  };

  const onWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      switch (message.action) {
        case 'prev':
          goToPreviousChapter();
          break;
        case 'next':
          goToNextChapter();
          break;
        case 'toggle_controls':
          setShowControls(!showControls);
          break;
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={!showControls} />
      
      {showControls && (
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {book.title}
          </Text>
          <View style={styles.placeholder} />
        </View>
      )}

      <WebView
        source={{ html: generateHTML(currentChapter) }}
        style={styles.webView}
        onMessage={onWebViewMessage}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        injectedJavaScript=""
      />

      {showControls && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentChapterIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={goToPreviousChapter}
            disabled={currentChapterIndex === 0}
          >
            <Text style={styles.navButtonText}>← Previous</Text>
          </TouchableOpacity>

          <Text style={styles.chapterInfo}>
            {currentChapterIndex + 1} / {book.chapters.length}
          </Text>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentChapterIndex === book.chapters.length - 1 && styles.navButtonDisabled,
            ]}
            onPress={goToNextChapter}
            disabled={currentChapterIndex === book.chapters.length - 1}
          >
            <Text style={styles.navButtonText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bookTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 60,
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  navButtonDisabled: {
    backgroundColor: '#ccc',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chapterInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});