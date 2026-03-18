# 👻 GhostPilot

**Stealth AI Interview Assistant** — An invisible overlay that loads ChatGPT, Gemini, Claude, or Perplexity in a screen-capture-proof floating window.

## Features

- 🔒 **Invisible to Screen Sharing** — Content protection hides the window from Zoom, Meet, Teams screen capture
- 🚫 **No Tab Switch Detection** — Desktop app, not a browser tab. No `Page Visibility API` triggers
- 👻 **No Dock/Taskbar Entry** — Uses macOS NSPanel, doesn't appear in App Switcher
- ⌨️ **Global Hotkey** — `⌘⇧Space` to toggle visibility instantly
- 🎨 **Opacity Control** — `⌘⇧↑/↓` to adjust transparency
- 🔀 **Multi-AI** — Switch between ChatGPT, Gemini, Claude, Perplexity with one click
- 📌 **Always on Top** — Floats above fullscreen apps, across all Spaces
- 💾 **Remembers Position** — Saves window position, size, and opacity between sessions

## Quick Start

```bash
npm install
npm start
```

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘⇧Space` | Toggle visibility (show/hide) |
| `⌘⇧H` | Panic hide |
| `⌘⇧↑` | Increase opacity |
| `⌘⇧↓` | Decrease opacity |

## How Stealth Works

| Technique | Purpose |
|---|---|
| `setContentProtection(true)` | OS-level exclusion from screen capture |
| `type: 'panel'` | macOS NSPanel — no Dock, no App Switcher |
| `alwaysOnTop: 'screen-saver'` | Highest z-level, above everything |
| `transparent: true` + `frame: false` | No window chrome, invisible background |
| `skipTaskbar: true` | Hidden from taskbar |
| `app.dock.hide()` | No Dock icon on macOS |

## Tech Stack

- **Electron** — Desktop app framework
- **Webview** — Loads AI websites directly (same models, same free tier)
- **electron-store** — Persistent settings

## License

MIT
