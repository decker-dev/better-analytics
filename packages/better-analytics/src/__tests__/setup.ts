/**
 * Shared test setup for Better Analytics SDK
 * This file is automatically loaded before each test file
 */

import { vi } from 'vitest';

// Global mocks that all tests need
global.fetch = vi.fn();

// Enhanced browser environment setup
const mockWindow = {
  location: {
    href: 'https://example.com',
    pathname: '/',
    hostname: 'example.com',
    search: '',
    hash: ''
  },
  innerWidth: 1024,
  innerHeight: 768,
  matchMedia: vi.fn(() => ({
    matches: false,
    media: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  })),
  performance: {
    timing: {
      navigationStart: 1000,
      loadEventEnd: 1500
    },
    now: vi.fn(() => Date.now())
  }
};

const mockDocument = {
  title: 'Test Page',
  referrer: '',
  dir: 'ltr'
};

const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Test Environment)',
  language: 'en-US',
  languages: ['en-US', 'en'],
  doNotTrack: null,
  connection: undefined
};

const mockScreen = {
  width: 1920,
  height: 1080,
  availWidth: 1920,
  availHeight: 1040
};

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
};

const mockCrypto = {
  randomUUID: vi.fn(() => `mocked-uuid-${Math.random().toString(36)}`)
};

const mockIntl = {
  DateTimeFormat: vi.fn().mockReturnValue({
    resolvedOptions: () => ({ timeZone: 'UTC' })
  })
};

// Apply mocks globally
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
  configurable: true
});

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
  configurable: true
});

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
  configurable: true
});

Object.defineProperty(global, 'screen', {
  value: mockScreen,
  writable: true,
  configurable: true
});

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true
});

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
  configurable: true
});

Object.defineProperty(global, 'Intl', {
  value: mockIntl,
  writable: true,
  configurable: true
});

// Console spy setup for cleaner test output
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};

// Utility function for tests
export const resetAllMocks = () => {
  vi.clearAllMocks();
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.setItem.mockClear();
  mockLocalStorage.removeItem.mockClear();

  // Reset to default values
  mockWindow.location.href = 'https://example.com';
  mockWindow.location.pathname = '/';
  mockWindow.location.search = '';
  mockDocument.title = 'Test Page';
  mockDocument.referrer = '';
  mockNavigator.userAgent = 'Mozilla/5.0 (Test Environment)';
  mockNavigator.language = 'en-US';
};

// Helper for creating realistic event data
export const createMockEvent = (eventName: string, props = {}) => ({
  event: eventName,
  timestamp: Date.now(),
  url: mockWindow.location.href,
  referrer: mockDocument.referrer,
  props
});

// Helper for asserting analytics calls
export const getLastAnalyticsCall = () => {
  const mockFetch = global.fetch as unknown as { mock: { calls: Array<[string, { body: string }]> } };
  const lastCall = mockFetch.mock.calls.at(-1);
  return lastCall ? JSON.parse(lastCall[1].body) : null;
};

export const getAllAnalyticsCalls = () => {
  const mockFetch = global.fetch as unknown as { mock: { calls: Array<[string, { body: string }]> } };
  return mockFetch.mock.calls.map((call) =>
    JSON.parse(call[1].body)
  );
}; 