'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

// This allows us to run terminal commands from the code
const execAsync = promisify(exec);

export interface ScraperResult {
  averages: {
    new: number;
    used: number;
  };
  listings: Array<{
    platform: string;
    price: number;
    title?: string;
  }>;
  error?: string;
}

export async function scrapeMarketData(query: string): Promise<ScraperResult> {
  try {
    // 1. Locate the scraper.py file in your ROOT folder
    const scriptPath = path.resolve(process.cwd(), 'scraper.py');
    
    // 2. Prepare the command (e.g., python scraper.py "Nike Air Max")
    // We wrap the query in quotes to handle spaces safely
    const command = `python "${scriptPath}" ${query}`;

    console.log(`[Scraper Bridge] Running: ${command}`);
    
    // 3. Execute the Python script
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.warn('[Scraper Warning]', stderr);
    }

    // 4. Parse the JSON result from Python
    const data = JSON.parse(stdout.trim());
    return data;

  } catch (error) {
    console.error('[Scraper Error]', error);
    return { 
      averages: { new: 0, used: 0 }, 
      listings: [],
      error: 'Failed to run scraper' 
    };
  }
}