import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EPubBook } from '../types';
import { EpubParser } from '../services/EpubParser';

interface SimpleBookLibraryProps {
  onBookSelect: (book: EPubBook) => void;
}

export const SimpleBookLibrary: React.FC<SimpleBookLibraryProps> = ({ onBookSelect }) => {
  const [books, setBooks] = useState<EPubBook[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const storedBooks = await AsyncStorage.getItem('epub_books');
      if (storedBooks) {
        setBooks(JSON.parse(storedBooks));
      } else {
        // Add sample books if none exist
        const sampleBooks = await createSampleBooks();
        await saveBooks(sampleBooks);
      }
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  const createSampleBooks = async (): Promise<EPubBook[]> => {
    const sampleBooks: EPubBook[] = [];
    
    const bookTitles = [
      'The Great Gatsby',
      'To Kill a Mockingbird',
      'Pride and Prejudice',
      'The Catcher in the Rye',
      '1984'
    ];

    for (const title of bookTitles) {
      const book = await EpubParser.parseEpub(`sample_${title.replace(/\s+/g, '_').toLowerCase()}.epub`);
      book.title = title;
      book.author = 'Demo Author';
      sampleBooks.push(book);
    }

    return sampleBooks;
  };

  const saveBooks = async (updatedBooks: EPubBook[]) => {
    try {
      await AsyncStorage.setItem('epub_books', JSON.stringify(updatedBooks));
      setBooks(updatedBooks);
    } catch (error) {
      console.error('Error saving books:', error);
    }
  };

  const addSampleBook = async () => {
    try {
      setLoading(true);
      const newBook = await EpubParser.parseEpub(`sample_book_${Date.now()}.epub`);
      newBook.title = `Sample Book ${books.length + 1}`;
      newBook.author = 'Demo Author';
      
      const updatedBooks = [...books, newBook];
      await saveBooks(updatedBooks);
      Alert.alert('Success', 'Sample book added to library!');
    } catch (error) {
      console.error('Error adding book:', error);
      Alert.alert('Error', 'Failed to add book to library');
    } finally {
      setLoading(false);
    }
  };

  const renderBook = ({ item }: { item: EPubBook }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => onBookSelect(item)}
    >
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.author}
        </Text>
        <Text style={styles.bookChapters}>
          {item.chapters.length} chapters
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My EPUB Library</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={addSampleBook}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>
            {loading ? 'Adding...' : '+ Add Sample Book'}
          </Text>
        </TouchableOpacity>
      </View>

      {books.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Loading your library...
          </Text>
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderBook}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.bookList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bookList: {
    padding: 20,
  },
  bookItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  bookChapters: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});