---
tag: [source-code, auto-sync]
last_synced: 2025-12-28T11:52:10.786Z
origin: GEMINI.md
---

# GEMINI.md

```md
# Poshmark Lean (Reseller AI)

## Project Overview
This project is an AI-powered tool for Poshmark sellers, designed to automate the listing process. It identifies items from images, scrapes market prices, and generates SEO-friendly titles and descriptions.

**Critical Constraint:** The system is optimized for **8GB RAM laptops**. It uses a **Sequential Model Loading** strategy (running one AI model at a time) and forces RAM clearing (`keep_alive: 0`) to prevent crashes.

## Technology Stack

### Core
*   **Frontend:** Next.js (React, TypeScript, Tailwind CSS)
*   **AI Orchestration:** Google Genkit (`src/ai`)
*   **Local AI Inference:** Ollama
*   **Scraping:** Python (called via Node.js `child_process`)

### AI Models (Ollama)
*   **Vision/Analysis:** `qwen2.5vl:3b` (Identify items, extract specs)
*   **Creative Writing:** `llama3.2:3b` (Generate titles/descriptions)

## Architecture
The application runs primarily as a **Next.js web app**, but relies on a hybrid execution model:
1.  **Next.js Backend Actions** call specific utilities.
2.  **Scraping:** `src/lib/market-scraper.ts` executes the `scraper.py` Python script using `child_process`.
3.  **AI:** `src/ai/genkit.ts` connects to a local Ollama instance for inference.

## Key Files & Directories

*   **`src/app`**: Main Next.js application routes and UI.
*   **`src/lib/market-scraper.ts`**: The TypeScript bridge that executes the Python scraper.
*   **`scraper.py`**: A standalone Python script that scrapes Google Shopping for "New" vs "Used" prices.
*   **`src/ai/genkit.ts`**: Configuration for Genkit, connecting to the local Ollama server.
*   **`app.py` / `main.py`**: (Legacy/Prototype) A Python-only Flask implementation of the workflow. The Next.js app is the evolution of this.
*   **`venv/`**: Python virtual environment containing dependencies for `scraper.py` (e.g., `requests`, `bs4`).

## Development & Usage

### Prerequisites
1.  **Node.js** & **npm**
2.  **Python 3.12+**
3.  **Ollama** running locally (default: `http://localhost:11434`)
    *   Required Models: `ollama pull qwen2.5vl:3b` and `ollama pull llama3.2:3b`

### Setup
1.  **Install Node Dependencies:**
    ```bash
    npm install
    ```
2.  **Setup Python Environment:**
    Ensure the `venv` is active or dependencies are installed for `scraper.py`.
    ```bash
    # If starting fresh
    python3 -m venv venv
    source venv/bin/activate
    pip install requests beautifulsoup4 flask
    ```

### Running the App
*   **Main Application (Next.js):**
    ```bash
    npm run dev
    ```
    Access at `http://localhost:3000`.

*   **Genkit Developer UI:**
    ```bash
    npm run genkit:dev
    ```

*   **Legacy Prototype (Flask):**
    ```bash
    python app.py
    ```

## Development Conventions
*   **Strict Typing:** Use TypeScript interfaces for all data structures (e.g., `ScraperResult` in `market-scraper.ts`).
*   **Resource Management:** When adding AI features, always ensure `keep_alive: 0` is passed to Ollama requests to respect the 8GB RAM limit.
*   **Hybrid Execution:** Python scripts should be treated as external tools called by the Node.js backend. Ensure paths are resolved absolutely using `path.resolve(process.cwd(), ...)` for cross-platform compatibility.

```
