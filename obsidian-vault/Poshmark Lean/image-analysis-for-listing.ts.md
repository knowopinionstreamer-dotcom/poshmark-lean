---
tag: [source-code, auto-sync]
last_synced: 2025-12-28T12:32:01.449Z
origin: src/ai/flows/image-analysis-for-listing.ts
---

# image-analysis-for-listing.ts

```ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { throttledAI } from '@/lib/ai-utils';
import { 
  ImageAnalysisForListingInputSchema, 
  ImageAnalysisForListingOutputSchema, 
  type ImageAnalysisForListingInput, 
  type ImageAnalysisForListingOutput 
} from '@/ai/schemas';

// Define the prompt for the local vision model
const imageAnalysisPrompt = ai.definePrompt({
  name: 'imageAnalysisPrompt',
  input: { schema: ImageAnalysisForListingInputSchema },
  output: { schema: ImageAnalysisForListingOutputSchema },
  prompt: `You are an expert reseller assistant. Your task is to identify this item from the provided images.

  ### USER HINT: {{{analysisContext}}}

  ### TASKS:
  1. **Identify**: Determine the Brand, Model Name, and Style Number (if visible on tags).
  2. **Details**: Extract the Style (e.g., Hoodie, Running Shoes), Color (Main color), and Gender.
  3. **Condition**: Estimate the condition (New With Tags, Good Pre-owned, etc.) based on visual wear.
  4. **OCR**: Extract any readable text from tags or labels into "scrapedText".
  5. **Visual Query**: Create a specific search query string (e.g. "Nike Air Max 90 Infrared 2020") for finding this exact item online.

  Please provide the results in the specified JSON format.
  `,
});

// Define the flow
const imageAnalysisFlow = ai.defineFlow(
  {
    name: 'analyzeImagesToGenerateItemDetails',
    inputSchema: ImageAnalysisForListingInputSchema,
    outputSchema: ImageAnalysisForListingOutputSchema,
  },
  async (input) => {
    // We force the specific vision model for this task
    const { output } = await ai.run('image-analysis-call', async () => {
      const response = await throttledAI(() => ai.generate({
        model: 'ollama/qwen2.5-vl:3b', // Using your specific vision model
        prompt: imageAnalysisPrompt(input),
        config: {
          temperature: 0.1, // Low temperature for factual extraction
        }
      }));
      return { output: response.output };
    });
    return output!;
  }
);

export async function analyzeImagesToGenerateItemDetails(input: ImageAnalysisForListingInput): Promise<ImageAnalysisForListingOutput> {
  return imageAnalysisFlow(input);
}

```
