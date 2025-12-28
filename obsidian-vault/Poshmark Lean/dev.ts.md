---
tag: [source-code, auto-sync]
last_synced: 2025-12-28T11:52:10.800Z
origin: src/ai/dev.ts
---

# dev.ts

```ts
import { config } from 'dotenv';
config();

// This tells the CLI where to find your tools
import '@/ai/flows/draft-generation';
import '@/ai/flows/pricing-research';
import '@/ai/flows/image-analysis-for-listing';

```
