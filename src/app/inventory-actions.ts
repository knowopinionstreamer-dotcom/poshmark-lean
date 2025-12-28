'use server';

/**
 * These are "Server Actions" for managing your inventory.
 * For now, we'll use a simple placeholder so the app runs.
 */

export async function getRecentItems(limit: number = 5) {
  // Eventually, this will fetch from a database.
  // For now, it returns an empty list so the app doesn't crash.
  console.log(`[Inventory] Fetching ${limit} recent items...`);
  return [];
}
