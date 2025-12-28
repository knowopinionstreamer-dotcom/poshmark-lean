import { z } from 'zod';

// --- IMAGE ANALYSIS SCHEMAS ---
export const ImageAnalysisForListingInputSchema = z.object({
  photoDataUris: z.array(z.string()).describe("Array of image data URIs or paths."),
  analysisContext: z.string().optional().describe("User provided context or hints about the item."),
});
export type ImageAnalysisForListingInput = z.infer<typeof ImageAnalysisForListingInputSchema>;

export const ImageAnalysisForListingOutputSchema = z.object({
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
});
export type ImageAnalysisForListingOutput = z.infer<typeof ImageAnalysisForListingOutputSchema>;


// --- PRICING RESEARCH SCHEMAS ---
export const PricingResearchInputSchema = z.object({
  brand: z.string(),
  model: z.string(),
  styleNumber: z.string().optional(),
  visualSearchQuery: z.string().optional(),
  size: z.string().optional(),
  condition: z.string(),
});
export type PricingResearchInput = z.infer<typeof PricingResearchInputSchema>;

export const PricingResearchOutputSchema = z.object({
  searchQueries: z.array(z.string()),
  suggestedPrice: z.number().optional(),
  demand: z.string().optional(),
  valueDrivers: z.array(z.string()).optional(),
  matchCount: z.number().optional(),
  priceExplanation: z.string().optional(),
});
export type PricingResearchOutput = z.infer<typeof PricingResearchOutputSchema>;


// --- DRAFT GENERATION SCHEMAS ---
export const DraftGenerationInputSchema = z.object({
  brand: z.string().describe('The brand of the item.'),
  model: z.string().describe('The model of the item.'),
  styleNumber: z.string().optional().describe('The style number or SKU.'),
  style: z.string().describe('The style of the item.'),
  color: z.string().describe('The color of the item.'),
  size: z.string().optional().describe('The size of the item.'),
  gender: z.string().optional().describe('The target gender for the item.'),
  condition: z.string().describe('The condition of the item.'),
});
export type DraftGenerationInput = z.infer<typeof DraftGenerationInputSchema>;

export const DraftGenerationOutputSchema = z.object({
  title: z.string().describe('The generated title for the listing.'),
  description: z.string().describe('The generated description for the listing.'),
});
export type DraftGenerationOutput = z.infer<typeof DraftGenerationOutputSchema>;
