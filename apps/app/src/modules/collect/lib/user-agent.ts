import UAParser from 'my-ua-parser';
import type { ParsedUserAgent } from '../types/collect';

/**
 * Parse user agent string and extract device, browser, OS information
 */
export function parseUserAgent(userAgentString: string): ParsedUserAgent | null {
  if (!userAgentString) {
    return null;
  }

  try {
    return UAParser(userAgentString);
  } catch (error) {
    console.warn('Failed to parse user agent:', userAgentString, error);
    return null;
  }
}

/**
 * Format browser information into a readable string
 */
export function formatBrowser(parsed: ParsedUserAgent | null): string | null {
  if (!parsed?.browser.name) {
    return null;
  }

  const name = parsed.browser.name;
  const version = parsed.browser.version || '';

  return `${name} ${version}`.trim();
}

/**
 * Format OS information into a readable string
 */
export function formatOS(parsed: ParsedUserAgent | null): string | null {
  if (!parsed?.os.name) {
    return null;
  }

  const name = parsed.os.name;
  const version = parsed.os.version || '';

  return `${name} ${version}`.trim();
}

/**
 * Get device type (desktop, mobile, tablet, etc.)
 */
export function getDeviceType(parsed: ParsedUserAgent | null): string | null {
  return parsed?.device.type || null;
}

/**
 * Get device vendor (Apple, Samsung, etc.)
 */
export function getDeviceVendor(parsed: ParsedUserAgent | null): string | null {
  return parsed?.device.vendor || null;
}

/**
 * Get device model (iPhone, MacBook Pro, etc.)
 */
export function getDeviceModel(parsed: ParsedUserAgent | null): string | null {
  return parsed?.device.model || null;
}

/**
 * Get engine name (Blink, WebKit, etc.)
 */
export function getEngine(parsed: ParsedUserAgent | null): string | null {
  return parsed?.engine.name || null;
}

/**
 * Get CPU architecture (amd64, arm64, etc.)
 */
export function getCPU(parsed: ParsedUserAgent | null): string | null {
  return parsed?.cpu.architecture || null;
} 