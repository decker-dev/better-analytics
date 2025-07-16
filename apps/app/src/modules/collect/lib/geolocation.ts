import type { GeolocationData } from '../types/collect';

/**
 * Basic IP validation to ensure we have a valid IPv4 or IPv6 address
 */
export function isValidIP(ip: string): boolean {
  // Remove any whitespace
  const trimmedIP = ip.trim();

  // Skip local/private IPs that won't work with geolocation services
  if (
    trimmedIP === '127.0.0.1' ||
    trimmedIP === '::1' ||
    trimmedIP.startsWith('192.168.') ||
    trimmedIP.startsWith('10.') ||
    trimmedIP.startsWith('172.')
  ) {
    return false;
  }

  // Basic IPv4 validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(trimmedIP)) {
    return true;
  }

  // Basic IPv6 validation (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  if (ipv6Regex.test(trimmedIP)) {
    return true;
  }

  return false;
}

/**
 * Get geolocation data from ip-api.com
 * Includes proper error handling and timeout
 */
export async function getGeolocation(ip: string): Promise<GeolocationData> {
  const defaultResult: GeolocationData = {
    country: null,
    region: null,
    city: null,
  };

  if (!isValidIP(ip)) {
    return defaultResult;
  }

  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName,city`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Better-Analytics/1.0',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Geolocation API returned ${response.status} for IP ${ip}`);
      return defaultResult;
    }

    const data = await response.json();

    // Check if the API returned success status
    if (data.status !== 'success') {
      console.warn(`Geolocation failed for IP ${ip}:`, data.status);
      return defaultResult;
    }

    return {
      country: data.country || null,
      region: data.regionName || null,
      city: data.city || null,
    };
  } catch (error) {
    // Handle timeout, network errors, etc.
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn(`Geolocation timeout for IP ${ip}`);
      } else {
        console.warn(`Geolocation error for IP ${ip}:`, error.message);
      }
    }
    return defaultResult;
  }
} 