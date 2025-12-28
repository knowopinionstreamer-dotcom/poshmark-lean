/**
 * This utility ensures that only one AI model runs at a time.
 * This is crucial for laptops with 8GB of RAM to prevent crashes.
 */

let modelLock = Promise.resolve();

export async function throttledAI<T>(fn: () => Promise<T>): Promise<T> {
  // We chain the new request onto the end of the previous one
  const result = modelLock.then(() => fn());
  
  // Update the lock to wait for this new request to finish (even if it fails)
  modelLock = result.catch(() => {}).then(() => {});
  
  return result;
}
