import { nanoid } from 'nanoid';
import { db, schema } from './db';
import { eq } from 'drizzle-orm';

/**
 * Validate if a string is a valid site key format
 */
export function isValidSiteKey(siteKey: string): boolean {
  // Must start with BA_ followed by 10 uppercase alphanumeric characters
  const siteKeyRegex = /^BA_[A-Z0-9]{10}$/;
  return siteKeyRegex.test(siteKey);
}

/**
 * Check if a site key exists in the database
 */
export async function siteKeyExists(siteKey: string): Promise<boolean> {
  if (!isValidSiteKey(siteKey)) {
    return false;
  }

  try {
    const existing = await db
      .select()
      .from(schema.sites)
      .where(eq(schema.sites.siteKey, siteKey))
      .limit(1);

    return existing.length > 0;
  } catch (error) {
    throw new Error(`Database error while checking site key existence: ${error}`);
  }
}

/**
 * Generate a unique site key that doesn't exist in the database
 * Retries up to maxAttempts times to ensure uniqueness
 */
export async function generateSiteKey(maxAttempts = 5): Promise<string> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Increased from 8 to 10 characters for better collision resistance
    const siteKey = `BA_${nanoid(10).toUpperCase()}`;

    try {
      const exists = await siteKeyExists(siteKey);

      if (!exists) {
        return siteKey;
      }

      // If this is not the last attempt, continue to next iteration
      if (attempt < maxAttempts) {
        continue;
      }

      // If we've exhausted all attempts, throw error
      throw new Error(`Failed to generate unique site key after ${maxAttempts} attempts`);
    } catch (error) {
      // Re-throw our own errors immediately
      if (error instanceof Error && error.message.includes('Failed to generate')) {
        throw error;
      }
      throw new Error(`Error while generating site key: ${error}`);
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new Error('Unexpected error in site key generation');
}