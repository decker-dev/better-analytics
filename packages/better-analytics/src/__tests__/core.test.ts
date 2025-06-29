import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { init, initWithPageview, track, trackPageview, identify, _resetConfig } from '../index';

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
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));
    _resetConfig();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NODE_ENV = originalEnv;
  });

  describe('Initialization', () => {
    it('should initialize without firing pageview', async () => {
      init({ site: 'test-site', mode: 'production' });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should initialize and fire pageview with initWithPageview', async () => {
      initWithPageview({ site: 'test-site', mode: 'production' });

      expect(mockFetch).toHaveBeenCalledWith('https://better-analytics.app/api/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"event":"pageview"'),
      });
    });

    it('should use custom endpoint when provided', async () => {
      initWithPageview({ site: 'test-site', endpoint: '/api/collect', mode: 'production' });

      expect(mockFetch).toHaveBeenCalledWith('/api/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"event":"pageview"'),
      });
    });

    it('should handle multiple init calls by updating config', () => {
      init({ site: 'site1', endpoint: '/api/collect', mode: 'production' });
      init({ site: 'site2', endpoint: '/api/collect2', mode: 'production' });

      track('test_event');

      expect(mockFetch).toHaveBeenCalledWith('/api/collect2', expect.any(Object));
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.site).toBe('site2');
    });

    it('should warn when not initialized', () => {
      // Ensure SDK is completely reset - clear all global state
      _resetConfig();

      // Clear window.ba to avoid queue system interference
      if (typeof window !== 'undefined') {
        window.ba = undefined;
        window.baq = undefined;
      }

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      // Don't initialize, just try to track
      track('test_event');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Better Analytics: SDK not initialized. Call init() first.'
      );

      consoleSpy.mockRestore();
    });

    it('should warn when no site identifier provided', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      // Test with empty site identifier
      init({ site: '', endpoint: '/api/collect', mode: 'production' });
      track('test_event');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Better Analytics: No site identifier provided. Please set the site parameter.'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Mode Detection and Behavior', () => {
    it('should auto-detect development mode from NODE_ENV', () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

      init({ site: 'test-site', endpoint: '/api/collect' });
      track('test_event');

      // Should log to console, not send to API
      expect(mockFetch).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('🚀 Better Analytics initialized in development mode');
      expect(consoleSpy).toHaveBeenCalledWith('📦 Data:', expect.objectContaining({
        event: 'test_event'
      }));

      consoleSpy.mockRestore();
    });

    it('should auto-detect production mode from NODE_ENV', () => {
      process.env.NODE_ENV = 'production';

      init({ site: 'test-site', endpoint: '/api/collect' });
      track('test_event');

      // Should send to API
      expect(mockFetch).toHaveBeenCalledWith('/api/collect', expect.any(Object));
    });

    it('should override mode when explicitly set to development', () => {
      process.env.NODE_ENV = 'production';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

      init({ site: 'test-site', endpoint: '/api/collect', mode: 'development' });
      track('test_event');

      // Should log to console despite NODE_ENV=production
      expect(mockFetch).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('🚀 Better Analytics initialized in development mode');
      expect(consoleSpy).toHaveBeenCalledWith('📦 Data:', expect.objectContaining({
        event: 'test_event'
      }));

      consoleSpy.mockRestore();
    });

    it('should override mode when explicitly set to production', () => {
      process.env.NODE_ENV = 'development';

      init({ site: 'test-site', endpoint: '/api/collect', mode: 'production' });
      track('test_event');

      // Should send to API despite NODE_ENV=development
      expect(mockFetch).toHaveBeenCalledWith('/api/collect', expect.any(Object));
    });

    it('should log initialization info in development mode with debug enabled', () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

      init({ site: 'test-site', endpoint: '/api/collect', debug: true });

      expect(consoleSpy).toHaveBeenCalledWith('🚀 Better Analytics initialized in development mode');
      expect(consoleSpy).toHaveBeenCalledWith('📍 Endpoint:', '/api/collect');
      expect(consoleSpy).toHaveBeenCalledWith('🏷️ Site:', 'test-site');

      consoleSpy.mockRestore();
    });

    it('should not log initialization info when debug is disabled', () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

      init({ site: 'test-site', endpoint: '/api/collect', debug: false });

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Event Tracking', () => {
    beforeEach(() => {
      init({ site: 'test-site', endpoint: '/api/collect', mode: 'production' });
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

  describe('User Identification (0.6.0)', () => {
    beforeEach(() => {
      init({ site: 'test-site', endpoint: '/api/collect', mode: 'production' });
    });

    it('should track user identification', () => {
      identify('user123', { email: 'user@example.com', plan: 'pro' });

      expect(mockFetch).toHaveBeenCalledWith('/api/collect', expect.any(Object));
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);

      expect(callBody.event).toBe('identify');
      expect(callBody.props).toMatchObject({
        userId: 'user123',
        email: 'user@example.com',
        plan: 'pro'
      });
    });

    it('should store userId in localStorage', () => {
      const mockLocalStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn()
      };
      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
        configurable: true
      });

      identify('user123');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('ba_uid', 'user123');
    });
  });

  describe('BeforeSend Middleware (0.6.0)', () => {
    it('should transform events with beforeSend', () => {
      const beforeSend = vi.fn((event) => {
        if (event.data) {
          event.data.props = { ...event.data.props, transformed: true };
        }
        return event;
      });

      init({
        site: 'test-site',
        endpoint: '/api/collect',
        mode: 'production',
        beforeSend
      });

      track('test_event', { original: 'data' });

      expect(beforeSend).toHaveBeenCalled();
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.props).toMatchObject({
        original: 'data',
        transformed: true
      });
    });

    it('should cancel events when beforeSend returns null', () => {
      const beforeSend = vi.fn(() => null);

      init({
        site: 'test-site',
        endpoint: '/api/collect',
        mode: 'production',
        beforeSend
      });

      track('test_event');

      expect(beforeSend).toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Development Mode Logging', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should log events to console in development mode', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

      init({ site: 'test-site', endpoint: '/api/collect' });
      track('dev_event', { test: 'data' });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('🚀 Better Analytics initialized in development mode');
      expect(consoleSpy).toHaveBeenCalledWith('📦 Data:', expect.objectContaining({
        event: 'dev_event',
        props: { test: 'data' }
      }));

      consoleSpy.mockRestore();
    });

    it('should log default SaaS endpoint in development mode with debug', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

      init({ site: 'test-site', debug: true }); // No custom endpoint, but with debug
      track('dev_event');

      expect(consoleSpy).toHaveBeenCalledWith('🚀 Better Analytics initialized in development mode');
      expect(consoleSpy).toHaveBeenCalledWith('📍 Endpoint:', 'https://better-analytics.app/api/collect (default)');
      expect(consoleSpy).toHaveBeenCalledWith('📦 Data:', expect.objectContaining({
        event: 'dev_event'
      }));

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      init({ site: 'test-site', endpoint: '/api/collect', mode: 'production' });
    });

    it('should handle network errors silently in production', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      expect(() => track('test_event')).not.toThrow();

      // Allow async error handling
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should detect development mode from NODE_ENV and show appropriate behavior', async () => {
      // Test that development mode is detected correctly and behaves as expected
      process.env.NODE_ENV = 'development';
      _resetConfig();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

      // In development mode with auto-detection, events should be logged, not sent
      init({ site: 'test-site', endpoint: '/api/collect', mode: 'auto' });
      track('test_event');

      // Should log to console, not make fetch calls
      expect(mockFetch).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('🚀 Better Analytics initialized in development mode');
      expect(consoleSpy).toHaveBeenCalledWith('📦 Data:', expect.objectContaining({
        event: 'test_event'
      }));

      consoleSpy.mockRestore();
    });
  });
}); 