# SnackOS 🖥️

<div align="center">

![Captain America](./assets/png-icons/icons8-captain-america-100.png)
![Spider-Man](./assets/png-icons/icons8-spider-man-new-50.png)
![Batman](./assets/png-icons/icons8-batman-50.png)

**A browser-based operating system simulation — Your personal JARVIS prototype!**

*"Just like Iron Man's AI assistant, but running in your browser"*

</div>

---

## 🎯 What is SnackOS?

SnackOS is a fully functional **browser simulation of an operating system** with **voice control** capabilities. It's a prototype of what a voice-controlled OS could look like — think of it as your own mini JARVIS! 🤖

Built with React, it features a complete desktop environment with multiple apps, voice commands, and a beautiful user interface inspired by modern operating systems.

---

## 🎤 Voice Commands

SnackOS features an **always-on voice assistant** that responds to natural language. Just speak, and it obeys!

### 🚀 App Control

#### Opening Apps
```
"Open calculator"
"Launch terminal"
"Play tic tac toe"
"Start snake game"
"Show calendar"
"Open files"
"Launch music player"
"Open paint"
"Show clock"
"Open notes"
"Start task manager"
"Launch todo"
"Open settings"
```

#### Closing Apps
```
"Close calculator"
"Exit terminal"
"Close tic tac toe"
"Quit snake"
"Close all" (closes all open windows)
```

### 🧮 Calculator Commands
```
"What is 9 times 2"
"Calculate 45 plus 33"
"12 minus 7"
"100 divided by 5"
```

### 📅 Calendar Commands
```
"Open november 2023 calendar"
"Open january 2026 calendar"
"What day is on 29th january 2030"
"What is the date on next monday"
"Add new event - my birthday is on 28th december"
```

### 📝 To-Do Commands
```
"Add in the todo list - buy groceries at 5 pm"
"Add in the todo list - meeting tomorrow at 10 am"
```

### 🎨 Paint Commands
```
"Draw a circle"
"Draw a square"
"Draw a triangle"
"Draw a star"
"Draw a heart"
"Draw a cat"
"Draw a smiley"
"Draw a house"
"Draw a tree"
"Draw number 3"
"Draw letter A"
"Clear canvas"
```

### 🖼️ Wallpaper Commands
```
"Change the wallpaper" (cycles through all wallpapers)
```

---

## 📱 Apps & Features

### 🧮 Calculator
- **Scientific calculator** with multiple modes
- Basic, scientific, and programmer modes
- History tracking
- Keyboard shortcuts support
- Voice-controlled calculations

### 🎮 Games

#### Snake Game
- Classic snake gameplay
- Score tracking
- Speed increases as you progress
- Keyboard controls (arrow keys)

#### Tic Tac Toe
- Play against an **unbeatable AI** (Minimax algorithm)
- Three difficulty levels: Easy, Medium, Impossible
- Score tracking
- Beautiful animations

### 📅 Calendar
- Month/year navigation
- Event creation and management
- Color-coded events
- Voice-controlled navigation
- Natural language date queries

### 🗂️ File Manager
- Virtual file system
- Create/delete files and folders
- Navigate directories
- File preview
- Modern UI with breadcrumbs

### 📝 Notes
- Simple note-taking app
- Auto-save functionality
- Multiple notes support
- Clean, distraction-free interface

### 💼 Task Manager
- Real-time CPU/memory/disk usage simulation
- List all running apps
- Kill/close apps
- System resource monitoring

### 🖥️ Terminal
- Functional command-line interface
- Commands: `ls`, `cd`, `cat`, `echo`, `clear`, `neofetch`, `help`
- Command history (↑/↓ arrows)
- Tab auto-completion
- Classic terminal aesthetics

### ✅ To-Do List
- Create tasks with priorities (low, medium, high)
- Set deadlines
- Categories
- Browser notifications
- Filter by status/priority
- Voice-controlled task creation

### 🎨 Paint
- Brush, eraser, fill bucket tools
- Color picker
- Adjustable brush sizes
- Undo/redo functionality
- Export as PNG
- Voice-controlled drawing

### 🎵 Music Player
- Upload and play MP3 files
- Playlist management
- Real-time audio visualizer (3 modes: bars, circular, waveform)
- Playback controls (play, pause, next, previous)
- Shuffle and repeat modes
- Volume control
- Beautiful glassmorphism UI

### 📖 Markdown Editor
- Split-pane view (editor + live preview)
- Export options (HTML, Markdown, PDF)
- Syntax highlighting
- Auto-save

### 🕐 Clock
- Analog clock with world time
- Multiple timezone support
- Stopwatch
- Timer
- Real-time updates

### ⚙️ Settings
- Theme toggle (light/dark)
- Accent color customization
- Wallpaper selection (7 beautiful wallpapers)
- Clock format (12h/24h)

---

## ✨ Features

### 🎤 Voice Assistant
- **Always-on listening** — no need to press a button
- Natural language processing
- Supports casual phrasing ("hey close the calculator please")
- Real-time feedback
- Floating microphone button

### 🪟 Window Management
- Drag and drop windows
- Resize windows
- Minimize/maximize/close
- Window snapping (drag to edges)
- Focus management
- Multiple windows simultaneously

### 🎨 Beautiful UI
- Modern, clean design
- Glassmorphism effects
- Smooth animations
- macOS-inspired aesthetics
- Dark theme optimized
- Responsive layout

### 🔋 System Features
- **Real-time battery status** (shows actual laptop battery)
- Date and time display
- WiFi status
- Volume control
- GitHub link

### 💾 Smart Loading
- Asset preloading for smooth experience
- Service worker caching
- Offline support
- Progress tracking

### 🖥️ Fullscreen Mode
- Welcome screen with automatic fullscreen prompt
- F11 keyboard shortcut support
- Optimal viewing experience

---

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/snackos.git

# Navigate to directory
cd snackos

# Install dependencies
npm install

# Run development server
npm run dev
```

### Usage

1. Open the website in your browser
2. Allow microphone access for voice commands
3. Click "Enter Fullscreen Mode" for the best experience
4. Start exploring — use voice commands or click on dock icons!

---

## 🛠️ Tech Stack

- **React** — UI framework
- **TypeScript** — Type safety
- **Zustand** — State management
- **Framer Motion** — Animations
- **Lucide Icons** — Beautiful icons
- **Web APIs** — Speech Recognition, Battery Status, Web Audio
- **Vite** — Build tool

---

## 🎯 Voice Assistant Tips

1. **Speak clearly** — The mic is always listening
2. **Be natural** — "Hey, open the calculator please" works!
3. **Try variations** — "launch", "start", "play", "open" all work
4. **Use filler words** — It ignores "please", "hey", "the", etc.
5. **Calculator** — Just ask math questions naturally
6. **Paint** — Command it to draw shapes, numbers, or objects

---

## 🌟 Highlights

✅ **Voice-controlled everything** — Open apps, close apps, calculate, draw, add todos  
✅ **Unbeatable Tic Tac Toe AI** — Challenge the Minimax algorithm  
✅ **Real battery status** — Shows your actual laptop battery  
✅ **Audio visualizer** — Beautiful real-time music visualization  
✅ **Smart preloading** — All assets loaded for smooth experience  
✅ **Natural language** — Talk to it like JARVIS!  

---

## 📸 Screenshots

<div align="center">

### Desktop Environment
*Beautiful desktop with multiple windows, dock, and voice assistant*

### Voice-Controlled Apps
*Speak commands to control everything — just like Iron Man's JARVIS!*

### Games & Productivity
*From Snake to Tic Tac Toe, Notes to Calendar — everything you need*

</div>

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**Soham Dave**
- GitHub: [@davesohamm](https://github.com/davesohamm)

---

<div align="center">

![Windows](./assets/png-icons/icons8-windows-11-50.png)
![Calendar](./assets/png-icons/icons8-calendar-app-50.png)
![Files](./assets/png-icons/icons8-files-50.png)
![Notes](./assets/png-icons/icons8-notes-50.png)

**Built with ❤️ and React**

*"Your personal JARVIS awaits — just say the word!"* 🎤✨

</div>
