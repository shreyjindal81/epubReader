/**
 * EPUB Reader App
 * @format
 */

import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { SimpleBookLibrary } from './src/components/SimpleBookLibrary';
import { EpubReader } from './src/components/EpubReader';
import { EPubBook } from './src/types';

function App() {
  const [selectedBook, setSelectedBook] = useState<EPubBook | null>(null);

  const handleBookSelect = (book: EPubBook) => {
    setSelectedBook(book);
  };

  const handleBackToLibrary = () => {
    setSelectedBook(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {selectedBook ? (
        <EpubReader book={selectedBook} onBack={handleBackToLibrary} />
      ) : (
        <SimpleBookLibrary onBookSelect={handleBookSelect} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default App;
