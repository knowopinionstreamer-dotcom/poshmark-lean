import { config } from 'dotenv';
config();

// This tells the CLI where to find your tools
import '@/ai/flows/draft-generation';
import '@/ai/flows/pricing-research';
import '@/ai/flows/image-analysis-for-listing';
