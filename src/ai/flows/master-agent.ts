import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { throttledAI } from '@/lib/ai-utils';

const MasterAgentInputSchema = z.object({
  photoDataUris: z.array(z.string()).describe("Array of image data URIs."),
  analysisContext: z.string().optional().describe("User provided context/hints."),
});

export type MasterAgentInput = z.infer<typeof MasterAgentInputSchema>;

const MasterAgentOutputSchema = z.object({
  details: z.object({
    brand: z.string().optional(),
    model: z.string().optional(),
    styleNumber: z.string().optional(),
    visualSearchQuery: z.string().optional(),
    style: z.string().optional(),
    color: z.string().optional(),
    gender: z.string().optional(),
    condition: z.string().optional(),
    description: z.string().optional(),
    scrapedText: z.string().optional(),
    keywords: z.string().optional(),
  }),
  pricing: z.object({
    searchQueries: z.array(z.string()),
    suggestedPrice: z.number().optional(),
    demand: z.string().optional(),
    valueDrivers: z.array(z.string()).optional(),
    matchCount: z.number().optional(),
    priceExplanation: z.string().optional(),
  }),
});

export type MasterAgentOutput = z.infer<typeof MasterAgentOutputSchema>;

export const masterAgentPrompt = ai.definePrompt({
  name: 'masterAgentPrompt',
  input: { schema: MasterAgentInputSchema },
  output: { schema: MasterAgentOutputSchema },
  prompt: `You are an elite Reseller Master Agent working as part of an automated AI system. Your task is to perform a meticulous item intake in a single pass.

  ### STEP 1: SYSTEMATIC IMAGE SCAN & OCR
  - **Meticulous Scan**: Scan all images. Scour every corner for brand tags, care labels, size stickers, and unique hardware or patterns. Examine internal tags for SKU/Style numbers and manufacturing dates.
  - **OCR Extraction**: Extract organize ALL identifiable text found on tags, labels, packaging, and the item itself into the "scrapedText" field.
  - **Keywords**: Generate 5-10 high-value, searchable SEO keywords or phrases. Comma separated.
  - **USER HINT (Priority)**: {{analysisContext}} (Use this as your primary starting point).
  - **Identity**: Confirm Brand, Model, Style Number, Style, Color, and Gender.

  ### STEP 2: MARKET INTELLIGENCE (MARKET INTEL REPORT)
  - **Search Links**: Generate direct URLs for Poshmark (Sold), eBay (Sold), and Mercari using identified details.
  - **Demand Rating**: Rate the item's liquidity (e.g., Hot Seller, Slow & Steady).
  - **Value Drivers**: Identify 2-3 specific reasons for the price.
  - **Pricing**: Determine an optimal listing price based on condition, demand, and competitive market data. Provide a clear explanation.

  Product Images:
  {{#each photoDataUris}}
  {{media url=this}}
  {{/each}}
  `,
});

export const masterAgentFlow = ai.defineFlow(
  {
    name: 'masterAgentFlow',
    inputSchema: MasterAgentInputSchema,
    outputSchema: MasterAgentOutputSchema,
  },
  async input => {
    const { output } = await throttledAI(() => masterAgentPrompt(input, {
        config: { temperature: 0.1 }
    }));
    return output!;
  }
);