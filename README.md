# EPUB Reader for iPad/iPhone

An AI-enabled EPUB reader built with React Native, designed as a companion for reading rather than just a summarizer or QA tool. The app provides a clean, distraction-free reading experience with plans for intelligent companion features.

## 🚀 Features

### Current Features
- **EPUB File Support**: Parse and read standard EPUB files
- **Library Management**: Add books via document picker with local storage
- **Intuitive Reading Interface**: WebView-based reader with clean typography
- **Touch Navigation**: 
  - Left tap: Previous chapter
  - Right tap: Next chapter
  - Center tap: Toggle controls
- **Reading Progress**: Automatic saving and restoration of reading position
- **Customizable Settings**: Typography, colors, spacing (ready for future UI)
- **Cross-platform**: iOS and Android support

### Planned AI Features
- **Reading Companion**: Contextual insights and discussions about content
- **Smart Annotations**: AI-powered note-taking and highlighting
- **Reading Analytics**: Personal reading patterns and recommendations
- **Content Enhancement**: Background information and related topics

## 📱 Screenshots

*Screenshots coming soon...*

## 🛠 Installation

### Prerequisites
- Node.js (>= 18)
- React Native development environment
- iOS: Xcode (for iOS Simulator)
- Android: Android Studio (for Android Emulator)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/shreyjindal81/epubReader.git
   cd epubReader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup**
   ```bash
   cd ios
   bundle install
   bundle exec pod install
   cd ..
   ```

4. **Run the app**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Start Metro bundler
   npm start
   ```

## 📖 How to Use

1. **Add Books**: Tap the "Add Book" button and select EPUB files from your device
2. **Read**: Tap on any book in your library to start reading
3. **Navigate**: Use touch controls while reading:
   - Tap left side of screen: Previous chapter
   - Tap right side of screen: Next chapter
   - Tap center: Show/hide reading controls
4. **Progress**: Your reading position is automatically saved

## 🏗 Project Structure

```
src/
├── components/
│   ├── BookLibrary.tsx    # Library management interface
│   └── EpubReader.tsx     # Main reading interface
├── services/
│   └── EpubParser.ts      # EPUB file parsing logic
├── types/
│   └── index.ts           # TypeScript type definitions
└── utils/                 # Utility functions (future)
```

## 🔧 Technical Stack

- **React Native 0.80**: Cross-platform mobile development
- **TypeScript**: Type safety and better development experience
- **React Native WebView**: EPUB content rendering
- **React Native FS**: File system operations
- **AsyncStorage**: Local data persistence
- **React Native Zip Archive**: EPUB extraction
- **React Native Document Picker**: File selection

## 🤖 AI Integration Roadmap

The app is architected to support AI features:

1. **Phase 1**: Basic companion chat interface
2. **Phase 2**: Contextual reading insights
3. **Phase 3**: Smart annotations and highlights
4. **Phase 4**: Advanced reading analytics
5. **Phase 5**: Personalized recommendations

## 📝 Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React Native and TypeScript
- EPUB parsing inspired by various open-source EPUB libraries
- UI/UX focused on distraction-free reading experience

---

**Note**: This is an active development project. AI companion features are planned for future releases. The current version provides a solid foundation for EPUB reading with room for intelligent enhancements.