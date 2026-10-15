# Nexus OS — Modern Offline-First Browser Operating System

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-443e38?style=for-the-badge&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

> **Nexus OS** is an ultra-sleek, minimalist, offline-first web desktop experience built with React 18, TypeScript, Zustand, and Framer Motion. It delivers a native-class desktop interface complete with window management, a virtual file system (VFS), live device telemetry, and built-in system applications.

---

## 🌟 Key Features

### 🖥️ Window Management & Desktop Engine
- **8-Way Resizing & Snapping**: Full drag, maximize, minimize, restore, and edge snapping preview (Left / Right split, Fullscreen).
- **Z-Index Focus Stacking**: Dynamic window layering with focus restoration and Alt+Tab window cycling.
- **Error Boundaries**: Sandboxed application runtime that catches uncaught exceptions gracefully without crashing the OS.
- **Spring Physics**: Responsive opening, closing, and dock minimization micro-interactions powered by Framer Motion.

### 🌐 Interactive Top Status Bar
- **Real Hardware Battery API**: Queries `navigator.getBattery()` to track live battery level and charging status with dynamic battery icon states.
- **Live Weather Integration**: Uses browser Geolocation and the Open-Meteo API for real-time temperature (°C) and weather telemetry.
- **Interactive Music Visualizer**: "Music Jumping" equalizer badge that reacts to music playback and opens the Music Player on click.
- **Calendar & Schedule Drawer**: Interactive clock with popover calendar, month navigation, and daily event logs.
- **User Profile Pill**: Dynamic user badge synced across Boot Screen, Start Menu, and Settings.

### 📁 Virtual File System (VFS) & Clipboard Engine
- **IndexedDB Persistence**: Asynchronous background persistence storing full file hierarchy (`/Desktop`, `/Documents`, `/Pictures`, `/Music`, `/Downloads`).
- **Context Menu Engine**: Full right-click context menu supporting **Open**, **Copy**, **Cut** (with icon dimming), **Paste**, **Delete**, and **Properties**.
- **Sample Data Seeding**: Automatic seeding of default documents, wallpaper assets, and audio samples on first boot.

### 🤖 Built-in Desktop Applications
1. **File Explorer**: Hierarchy tree navigation, folder creation, file opening, and context actions.
2. **Web Browser**: Tabbed browsing simulation with bookmark bar, address input, and search engine options.
3. **Notes**: Rich plain-text editor with auto-save to VFS.
4. **Photo Gallery**: Fullscreen image viewer with zooming, panning, and slideshow mode.
5. **Music Player**: Audio playback with waveform synthesis, playlist queue, and track switching.
6. **Weather App**: Multi-city live weather forecasts, temperature radar, and WMO condition details.
7. **Calculator**: Standard and scientific calculator modes with history log.
8. **Terminal Console**: Command line interface with custom commands (`help`, `ls`, `cat`, `clear`, `neofetch`, `theme`, `ping`).
9. **Settings**: OS personalization, theme switcher (Light/Dark mode), custom accent color picker, user profile name editor, and full system reset.
10. **System Monitor**: Real-time CPU, Memory, and Disk usage telemetry visualizers.

---

## ⌨️ Global OS Hotkeys

| Shortcut | Action |
| :--- | :--- |
| `Alt + Tab` | Cycle focus through open application windows |
| `Meta` / `Windows` | Toggle Start Menu drawer |
| `Escape` | Close active Start Menu, popovers, or context menus |

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 18 + TypeScript + Vite
- **State Management**: Zustand with `persist` middleware
- **Storage Engine**: IndexedDB via `idb-keyval`
- **Animations**: Framer Motion
- **Icons**: Lucide Icons
- **Styling**: Tailwind CSS with custom glassmorphic utility rules

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation & Execution

```bash
# Clone repository
git clone https://github.com/user/nexus-os.git

# Navigate into workspace
cd nexus-os

# Install dependencies
npm install

# Launch development server (runs on http://localhost:3000)
npm run dev
```

### Production Build

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview
```

---

## 📄 License

Distributed under the MIT License. Built with passion for modern desktop web interfaces.
