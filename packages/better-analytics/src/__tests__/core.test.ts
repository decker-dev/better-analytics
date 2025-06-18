import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { init, initWithPageview, track, trackPageview, _resetConfig } from '../index';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window and document
Object.defineProperty(window, 'location', {
  value: { href: 'https://example.com/test' },
  writable: true,
});

Object.defineProperty(document, 'referrer', {
  value: 'https://google.com',
  writable: true,
});

Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Test Browser)',
  writable: true,
});

describe('Better Analytics SDK - Core Functionality', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));
    _resetConfig();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize without firing pageview', async () => {
      init({ endpoint: '/api/collect' });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should initialize and fire pageview with initWithPageview', async () => {
      initWithPageview({ endpoint: '/api/collect' });

      expect(mockFetch).toHaveBeenCalledWith('/api/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"event":"pageview"'),
      });
    });

    it('should handle multiple init calls by updating config', () => {
      init({ endpoint: '/api/collect', site: 'site1' });
      init({ endpoint: '/api/collect2', site: 'site2' });

      track('test_event');

      expect(mockFetch).toHaveBeenCalledWith('/api/collect2', expect.any(Object));
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.site).toBe('site2');
    });

    it('should warn when not initialized', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      track('test_event');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Better Analytics: SDK not initialized. Call init() first.'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Event Tracking', () => {
    beforeEach(() => {
      init({ endpoint: '/api/collect', site: 'test-site' });
    });

    it('should track custom events', async () => {
      track('button_click', { button: 'signup' });

      expect(mockFetch).toHaveBeenCalledWith('/api/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"event":"button_click"'),
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.props).toMatchObject({ button: 'signup' });
    });

    it('should track pageview events', () => {
      trackPageview();

      expect(mockFetch).toHaveBeenCalledWith('/api/collect', expect.any(Object));
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.event).toBe('pageview');
    });

    it('should include basic metadata in events', async () => {
      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody).toMatchObject({
        event: 'test_event',
        url: 'https://example.com/test',
        referrer: 'https://google.com',
        timestamp: expect.any(Number),
        site: 'test-site',
      });

      // Check that device info is included
      expect(callBody.device).toBeDefined();
      expect(callBody.device.userAgent).toBe('Mozilla/5.0 (Test Browser)');
    });

    it('should only include available data in payload (payload optimization)', () => {
      // Mock a minimal environment
      Object.defineProperty(document, 'title', { value: '', writable: true });

      track('minimal_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);

      // Should include basic required fields
      expect(callBody.event).toBe('minimal_event');
      expect(callBody.timestamp).toBeDefined();
      expect(callBody.url).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      init({ endpoint: '/api/collect' });
    });

    it('should handle network errors silently in production', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      expect(() => track('test_event')).not.toThrow();

      // Allow async error handling
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      // Restore
      process.env.NODE_ENV = originalEnv;
      consoleErrorSpy.mockRestore();
    });

    it('should log network errors in development', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      track('test_event');

      // Allow async error handling
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Restore
      process.env.NODE_ENV = originalEnv;
      consoleErrorSpy.mockRestore();
    });
  });
}); 