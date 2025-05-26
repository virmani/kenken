# KenKen Puzzle Game PWA

A modern, responsive Progressive Web App (PWA) implementation of the popular KenKen puzzle game. This app generates puzzles dynamically and provides an intuitive interface for solving them on any device.

## Features

### 🧩 Puzzle Generation
- **Dynamic puzzle creation** with customizable grid sizes (3×3 to 6×6)
- **Mathematical operators**: Addition (+), Subtraction (−), Multiplication (×), Division (÷)
- **Three difficulty levels**: Easy, Medium, Hard
- **Smart cage generation** based on difficulty settings

### 📱 Cross-Platform Support
- **Progressive Web App (PWA)** - works offline and can be installed
- **Responsive design** - optimized for phones, tablets, and desktops
- **Touch-friendly interface** with tap-to-select gameplay
- **Keyboard support** for desktop users

### 🎮 Game Features
- **Interactive number pad** showing only valid moves
- **Real-time validation** with visual feedback
- **Smart hint system** suggesting optimal moves
- **Timer** to track solving time
- **Visual feedback** for correct/incorrect cage completions
- **Win celebration** with completion time

### 🎨 Modern UI/UX
- **Beautiful gradient backgrounds** and glassmorphism effects
- **Smooth animations** and transitions
- **Color-coded cages** for easy differentiation
- **Dark mode support** based on system preferences
- **Accessibility features** with proper contrast and focus indicators

## How to Play KenKen

### Basic Rules
1. **Fill the grid** with numbers from 1 to N (where N is the grid size)
2. **No repeating numbers** in any row or column (like Sudoku)
3. **Cage constraints**: Each outlined region (cage) must satisfy its mathematical constraint

### Mathematical Constraints
- **Single cells**: Must contain the exact target number
- **Addition (+)**: Numbers in the cage must sum to the target
- **Subtraction (−)**: The difference between the two numbers equals the target
- **Multiplication (×)**: Numbers in the cage multiply to the target
- **Division (÷)**: One number divided by the other equals the target

### Game Interface
1. **Tap any cell** to select it
2. **Choose a number** from the number pad (only valid options are shown)
3. **Use hints** when stuck
4. **Check solution** to validate your progress
5. **Complete the puzzle** to see your time and celebrate!

## Installation

### Option 1: Direct Browser Access
1. Open any modern web browser
2. Navigate to the game URL
3. The app works immediately - no installation required!

### Option 2: Install as PWA
1. Open the game in Chrome, Firefox, Safari, or Edge
2. Look for the "Install" or "Add to Home Screen" prompt
3. Click install to add the app to your device
4. Launch from your home screen or app menu

### Option 3: Local Development
```bash
# Clone or download the project files
cd kenken-pwa

# Serve the files using any web server
# Python 3:
python -m http.server 8000

# Python 2:
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed):
npx http-server

# Open browser to localhost:8000
```

## File Structure

```
kenken-pwa/
├── index.html          # Main HTML file
├── styles.css          # Responsive CSS styles
├── kenken.js          # Puzzle generation algorithm
├── app.js             # Main application logic
├── manifest.json      # PWA manifest
├── sw.js             # Service worker for offline support
├── icon-192.png      # App icon (192×192)
├── icon-512.png      # App icon (512×512)
└── README.md         # This file
```

## Browser Support

### Fully Supported
- **Chrome 80+** (Android/iOS/Desktop)
- **Firefox 75+** (Android/Desktop)
- **Safari 13+** (iOS/macOS)
- **Edge 80+** (Windows/macOS)

### Partially Supported
- **Older browsers** may lack PWA features but core gameplay still works
- **Internet Explorer** is not supported

## Technical Details

### Technologies Used
- **Vanilla JavaScript** - No external dependencies
- **CSS Grid & Flexbox** - Modern responsive layouts
- **Service Worker API** - Offline functionality
- **Web App Manifest** - PWA installation
- **localStorage** - Game state persistence (future feature)

### Puzzle Generation Algorithm
- **Latin Square generation** using backtracking
- **Cage creation** with mathematical constraint calculation
- **Difficulty scaling** based on cage sizes and complexity
- **Validation system** for real-time feedback

### Performance Features
- **Efficient rendering** with CSS transforms
- **Minimal DOM manipulation** for smooth gameplay
- **Offline-first design** with service worker caching
- **Responsive images** and optimized assets

## Customization

### Adding New Grid Sizes
Edit the `index.html` file and add options to the grid-size select:
```html
<option value="7">7×7</option>
<option value="8">8×8</option>
```

### Modifying Difficulty Settings
Update the `cageSizeLimits` object in `kenken.js`:
```javascript
const cageSizeLimits = {
    easy: { min: 1, max: 2, singleCellChance: 0.5 },
    // ... add custom difficulties
};
```

### Styling Changes
Modify `styles.css` to customize:
- Color schemes
- Animation timings
- Layout proportions
- Typography

## Contributing

This is a complete, standalone implementation that can be easily extended:

1. **Fork the repository**
2. **Create feature branches** for new functionality
3. **Test on multiple devices** and browsers
4. **Submit pull requests** with clear descriptions

### Potential Enhancements
- **Statistics tracking** (solve times, difficulty progression)
- **Puzzle sharing** via URL encoding
- **Multiple themes** and color schemes
- **Sound effects** and haptic feedback
- **Achievement system** and badges
- **Multiplayer mode** with WebRTC

## License

This project is open source and available under the MIT License. Feel free to use, modify, and distribute as needed.

## Credits

- **KenKen puzzle concept** invented by Tetsuya Miyamoto
- **Implementation** by [Your Name]
- **Icons and graphics** can be customized as needed
- **Inspired by** traditional pen-and-paper KenKen puzzles

---

Enjoy playing KenKen! 🧩✨ 