---
type: generated-documentation
last_updated: 2025-12-28T11:52:10.805Z
---

# Gemini CLI & Environment Recovery Guide

## 1. How to get back to this Chat
To restart the Gemini CLI and talk to me again, open your terminal and run:
```bash
cd /home/ubuntuog/poshmark-lean
gemini
```

## 2. Re-activating the Python Environment
The price scraper needs the Python virtual environment. If you see "ModuleNotFoundError", run this:
```bash
cd /home/ubuntuog/poshmark-lean
source venv/bin/activate
```

## 3. Restarting the Project Tools
If you closed your terminal and need to start everything up again:

**Tab 1: The Dashboard (UI)**
```bash
npm run dev
```
-> Then open: http://localhost:3000/dashboard

**Tab 2: This Obsidian Agent**
```bash
npm run obsidian
```

## 4. Troubleshooting
- **RAM Issues:** If the laptop feels slow, close Chrome/Firefox and restart only the tab you need.
- **AI not responding:** Check if the 'Ollama' app is running in your system tray.
