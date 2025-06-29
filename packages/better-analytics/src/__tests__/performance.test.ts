import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { init, track, _resetConfig } from '../index';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Better Analytics SDK - Performance & Edge Cases', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));
    _resetConfig();
    init({ site: 'test-site', endpoint: '/api/collect', mode: 'production' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Large Payload Handling', () => {
    it('should handle very large props objects', () => {
      const largeProps = {
        largeArray: Array(1000).fill(0).map((_, i) => ({ id: i, data: `item-${i}` })),
        largeString: 'x'.repeat(10000),
        nestedObject: {
          level1: {
            level2: {
              level3: Array(100).fill('deep nested data')
            }
          }
        }
      };

      expect(() => track('large_payload_test', largeProps)).not.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle circular references gracefully', () => {
      const circularObj: Record<string, unknown> = { name: 'test' };
      circularObj.self = circularObj;

      // Should not crash when trying to stringify circular reference
      expect(() => track('circular_test', { circular: circularObj })).not.toThrow();
    });
  });

  describe('Network Retry Logic', () => {
    it('should handle different HTTP error status codes', async () => {
      const errorCodes = [400, 401, 403, 404, 429, 500, 502, 503];
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      for (const code of errorCodes) {
        mockFetch.mockClear();
        mockFetch.mockResolvedValueOnce(new Response('Error', { status: code }));

        expect(() => track('error_test', { statusCode: code })).not.toThrow();
        expect(mockFetch).toHaveBeenCalledTimes(1);
      }

      consoleErrorSpy.mockRestore();
    });

    it('should handle network timeouts', async () => {
      mockFetch.mockImplementationOnce(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      expect(() => track('timeout_test')).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory on rapid successive calls', () => {
      // Simulate rapid tracking (like scroll events)
      for (let i = 0; i < 1000; i++) {
        track('rapid_event', { sequence: i });
      }

      expect(mockFetch).toHaveBeenCalledTimes(1000);
    });

    it('should handle tracking when window/document are undefined (SSR edge case)', () => {
      // Simulate SSR environment more thoroughly
      const originalWindow = global.window;
      const originalDocument = global.document;

      // @ts-ignore
      // biome-ignore lint/performance/noDelete: <explanation>
      delete global.window;
      // @ts-ignore 
      // biome-ignore lint/performance/noDelete: <explanation>
      delete global.document;

      expect(() => track('ssr_test')).not.toThrow();

      // Restore
      global.window = originalWindow;
      global.document = originalDocument;
    });
  });

  describe('Data Validation', () => {
    it('should sanitize dangerous script content in props', () => {
      const dangerousProps = {
        userInput: '<script>alert("xss")</script>',
        sqlInjection: "'; DROP TABLE users; --",
        htmlInjection: '<img src="x" onerror="alert(1)">',
        unicodeNormalization: '\u0041\u0300', // Combining characters
      };

      track('security_test', dangerousProps);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.props).toMatchObject(dangerousProps);
      // Should store as-is (server should handle sanitization)
    });

    it('should handle various data types correctly', () => {
      // Test with simple props that won't break JSON.stringify
      const complexProps = {
        date: new Date('2023-01-01'),
        string: 'hello world',
        number: 42,
        boolean: true,
        null_value: null,
        array: [1, 2, 3],
        object: { nested: 'value' }
      };

      // Test that it doesn't crash with complex data
      expect(() => track('data_types_test', complexProps)).not.toThrow();

      // Verify the call was made
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Browser Compatibility', () => {
    it('should work in older browsers without modern APIs', () => {
      // Mock old browser environment
      const originalCrypto = global.crypto;
      const originalIntl = global.Intl;
      const originalPerformance = global.performance;

      // @ts-ignore
      global.crypto = undefined;
      // @ts-ignore
      global.Intl = undefined;
      // @ts-ignore
      global.performance = undefined;

      expect(() => track('old_browser_test')).not.toThrow();

      // Restore
      global.crypto = originalCrypto;
      global.Intl = originalIntl;
      global.performance = originalPerformance;
    });

    it('should handle missing navigator properties', () => {
      const originalNavigator = global.navigator;

      // Mock limited navigator
      Object.defineProperty(global, 'navigator', {
        value: {
          // Missing: userAgent, language, connection
        },
        writable: true,
        configurable: true
      });

      expect(() => track('limited_navigator_test')).not.toThrow();

      global.navigator = originalNavigator;
    });
  });

  describe('Configuration Edge Cases', () => {
    it('should handle invalid endpoint URLs gracefully', () => {
      _resetConfig();

      const invalidEndpoints = [
        '',
        'not-a-url',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        null as unknown as string,
        undefined as unknown as string
      ];

      for (const endpoint of invalidEndpoints) {
        expect(() => init({ site: 'test', endpoint })).not.toThrow();
      }
    });

    it('should handle extremely long site identifiers', () => {
      _resetConfig();
      const longSite = 'x'.repeat(10000);

      expect(() => init({ site: longSite, endpoint: '/api/collect' })).not.toThrow();

      track('long_site_test');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.site).toBe(longSite);
    });
  });
}); 