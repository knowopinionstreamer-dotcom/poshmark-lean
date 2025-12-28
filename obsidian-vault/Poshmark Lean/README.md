---
type: generated-documentation
last_updated: 2025-12-28T11:52:10.805Z
---

# Poshmark Lean - Laptop Native Reseller Tool

> **Status:** Active & Syncing
> **Last Updated:** 12/28/2025, 6:52:10 AM

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
