import { nanoid } from 'nanoid';
import { db, schema } from './db';
import { eq } from 'drizzle-orm';

/**
 * Generate a unique site key in the format BA_{org_short}_{random}
 * Example: BA_A1B2_X9Y8Z7
 */
export function generateSiteKey(orgId: string): string {
  const orgShort = orgId.slice(0, 4).toUpperCase();
  const random = nanoid(6).toUpperCase();
  return `BA_${orgShort}_${random}`;
}

/**
 * Generate a unique site key that doesn't exist in the database
 */
export async function generateUniqueSiteKey(orgId: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const siteKey = generateSiteKey(orgId);

    // Check if this site key already exists
    const existing = await db
      .select()
      .from(schema.sites)
      .where(eq(schema.sites.siteKey, siteKey))
      .limit(1);

    if (existing.length === 0) {
      return siteKey;
    }

    attempts++;
  }

  throw new Error('Failed to generate unique site key after multiple attempts');
}

/**
 * Validate site key format
 */
export function validateSiteKey(siteKey: string): boolean {
  // Pattern: BA_{4_chars}_{6_chars}
  const pattern = /^BA_[A-Z0-9]{4}_[A-Z0-9]{6}$/;
  return pattern.test(siteKey);
} 