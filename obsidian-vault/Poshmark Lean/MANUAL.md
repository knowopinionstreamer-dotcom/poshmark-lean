---
type: generated-documentation
last_updated: 2025-12-28T11:52:10.805Z
---

# Poshmark Lean User Manual

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
