# NetworkAnalyzer - Professional C++ Code Builder

A modern, accessible web-based interface for compiling C++ code with excellent UX/UI design.

![NetworkAnalyzer Interface](https://github.com/user-attachments/assets/3bad99ed-8428-40d8-973c-79dc584f4ebe)

## Features

### 🎨 Modern UI/UX Design
- Clean, professional interface with intuitive layout
- Responsive design that works on desktop, tablet, and mobile
- High contrast design with accessible color schemes
- Smooth animations and transitions for better user experience
- Professional typography and spacing

### ♿ Accessibility First
- Full ARIA labels and semantic HTML structure
- Screen reader support with live announcements
- Keyboard navigation and shortcuts
- High contrast mode support
- Focus management and visual indicators
- Proper heading hierarchy

### 💻 Code Editor Features
- C++ syntax highlighting (when CodeMirror is available)
- Line numbers and code formatting
- Auto-closing brackets and syntax assistance
- Sample code loading with complex examples
- Clear editor functionality with confirmation
- Keyboard shortcuts for common actions

### 🔧 Compilation & Build
- Real-time C++ code compilation using g++
- Clear error reporting with line numbers
- Success notifications with download functionality
- Loading states and user feedback
- Comprehensive error handling

### 📱 Mobile Responsive
- Optimized layout for mobile devices
- Touch-friendly interface elements
- Stackable layout on smaller screens
- Maintained functionality across all screen sizes

![Mobile Interface](https://github.com/user-attachments/assets/6b29d239-e6d5-4126-be42-e208657dcb9f)

## Keyboard Shortcuts

- `Ctrl + Enter` - Compile code
- `Ctrl + L` - Clear editor
- `F1` - Show help
- `Escape` - Close modals

## Technical Implementation

### Frontend Architecture
- **Vanilla JavaScript** with ES6+ features
- **CSS Grid & Flexbox** for responsive layouts
- **CSS Custom Properties** for theming
- **CodeMirror** integration for enhanced code editing
- **Progressive Enhancement** - works without external dependencies

### Backend API
- **Express.js** server with CORS support
- **G++ compiler** integration
- **File system** management for builds
- **Static file serving** for the frontend

### Accessibility Features
- WCAG 2.1 AA compliance
- Screen reader announcements
- Keyboard-only navigation support
- High contrast mode compatibility
- Semantic HTML5 structure

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   node server.js
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Usage

1. **Write Code:** Enter your C++ code in the editor
2. **Compile:** Click "Compile Code" or use `Ctrl + Enter`
3. **Download:** If compilation succeeds, download your executable
4. **Debug:** Fix any errors shown in the error panel

## Sample Code

The interface includes a sample calculator program demonstrating:
- Object-oriented C++ programming
- Input/output operations
- Error handling
- Standard library usage

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with modern JavaScript support

## Architecture

```
exe-builder/
├── public/                 # Frontend assets
│   ├── index.html         # Main interface
│   ├── css/
│   │   └── styles.css     # Modern, accessible styling
│   └── js/
│       └── app.js         # Interactive functionality
├── build/                 # Compilation output (auto-created)
├── server.js              # Backend API
└── package.json           # Dependencies
```

## Contributing

1. Follow accessibility guidelines (WCAG 2.1 AA)
2. Test across different screen sizes
3. Ensure keyboard navigation works
4. Add appropriate ARIA labels
5. Test with screen readers when possible

## License

© 2024 NetworkAnalyzer. Professional development tools.