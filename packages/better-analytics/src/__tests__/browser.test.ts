import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { init, track, _resetConfig } from '../index';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Better Analytics SDK - Browser Features', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));
    _resetConfig();
    init({ site: 'test-site', endpoint: '/api/collect', mode: 'production' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('UTM Parameters', () => {
    it('should extract UTM parameters from URL', () => {
      // Mock window.location with UTM parameters
      Object.defineProperty(window, 'location', {
        value: { href: 'https://example.com/test?utm_source=google&utm_medium=cpc&utm_campaign=summer&utm_term=analytics&utm_content=banner' },
        writable: true,
        configurable: true
      });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.utm).toMatchObject({
        source: 'google',
        medium: 'cpc',
        campaign: 'summer',
        term: 'analytics',
        content: 'banner'
      });
    });

    it('should handle URLs without UTM parameters', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'https://example.com/test' },
        writable: true,
        configurable: true
      });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.utm).toBeUndefined();
    });

    it('should handle partial UTM parameters', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'https://example.com/test?utm_source=google&utm_campaign=summer' },
        writable: true,
        configurable: true
      });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.utm).toMatchObject({
        source: 'google',
        campaign: 'summer'
      });
      expect(callBody.utm.medium).toBeUndefined();
    });

    it('should handle malformed URLs gracefully', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'not-a-valid-url' },
        writable: true,
        configurable: true
      });

      expect(() => track('test_event')).not.toThrow();
    });
  });

  describe('Device Information', () => {
    it('should collect screen dimensions when available', () => {
      Object.defineProperty(screen, 'width', { value: 1920, writable: true, configurable: true });
      Object.defineProperty(screen, 'height', { value: 1080, writable: true, configurable: true });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.device.screenWidth).toBe(1920);
      expect(callBody.device.screenHeight).toBe(1080);
    });

    it('should collect viewport dimensions when available', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true, configurable: true });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.device.viewportWidth).toBe(1200);
      expect(callBody.device.viewportHeight).toBe(800);
    });

    it('should collect user agent when available', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        writable: true,
        configurable: true
      });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.device.userAgent).toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    });

    it('should collect language when available', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        writable: true,
        configurable: true
      });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.device.language).toBe('en-US');
    });

    it('should collect timezone when available', () => {
      // Mock Intl.DateTimeFormat
      const mockIntl = {
        DateTimeFormat: vi.fn().mockReturnValue({
          resolvedOptions: () => ({ timeZone: 'America/New_York' })
        })
      };
      Object.defineProperty(global, 'Intl', { value: mockIntl, writable: true, configurable: true });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.device.timezone).toBe('America/New_York');
    });

    it('should collect connection type when available', () => {
      const mockConnection = { effectiveType: '4g' };
      Object.defineProperty(navigator, 'connection', {
        value: mockConnection,
        writable: true,
        configurable: true
      });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.device.connectionType).toBe('4g');
    });
  });

  describe('Page Information', () => {
    it('should collect page title when available', () => {
      Object.defineProperty(document, 'title', {
        value: 'Test Page Title',
        writable: true,
        configurable: true
      });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.page.title).toBe('Test Page Title');
    });

    it('should collect pathname and hostname', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://example.com/products/item',
          pathname: '/products/item',
          hostname: 'example.com'
        },
        writable: true,
        configurable: true
      });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.page.pathname).toBe('/products/item');
      expect(callBody.page.hostname).toBe('example.com');
    });

    it('should collect page load time when performance API available', () => {
      const mockPerformance = {
        timing: {
          navigationStart: 1000,
          loadEventEnd: 2500
        }
      };
      Object.defineProperty(window, 'performance', {
        value: mockPerformance,
        writable: true,
        configurable: true
      });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.page.loadTime).toBe(1500);
    });

    it('should not include load time when performance API unavailable', () => {
      Object.defineProperty(window, 'performance', {
        value: undefined,
        writable: true,
        configurable: true
      });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.page?.loadTime).toBeUndefined();
    });

    it('should handle invalid performance timing gracefully', () => {
      const mockPerformance = {
        timing: {
          navigationStart: 2000,
          loadEventEnd: 1000 // Invalid: end before start
        }
      };
      Object.defineProperty(window, 'performance', {
        value: mockPerformance,
        writable: true,
        configurable: true
      });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.page?.loadTime).toBeUndefined();
    });
  });

  describe('Browser API Edge Cases', () => {
    it('should handle missing connection API', () => {
      Object.defineProperty(navigator, 'connection', {
        value: undefined,
        writable: true,
        configurable: true
      });

      expect(() => track('test_event')).not.toThrow();

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.device?.connectionType).toBeUndefined();
    });

    it('should handle missing Intl API', () => {
      const originalIntl = global.Intl;
      // @ts-ignore
      global.Intl = undefined;

      expect(() => track('test_event')).not.toThrow();

      global.Intl = originalIntl;
    });

    it('should handle missing screen dimensions', () => {
      Object.defineProperty(screen, 'width', { value: undefined, writable: true, configurable: true });
      Object.defineProperty(screen, 'height', { value: undefined, writable: true, configurable: true });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.device?.screenWidth).toBeUndefined();
      expect(callBody.device?.screenHeight).toBeUndefined();
    });

    it('should handle missing viewport dimensions', () => {
      Object.defineProperty(window, 'innerWidth', { value: undefined, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: undefined, writable: true, configurable: true });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.device?.viewportWidth).toBeUndefined();
      expect(callBody.device?.viewportHeight).toBeUndefined();
    });

    it('should only include device object when it has properties', () => {
      // Mock environment with no device info
      Object.defineProperty(navigator, 'userAgent', { value: '', writable: true, configurable: true });
      Object.defineProperty(navigator, 'language', { value: '', writable: true, configurable: true });
      Object.defineProperty(navigator, 'connection', { value: undefined, writable: true, configurable: true });
      Object.defineProperty(screen, 'width', { value: undefined, writable: true, configurable: true });
      Object.defineProperty(screen, 'height', { value: undefined, writable: true, configurable: true });
      Object.defineProperty(window, 'innerWidth', { value: undefined, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: undefined, writable: true, configurable: true });
      // @ts-ignore
      global.Intl = undefined;

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      // Device object should either be undefined or have minimal info
      expect(callBody.device === undefined || Object.keys(callBody.device).length === 0).toBe(true);
    });
  });

  describe('Referrer Handling', () => {
    it('should collect document referrer when available', () => {
      Object.defineProperty(document, 'referrer', {
        value: 'https://google.com/search',
        writable: true,
        configurable: true
      });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.referrer).toBe('https://google.com/search');
    });

    it('should handle empty referrer', () => {
      Object.defineProperty(document, 'referrer', {
        value: '',
        writable: true,
        configurable: true
      });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.referrer).toBe('');
    });
  });
}); 