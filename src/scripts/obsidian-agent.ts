import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const VAULT_DIR = path.resolve(process.cwd(), 'obsidian-vault/Poshmark Lean');
const PROJECT_ROOT = process.cwd();

// Files to Watch & Sync (The "Source of Truth")
const WATCH_LIST = [
  'GEMINI.md',
  'package.json',
  'src/app/schema.ts',
  'src/ai/dev.ts',
  'src/app/dashboard/page.tsx',
  'scraper.py',
  'src/ai/flows/draft-generation.ts',
  'src/ai/flows/pricing-research.ts',
  'src/ai/flows/image-analysis-for-listing.ts'
];

// --- GENERATOR FUNCTIONS ---

function generateReadme() {
  const content = `# Poshmark Lean - Laptop Native Reseller Tool

> **Status:** Active & Syncing
> **Last Updated:** ${new Date().toLocaleString()}

## Project Overview
Poshmark Lean is a specialized listing tool designed to run completely offline on an 8GB laptop. It bypasses cloud costs and quotas by using:
1. **Ollama (Local AI):** Runs 'qwen2.5-vl' for vision and 'llama3.2' for writing.
2. **Local Python Scraper:** Fetches real-time market data without API fees.
3. **Sequential Processing:** Optimizes RAM usage by loading one tool at a time.

## Quick Start
1. **Start Ollama:** Ensure your local server is running.
2. **Run Dashboard:** 'npm run dev'
3. **Access:** Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## Architecture
- **Frontend:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + Shadcn UI
- **Backend:** Server Actions (TypeScript) -> Python Bridge
- **Database:** Local JSON / File System (Catalog)
`;
  writeFileSync('README.md', content);
}

function generateManual() {
  const content = `# Poshmark Lean User Manual

## The 4-Step Workflow

### 1. Upload & Analyze
- **Action:** Drag & drop photos of your item.
- **AI Model:** 'qwen2.5-vl:3b'
- **What happens:** The AI scans the image to identify Brand, Model, Style Number, and Color. It fills in the "Details" form automatically.

### 2. Details Review
- **Action:** Verify the AI's findings.
- **Tip:** Check the "Scraped Text" box. The AI reads tags! If it missed a style number, it might be in there.

### 3. Pricing Research
- **Action:** Click "Research Price".
- **Tool:** 'scraper.py' (Python Script) + Google Shopping
- **What happens:** The app searches the web for "Sold" listings matching your item. It calculates an average "Used" vs "New" price to help you price competitively.

### 4. Listing Generation
- **Action:** Click "Generate Listing".
- **AI Model:** 'llama3.2:3b'
- **What happens:** The AI takes all the data (photos, specs, market prices) and writes a SEO-optimized Title and Description.
`;
  writeFileSync('MANUAL.md', content);
}

function generateChangelog(changedFile: string) {
  const logFile = 'CHANGELOG.md';
  const timestamp = new Date().toLocaleString();
  const entry = `- **${timestamp}**: Detected change in '${changedFile}'. Auto-synced to Vault.\n`;
  
  // Append to existing log or create new
  let currentContent = `# Project Changelog\n\n`;
  if (fs.existsSync(path.join(VAULT_DIR, logFile))) {
    currentContent = fs.readFileSync(path.join(VAULT_DIR, logFile), 'utf-8');
  }
  
  // Insert new entry at the top of the list (after the header)
  const lines = currentContent.split('\n');
  lines.splice(2, 0, entry.trim());
  writeFileSync(logFile, lines.join('\n'));
}

function generateProjectStatus() {
  const fileChecks = WATCH_LIST.map(f => {
    const exists = fs.existsSync(path.join(PROJECT_ROOT, f));
    return `- [${exists ? 'x' : ' '}] '${f}'`;
  }).join('\n');

  const content = `# Project Status & Health

## Core File Integrity
 The following critical files are being monitored by the Obsidian Agent:

${fileChecks}

## System Stats
- **Vault Location:** '${VAULT_DIR}'
- **Monitored Files:** ${WATCH_LIST.length}
- **Agent Status:** 🟢 Online
`;
  writeFileSync('PROJECT_STATUS.md', content);
}

// --- CORE AGENT LOGIC ---

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeFileSync(filename: string, content: string) {
    const fullPath = path.join(VAULT_DIR, filename);
    // Add Metadata
    const finalContent = `---
type: generated-documentation
last_updated: ${new Date().toISOString()}
---

${content}`;
    fs.writeFileSync(fullPath, finalContent);
    console.log(`📝 [${new Date().toLocaleTimeString()}] Generated: ${filename}`);
}

function syncSourceFile(fileName: string) {
  const filePath = path.resolve(PROJECT_ROOT, fileName);

  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const targetName = path.basename(fileName);
      const bt = String.fromCharCode(96).repeat(3); // Triple Backticks safely
      
      const obsidianContent = `---
tag: [source-code, auto-sync]
last_synced: ${new Date().toISOString()}
origin: ${fileName}
---

# ${targetName}

${bt}${fileName.split('.').pop() || 'text'}
${content}
${bt}
`;
      fs.writeFileSync(path.join(VAULT_DIR, `${targetName}.md`), obsidianContent);
      console.log(`🔄 [${new Date().toLocaleTimeString()}] Synced: ${fileName}`);
      
      // Trigger updates for dependent docs
      generateChangelog(fileName);
      generateProjectStatus();
      
    } catch (err) {
      console.error(`❌ Error syncing ${fileName}:`, err);
    }
  }
}

function generateRecoveryGuide() {
  const content = `# Gemini CLI & Environment Recovery Guide

## 1. How to get back to this Chat
To restart the Gemini CLI and talk to me again, open your terminal and run:
\`\`\`bash
cd /home/ubuntuog/poshmark-lean
gemini
\`\`\`

## 2. Re-activating the Python Environment
The price scraper needs the Python virtual environment. If you see "ModuleNotFoundError", run this:
\`\`\`bash
cd /home/ubuntuog/poshmark-lean
source venv/bin/activate
\`\`\`

## 3. Restarting the Project Tools
If you closed your terminal and need to start everything up again:

**Tab 1: The Dashboard (UI)**
\`\`\`bash
npm run dev
\`\`\`
-> Then open: http://localhost:3000/dashboard

**Tab 2: This Obsidian Agent**
\`\`\`bash
npm run obsidian
\`\`\`

## 4. Troubleshooting
- **RAM Issues:** If the laptop feels slow, close Chrome/Firefox and restart only the tab you need.
- **AI not responding:** Check if the 'Ollama' app is running in your system tray.
`;
  writeFileSync('RECOVERY_GUIDE.md', content);
}

async function startAgent() {
  console.log('🔮 Obsidian Agent: Booting up...');
  console.log(`📂 Vault: ${VAULT_DIR}`);

  ensureDir(VAULT_DIR);

  // 1. Initial Source Sync
  WATCH_LIST.forEach(syncSourceFile);

  // 2. Initial Doc Generation
  generateReadme();
  generateManual();
  generateProjectStatus();
  generateRecoveryGuide();

  console.log('👀 Watching for changes...');

  // 3. Watchers
  WATCH_LIST.forEach(file => {
    const filePath = path.resolve(PROJECT_ROOT, file);
    if (fs.existsSync(filePath)) {
      fs.watchFile(filePath, { interval: 2000 }, (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
          syncSourceFile(file);
        }
      });
    }
  });
}

startAgent();