---
tag: [source-code, auto-sync]
last_synced: 2025-12-28T12:32:05.442Z
origin: src/ai/flows/pricing-research.ts
---

# pricing-research.ts

```ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { scrapeMarketData } from '@/lib/market-scraper';
import { throttledAI } from '@/lib/ai-utils';
import { 
  PricingResearchInputSchema, 
  PricingResearchOutputSchema, 
  type PricingResearchInput, 
  type PricingResearchOutput 
} from '@/ai/schemas';

// Your Original "Market Intel" Prompt
const pricingResearchPrompt = ai.definePrompt({
  name: 'pricingResearchPrompt',
  input: {
    schema: PricingResearchInputSchema.extend({
      marketContext: z.string().optional()
    })
  },
  output: {schema: PricingResearchOutputSchema},
  prompt: `You are an expert reseller strategist. Your goal is to provide a "Market Intel Report."

### LIVE MARKET DATA (Grounding)
{{{marketContext}}}

### TASK 1: SEARCH LINKS
Generate URLs for Poshmark (Sold), eBay (Sold), Mercari, and Amazon using ONLY "{{brand}} {{model}}".

### TASK 2: MARKET INTELLIGENCE
1. **Demand Rating**: Rate the item's liquidity. 
2. **Value Drivers**: Identify 2-3 specific reasons for the price.
3. **Match Count**: Based on your knowledge and the style number, estimate how many "Exact Matches" currently exist in the sold market history.

### TASK 3: OPTIMAL PRICING
- **Determine an optimal listing price**: Consider factors such as condition ({{{condition}}}), brand ({{{brand}}}), demand, and competitive pricing among both new and used items. Use the provided Market Data.
- **Formulate a clear explanation**: Reference the market values and findings from your internal research.
- **Combine**: Merge the determined optimal listing price and its explanation into a single, clear, copy-pasteable text section.

**Inputs:**
- Brand: {{{brand}}}
- Model: {{{model}}}
- Visual Search Query: {{{visualSearchQuery}}}
- Style Number: {{{styleNumber}}}
- Size: {{{size}}}
- Condition: {{{condition}}}
  `,
});

const pricingResearchFlow = ai.defineFlow(
  {
    name: 'pricingResearchFlow',
    inputSchema: PricingResearchInputSchema,
    outputSchema: PricingResearchOutputSchema,
  },
  async input => {
    // 1. Build the search query
    const query = `${input.brand} ${input.model} ${input.styleNumber || ''}`.trim();

    // 2. Run the Local Python Scraper
    const scraperResults = await scrapeMarketData(query);

    // 3. Format the data for the AI
    const marketContext = `
      REAL-WORLD MARKET DATA SCRAPED JUST NOW:
      - Average Used Price: $${scraperResults.averages.used}
      - Average New Price: $${scraperResults.averages.new}
      
      Live Listings Found:
      ${scraperResults.listings.map(l => `- ${l.platform}: $${l.price}`).join('\n')}
    `;

    // 4. Run the AI with the scraped data
    const { output } = await ai.run('pricing-research-call', async () => {
      const response = await throttledAI(() => ai.generate({
        model: 'ollama/llama3.2', // Uses your local model
        prompt: pricingResearchPrompt({
          ...input,
          marketContext: marketContext 
        }),
        config: {
          temperature: 0.1,
        }
      }));
      return { output: response.output };
    });
    return output!;
  }
);

export async function performPricingResearch(input: PricingResearchInput): Promise<PricingResearchOutput> {
  return pricingResearchFlow(input);
}
```
