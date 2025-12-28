import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { throttledAI } from '@/lib/ai-utils';
import { onlinePriceSearchAgentFlow } from './online-price-search-agent';

const FinisherAgentInputSchema = z.object({
  brand: z.string(),
  model: z.string(),
  styleNumber: z.string().optional(),
  visualSearchQuery: z.string().optional(),
  size: z.string().optional(),
  gender: z.string().optional(),
  condition: z.string(),
  color: z.string().optional(),
});

export type FinisherAgentInput = z.infer<typeof FinisherAgentInputSchema>;

const FinisherAgentOutputSchema = z.object({
  pricing: z.object({
    searchQueries: z.array(z.string()),
    suggestedPrice: z.number().optional(),
    demand: z.string().optional(),
    valueDrivers: z.array(z.string()).optional(),
    matchCount: z.number().optional(),
    priceExplanation: z.string().optional(),
  }),
  draft: z.object({
    title: z.string(),
    description: z.string(),
  })
});

export type FinisherAgentOutput = z.infer<typeof FinisherAgentOutputSchema>;

export const finisherAgentPrompt = ai.definePrompt({
  name: 'finisherAgentPrompt',
  input: { 
    schema: FinisherAgentInputSchema.extend({
      marketContext: z.string().optional()
    })
  },
  output: { schema: FinisherAgentOutputSchema },
  prompt: `You are an expert Poshmark Strategist and Market Analyst. Use the following APPROVED details and LIVE MARKET DATA to complete the listing.

  ### LIVE MARKET DATA (Grounding)
  {{{marketContext}}}

  ### TASK 1: MARKET INTEL REPORT
  - Generate direct URLs for Poshmark (Sold), eBay (Sold), and Mercari for "{{brand}} {{model}}".
  - Identify Demand Rating, Value Drivers, and an Optimal Price based on condition ({{{condition}}}) and the Market Data provided.

  ### TASK 2: STRATEGIC LISTING DRAFT
  - TITLE: [Brand] [Model/Name] [Style Number] [Color]
    - **Color Rule**: Only include the **MAIN COLOR**. Do not list multiple colors. If the color is generic or unimportant to the item type (e.g., a silver toaster), SKIP the color in the title.
    - STRICT RULE: NO visual descriptors (no "beautiful", "amazing", etc.).
    - Max 80 chars.
  - DESCRIPTION: 
    - Tone: Friendly and professional.
    - Emoji Rule: Limit to 2-3 total at section headers.
    - Constraint: NO mention of condition.
    - **Clothing/Shoe Rule**: Include [Size] and [Gender] in the Details ONLY if the item is clothing or footwear. If it is an electronic, appliance, or decor item, SKIP these fields entirely.
    - Length: **STRICTLY UNDER 1000 CHARACTERS**.
    - Structure:
      1. Intro (2-3 sentences with vivid descriptors).
      2. Details (Vertical bulleted list).
      3. Features (Vertical bulleted list).
      4. 5 Hashtags.
    - CRITICAL: Use hard returns/newlines for all lists.

  ### INPUT DATA
  - Brand: {{{brand}}}
  - Model: {{{model}}}
  - Style Number: {{{styleNumber}}}
  - Size: {{{size}}}
  - Gender: {{{gender}}}
  - Condition: {{{condition}}}
  `,
});

export const finisherAgentFlow = ai.defineFlow(
  {
    name: 'finisherAgentFlow',
    inputSchema: FinisherAgentInputSchema,
    outputSchema: FinisherAgentOutputSchema,
  },
  async input => {
    // 1. Get Live Market Data first
    const searchResult = await onlinePriceSearchAgentFlow({
      brand: input.brand,
      model: input.model,
      styleNumber: input.styleNumber,
      color: input.color,
    });

    // 2. Complete the listing with the research in hand
    const { output } = await ai.run('finisher-agent-call', async () => {
      const response = await throttledAI(() => ai.generate({
        model: 'ollama/llama3.2',
        prompt: finisherAgentPrompt({
          ...input,
          marketContext: searchResult.marketContext
        }),
        config: { temperature: 0.1 }
      }));
      return { output: response.output };
    });
    return output!;
  }
);
