'use server';
/**
 * @fileOverview Generates a draft listing title and description based on item details.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { throttledAI } from '@/lib/ai-utils';
import { 
  DraftGenerationInputSchema, 
  DraftGenerationOutputSchema, 
  type DraftGenerationInput, 
  type DraftGenerationOutput 
} from '@/ai/schemas';

const draftGenerationPrompt = ai.definePrompt({
  name: 'draftGenerationPrompt',
  input: {schema: DraftGenerationInputSchema},
  output: {schema: DraftGenerationOutputSchema},
  prompt: `You are an expert Poshmark listing strategist. Your goal is to maximize search traffic with ultra-clean, keyword-rich titles and professional descriptions.

### TASK 1: GENERATE TITLE
- **Format**: [Brand] [Model/Name] [Style Number] [Color]
- **Color Rule**: Only include the **MAIN COLOR**. Do not list multiple colors. If the color is generic or unimportant to the item type (e.g., a silver toaster), SKIP the color in the title.
- **Strict Rule**: NO visual descriptors (no "beautiful", "gorgeous", "amazing", etc.).
- **Clothing Rule**: Include [Size] and [Gender] ONLY if the item is clothing or footwear.
- **Keywords**: Use the most searchable technical names for the item.
- **Constraint**: Maximum 80 characters.

### TASK 2: GENERATE DESCRIPTION
- **Tone**: Light, friendly, and professional.
- **Emoji Rule**: STRICTLY LIMIT EMOJIS. Use only 2-3 emojis in the entire description, exclusively at the start of major section headers.
- **Constraint**: **ABSOLUTELY NO MENTION** of condition (New, Used, etc.).
- **Clothing/Shoe Rule**: Include [Size] and [Gender] in the Details ONLY if the item is clothing or footwear. If it is an electronic, appliance, or decor item, SKIP these fields entirely.
- **Length Constraint**: The total description MUST BE **UNDER 1000 CHARACTERS**.
- **Structure**:
  1. **Intro**: A welcoming 2-3 sentence summary hook. Use vivid descriptors here to highlight the item's appeal.
  2. **Details**: (Vertical list)
     - Brand: {{{brand}}}
     - Model: {{{model}}}
     - Style Number: {{{styleNumber}}}
     - Style: {{{style}}}
     - Color: {{{color}}}
     - Size: {{{size}}}
     - Gender: {{{gender}}}
  3. **Features**: (Vertical list)
     - Feature 1
     - Feature 2
     - Feature 3
  4. **Hashtags**: 5 trending hashtags at the very bottom.

**CRITICAL FORMATTING INSTRUCTIONS**:
- You MUST use a hard return (new line) after EVERY single bullet point. 
- Use TWO new lines between the Intro, Item Details, Highlights, and Hashtags sections.
- Every detail and every feature MUST start on its own line with a dash (-).
- DO NOT wrap the Details or Features in a single paragraph. 

**Inputs:**
- Brand: {{{brand}}}
- Model: {{{model}}}
- Style Number: {{{styleNumber}}}
- Style: {{{style}}}
- Color: {{{color}}}
- Size: {{{size}}}
- Gender: {{{gender}}}

Generate the title and description following these rules.
  `,
});

const draftGenerationFlow = ai.defineFlow(
  {
    name: 'draftGenerationFlow',
    inputSchema: DraftGenerationInputSchema,
    outputSchema: DraftGenerationOutputSchema,
  },
  async input => {
    // We remove the complex "throttledAI" call here to keep it simple and robust for local use
    const { output } = await ai.run('draft-generation-call', async () => {
      const response = await throttledAI(() => ai.generate({
        model: 'ollama/llama3.2',
        prompt: draftGenerationPrompt(input),
      }));
      return { output: response.output };
    });
    return output!;
  }
);

export async function performDraftGeneration(input: DraftGenerationInput): Promise<DraftGenerationOutput> {
  return draftGenerationFlow(input);
}