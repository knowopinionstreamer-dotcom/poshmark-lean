import * as z from 'zod';

export const listingFormSchema = z.object({
  // Images
  images: z.array(z.string()).min(1, 'At least one image is required'),
  analysisContext: z.string().optional(),

  // Item Details
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  styleNumber: z.string().optional(),
  style: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  gender: z.string().optional(),
  condition: z.string().optional(),
  
  // AI/Scraped Data
  scrapedText: z.string().optional(),
  keywords: z.string().optional(),
  visualSearchQuery: z.string().optional(),

  // Pricing
  targetPrice: z.coerce.number().optional(), // Coerce handles string-to-number input

  // Listing
  title: z.string().optional(),
  description: z.string().optional(),
  disclaimer: z.string().optional(),
});

export type ListingFormValues = z.infer<typeof listingFormSchema>;
