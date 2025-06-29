import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { init, initWithPageview, track, trackPageview, _resetConfig } from '../index';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Setup realistic browser environment
const setupBrowserEnvironment = () => {
  Object.defineProperty(window, 'location', {
    value: {
      href: 'https://mystore.com/products/shoes?utm_source=google&utm_medium=cpc&utm_campaign=black_friday',
      pathname: '/products/shoes',
      hostname: 'mystore.com'
    },
    writable: true,
    configurable: true
  });

  Object.defineProperty(document, 'title', {
    value: 'Premium Running Shoes - MyStore',
    writable: true,
    configurable: true
  });

  Object.defineProperty(document, 'referrer', {
    value: 'https://google.com/search?q=running+shoes',
    writable: true,
    configurable: true
  });

  Object.defineProperty(navigator, 'userAgent', {
    value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    writable: true,
    configurable: true
  });

  Object.defineProperty(navigator, 'language', {
    value: 'en-US',
    writable: true,
    configurable: true
  });

  Object.defineProperty(screen, 'width', {
    value: 1920,
    writable: true,
    configurable: true
  });

  Object.defineProperty(screen, 'height', {
    value: 1080,
    writable: true,
    configurable: true
  });

  Object.defineProperty(window, 'innerWidth', {
    value: 1200,
    writable: true,
    configurable: true
  });

  Object.defineProperty(window, 'innerHeight', {
    value: 800,
    writable: true,
    configurable: true
  });

  Object.defineProperty(window, 'performance', {
    value: {
      timing: {
        navigationStart: 1000,
        loadEventEnd: 1750
      }
    },
    writable: true,
    configurable: true
  });

  Object.defineProperty(navigator, 'connection', {
    value: { effectiveType: '4g' },
    writable: true,
    configurable: true
  });

  const mockIntl = {
    DateTimeFormat: vi.fn().mockReturnValue({
      resolvedOptions: () => ({ timeZone: 'America/New_York' })
    })
  };
  Object.defineProperty(global, 'Intl', {
    value: mockIntl,
    writable: true,
    configurable: true
  });
};

describe('Better Analytics SDK - Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));
    _resetConfig();
    setupBrowserEnvironment();

    // Mock localStorage to return consistent session/device IDs
    const mockLocalStorage = {
      getItem: vi.fn().mockImplementation((key) => {
        if (key === 'ba_s') {
          return JSON.stringify({ id: 'test-session-123', t: Date.now() });
        }
        if (key === 'ba_d') {
          return 'test-device-456';
        }
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('E-commerce User Journey', () => {
    it('should track complete user journey with rich metadata', () => {
      // Initialize analytics for e-commerce site
      init({
        site: 'mystore-production',
        endpoint: '/api/analytics',
        mode: 'production'
      });

      // Track page view
      trackPageview();

      // Get the pageview event data
      const pageviewCall = JSON.parse(mockFetch.mock.calls[0][1].body);

      // Verify comprehensive pageview data
      expect(pageviewCall).toMatchObject({
        event: 'pageview',
        site: 'mystore-production',
        url: 'https://mystore.com/products/shoes?utm_source=google&utm_medium=cpc&utm_campaign=black_friday',
        referrer: 'https://google.com/search?q=running+shoes',
        timestamp: expect.any(Number),
      });

      // Check UTM tracking
      expect(pageviewCall.utm).toMatchObject({
        source: 'google',
        medium: 'cpc',
        campaign: 'black_friday'
      });

      // Check device info
      expect(pageviewCall.device).toMatchObject({
        userAgent: expect.stringContaining('Mozilla/5.0'),
        screenWidth: 1920,
        screenHeight: 1080,
        viewportWidth: 1200,
        viewportHeight: 800,
        language: 'en-US',
        timezone: 'America/New_York',
        connectionType: '4g'
      });

      // Check page info
      expect(pageviewCall.page).toMatchObject({
        title: 'Premium Running Shoes - MyStore',
        pathname: '/products/shoes',
        hostname: 'mystore.com',
        loadTime: 750 // 1750 - 1000
      });

      // Track product interaction
      track('product_viewed', {
        product_id: 'SHOE_001',
        product_name: 'Premium Running Shoes',
        category: 'footwear',
        price: 129.99,
        currency: 'USD'
      });

      // Verify product event
      const productCall = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(productCall).toMatchObject({
        event: 'product_viewed',
        props: {
          product_id: 'SHOE_001',
          product_name: 'Premium Running Shoes',
          category: 'footwear',
          price: 129.99,
          currency: 'USD'
        }
      });

      // Track add to cart
      track('add_to_cart', {
        product_id: 'SHOE_001',
        quantity: 1,
        value: 129.99
      });

      // Verify all events share session and device IDs
      const addToCartCall = JSON.parse(mockFetch.mock.calls[2][1].body);

      expect(pageviewCall.sessionId).toBe(productCall.sessionId);
      expect(productCall.sessionId).toBe(addToCartCall.sessionId);

      expect(pageviewCall.deviceId).toBe(productCall.deviceId);
      expect(productCall.deviceId).toBe(addToCartCall.deviceId);

      // All events should have same UTM data
      expect(productCall.utm).toMatchObject(pageviewCall.utm);
      expect(addToCartCall.utm).toMatchObject(pageviewCall.utm);
    });

    it('should handle rapid successive events', () => {
      init({ site: 'test-site', endpoint: '/api/analytics', mode: 'production' });

      // Simulate rapid user interactions
      track('button_hover', { button: 'add_to_cart' });
      track('button_click', { button: 'add_to_cart' });
      track('modal_opened', { modal: 'size_selector' });
      track('size_selected', { size: 'US_10' });
      track('add_to_cart', { product_id: 'SHOE_001' });

      // All should be tracked
      expect(mockFetch).toHaveBeenCalledTimes(5);

      // All should share same session
      const events = mockFetch.mock.calls.map(call => JSON.parse(call[1].body));
      const sessionIds = events.map(e => e.sessionId);
      const uniqueSessionIds = [...new Set(sessionIds)];

      expect(uniqueSessionIds).toHaveLength(1);
    });
  });

  describe('Marketing Attribution', () => {
    it('should properly attribute conversions to marketing campaigns', () => {
      // Simulate user coming from paid search
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://mystore.com/landing?utm_source=google&utm_medium=cpc&utm_campaign=holiday_sale&utm_term=running+shoes&utm_content=ad_variant_a',
          pathname: '/landing',
          hostname: 'mystore.com'
        },
        writable: true,
        configurable: true
      });

      init({ site: 'test-site', endpoint: '/api/analytics', mode: 'production' });

      // Track landing page visit
      trackPageview();

      // Navigate and purchase
      track('purchase', {
        transaction_id: 'TXN_12345',
        value: 259.98,
        currency: 'USD',
        items: [
          { product_id: 'SHOE_001', quantity: 2, price: 129.99 }
        ]
      });

      const purchaseEvent = JSON.parse(mockFetch.mock.calls[1][1].body);

      // Purchase should be attributed to original UTM parameters
      expect(purchaseEvent.utm).toMatchObject({
        source: 'google',
        medium: 'cpc',
        campaign: 'holiday_sale',
        term: 'running shoes', // URL decoding converts + to space
        content: 'ad_variant_a'
      });

      expect(purchaseEvent.props).toMatchObject({
        transaction_id: 'TXN_12345',
        value: 259.98,
        currency: 'USD'
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should track page performance metrics', () => {
      // Simulate slow loading page
      Object.defineProperty(window, 'performance', {
        value: {
          timing: {
            navigationStart: 1000,
            loadEventEnd: 3500 // 2.5 second load time
          }
        },
        writable: true,
        configurable: true
      });

      init({ site: 'test-site', endpoint: '/api/analytics', mode: 'production' });
      trackPageview();

      const event = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(event.page.loadTime).toBe(2500);
    });

    it('should track across different connection types', () => {
      const connectionTypes = ['slow-2g', '2g', '3g', '4g'];

      connectionTypes.forEach((connectionType, index) => {
        _resetConfig();
        mockFetch.mockClear();

        Object.defineProperty(navigator, 'connection', {
          value: { effectiveType: connectionType },
          writable: true,
          configurable: true
        });

        init({ site: 'test-site', endpoint: '/api/analytics', mode: 'production' });
        track('performance_test', { connection_type: connectionType });

        const event = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(event.device.connectionType).toBe(connectionType);
      });
    });
  });

  describe('Cross-session Tracking', () => {
    it('should maintain device ID across sessions', () => {
      // Mock localStorage with existing device ID
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };

      // First session
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'ba_d') return 'device_123';
        if (key === 'ba_s') return null; // No active session
        return null;
      });

      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
        configurable: true
      });

      init({ site: 'test-site', endpoint: '/api/analytics', mode: 'production' });
      track('session_start');

      const event1 = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(event1.deviceId).toBe('device_123');

      // Second session (different time)
      _resetConfig();
      mockFetch.mockClear();

      init({ site: 'test-site', endpoint: '/api/analytics', mode: 'production' });
      track('session_start');

      const event2 = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(event2.deviceId).toBe('device_123'); // Same device
      expect(event2.sessionId).not.toBe(event1.sessionId); // Different session
    });
  });

  describe('Data Quality', () => {
    it('should sanitize and validate event data', () => {
      init({ site: 'test-site', endpoint: '/api/analytics', mode: 'production' });

      // Track event with various data types
      track('data_test', {
        string_value: 'hello world',
        number_value: 42,
        boolean_value: true,
        null_value: null,
        undefined_value: undefined,
        object_value: { nested: 'data' },
        array_value: [1, 2, 3]
      });

      const event = JSON.parse(mockFetch.mock.calls[0][1].body);

      expect(event.props).toMatchObject({
        string_value: 'hello world',
        number_value: 42,
        boolean_value: true,
        null_value: null,
        object_value: { nested: 'data' },
        array_value: [1, 2, 3]
      });

      // undefined should be excluded
      expect(event.props).not.toHaveProperty('undefined_value');
    });

    it('should handle edge case data gracefully', () => {
      init({ site: 'test-site', endpoint: '/api/analytics', mode: 'production' });

      // Track with edge case values
      track('edge_case_test', {
        empty_string: '',
        zero: 0,
        negative: -1,
        large_number: Number.MAX_SAFE_INTEGER,
        special_chars: '!@#$%^&*()[]{}|;:,.<>?',
        unicode: '🚀💡✨',
        very_long_string: 'a'.repeat(1000)
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const event = JSON.parse(mockFetch.mock.calls[0][1].body);

      expect(event.props.empty_string).toBe('');
      expect(event.props.zero).toBe(0);
      expect(event.props.unicode).toBe('🚀💡✨');
      expect(event.props.very_long_string).toHaveLength(1000);
    });
  });
}); 