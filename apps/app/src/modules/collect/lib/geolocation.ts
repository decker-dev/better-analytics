import type { GeolocationData } from '../types/collect';

/**
 * IP API response interface based on actual response
 */
interface IPAPIResponse {
  status: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  query?: string;
}

/**
 * Check if an IP address is valid
 */
export function isValidIP(ip: string): boolean {
  // Basic IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;

  const parts = ip.split('.');
  return parts.every(part => {
    const num = Number.parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * Get geolocation data from IP address using ip-api.com
 */
export async function getGeolocation(ip: string): Promise<GeolocationData> {
  const defaultResult: GeolocationData = {
    country: null,
    region: null,
    city: null,
    latitude: null,
    longitude: null,
  };

  if (!ip || !isValidIP(ip)) {
    return defaultResult;
  }

  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `http://ip-api.com/json/${ip}`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Better-Analytics/1.0',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: IPAPIResponse = await response.json();

    if (data.status !== 'success') {
      console.warn('IP API returned non-success status:', data.status);
      return defaultResult;
    }

    return {
      country: data.country || null,
      region: data.regionName || null,
      city: data.city || null,
      latitude: data.lat ? data.lat.toString() : null,
      longitude: data.lon ? data.lon.toString() : null,
    };
  } catch (error) {
    console.warn('Geolocation lookup failed:', error);
    return defaultResult;
  }
} 