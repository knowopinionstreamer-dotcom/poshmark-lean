import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { scrapeMarketData } from '@/lib/market-scraper';
import { throttledAI } from '@/lib/ai-utils';

const OnlinePriceSearchInputSchema = z.object({
  brand: z.string(),
  model: z.string(),
  styleNumber: z.string().optional(),
  color: z.string().optional(),
});

export type OnlinePriceSearchInput = z.infer<typeof OnlinePriceSearchInputSchema>;

const OnlinePriceSearchOutputSchema = z.object({
  marketContext: z.string().describe("A summary of real-world market data found via search."),
  rawResults: z.array(z.object({
    source: z.string(),
    title: z.string(),
    link: z.string(),
    snippet: z.string()
  }))
});

export const onlinePriceSearchAgentFlow = ai.defineFlow(
  {
    name: 'onlinePriceSearchAgentFlow',
    inputSchema: OnlinePriceSearchInputSchema,
    outputSchema: OnlinePriceSearchOutputSchema,
  },
  async (input) => {
    const searchQuery = `${input.brand} ${input.model} ${input.styleNumber || ''}`.trim();
    
    // 1. Run the Local Python Scraper
    console.log(`[Online Agent] Scraping for: ${searchQuery}`);
    const scraperResults = await scrapeMarketData(searchQuery);
    
    const marketContext = `
      REAL-WORLD MARKET DATA SCRAPED JUST NOW:
      - Average Used Price: $${scraperResults.averages.used}
      - Average New Price: $${scraperResults.averages.new}
      
      Live Listings Found:
      ${scraperResults.listings.map(l => `- ${l.platform}: $${l.price}`).join('\n')}
    `;

    // 2. Use a local model (Llama) to summarize the findings for the next agent
    // We wrap this in throttledAI to keep RAM usage low
    const summaryResponse = await throttledAI(() => ai.generate({
      model: 'ollama/llama3.2',
      prompt: `Analyze these search results for "${searchQuery}". 
      Typical sold prices and current market availability are provided below. 
      Summarize into a concise "Market Context" paragraph for a pricing specialist.
      
      MARKET DATA:
      ${marketContext}`,
    }));

    return {
      marketContext: summaryResponse.text,
      rawResults: scraperResults.listings.map(l => ({
        source: l.platform,
        title: l.title || searchQuery,
        link: '#', // The simple scraper doesn't provide links yet
        snippet: `Price: $${l.price}`
      }))
    };
  }
);
