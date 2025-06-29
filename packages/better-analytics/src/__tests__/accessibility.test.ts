import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { init, track, _resetConfig } from '../index';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Better Analytics SDK - Accessibility & Privacy', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));
    _resetConfig();
    init({ site: 'test-site', endpoint: '/api/collect', mode: 'production' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Privacy Compliance', () => {
    it('should not track sensitive user information by default', () => {
      track('page_view');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);

      // Should not include sensitive browser fingerprinting
      expect(callBody).not.toHaveProperty('installedPlugins');
      expect(callBody).not.toHaveProperty('cookiesEnabled');
      expect(callBody).not.toHaveProperty('localStorage');
      expect(callBody).not.toHaveProperty('ip_address');
    });

    it('should handle do-not-track settings gracefully', () => {
      // Mock DNT header
      Object.defineProperty(navigator, 'doNotTrack', {
        value: '1',
        writable: true,
        configurable: true
      });

      expect(() => track('test_event')).not.toThrow();

      // Library should still work but could respect DNT in production
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should work in incognito/private browsing mode', () => {
      // Mock private browsing (localStorage throws)
      const mockLocalStorage = {
        getItem: vi.fn(() => {
          throw new Error('QuotaExceededError');
        }),
        setItem: vi.fn(() => {
          throw new Error('QuotaExceededError');
        })
      };

      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
        configurable: true
      });

      expect(() => track('private_browsing_test')).not.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility Features', () => {
    it('should work with screen readers and assistive technology', () => {
      // Mock screen reader environment
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) JAWS/2023',
        writable: true,
        configurable: true
      });

      track('screen_reader_interaction', {
        element_type: 'button',
        aria_label: 'Submit form'
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.device.userAgent).toContain('JAWS');
      expect(callBody.props.aria_label).toBe('Submit form');
    });

    it('should track high contrast mode usage', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn(() => ({
          matches: true,
          media: '(prefers-contrast: high)',
          addEventListener: vi.fn(),
          removeEventListener: vi.fn()
        })),
        writable: true,
        configurable: true
      });

      track('accessibility_preference_detected', {
        preference: 'high_contrast',
        value: true
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle reduced motion preferences', () => {
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn()
        })),
        writable: true,
        configurable: true
      });

      track('motion_preference_respected', {
        reduced_motion: true
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Internationalization', () => {
    it('should handle different language settings', () => {
      const languages = ['en-US', 'es-ES', 'zh-CN', 'ar-SA', 'he-IL'];

      for (const language of languages) {
        _resetConfig();
        mockFetch.mockClear();
        init({ site: 'test-site', endpoint: '/api/collect', mode: 'production' });

        Object.defineProperty(navigator, 'language', {
          value: language,
          writable: true,
          configurable: true
        });

        track('language_test', { test_language: language });

        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody.device.language).toBe(language);
      }
    });

    it('should handle different timezone formats', () => {
      const timezones = [
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo',
        'Australia/Sydney',
        'UTC'
      ];

      for (const timezone of timezones) {
        _resetConfig();
        mockFetch.mockClear();
        init({ site: 'test-site', endpoint: '/api/collect', mode: 'production' });

        const mockIntl = {
          DateTimeFormat: vi.fn().mockReturnValue({
            resolvedOptions: () => ({ timeZone: timezone })
          })
        };

        Object.defineProperty(global, 'Intl', {
          value: mockIntl,
          writable: true,
          configurable: true
        });

        track('timezone_test', { test_timezone: timezone });

        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody.device.timezone).toBe(timezone);
      }
    });

    it('should handle RTL text direction', () => {
      Object.defineProperty(document, 'dir', {
        value: 'rtl',
        writable: true,
        configurable: true
      });

      track('rtl_layout_test', {
        text_direction: 'rtl',
        language: 'ar-SA'
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cross-browser Compatibility', () => {
    it('should work in legacy Internet Explorer', () => {
      // Mock IE11 environment
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko',
        writable: true,
        configurable: true
      });

      // IE doesn't have fetch, would use polyfill
      expect(() => track('ie11_test')).not.toThrow();
    });

    it('should work in Safari with ITP restrictions', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
        writable: true,
        configurable: true
      });

      // Mock Safari ITP localStorage restrictions
      const mockLocalStorage = {
        getItem: vi.fn(() => null), // ITP clears storage
        setItem: vi.fn(() => {
          throw new Error('Storage quota exceeded');
        })
      };

      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
        configurable: true
      });

      expect(() => track('safari_itp_test')).not.toThrow();
    });
  });

  describe('GDPR & Privacy Compliance (0.6.0)', () => {
    it('should allow filtering personal data with beforeSend', () => {
      _resetConfig();

      const beforeSend = vi.fn((event) => {
        // Remove potentially personal data
        if (event.data?.props) {
          const { email, name, ...safeProps } = event.data.props as Record<string, unknown>;
          event.data.props = safeProps;
        }
        return event;
      });

      init({
        site: 'test-site',
        endpoint: '/api/collect',
        mode: 'production',
        beforeSend
      });

      track('user_action', {
        email: 'user@example.com',
        name: 'John Doe',
        action: 'click_button'
      });

      expect(beforeSend).toHaveBeenCalled();
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.props).not.toHaveProperty('email');
      expect(callBody.props).not.toHaveProperty('name');
      expect(callBody.props).toHaveProperty('action');
    });

    it('should respect user consent by canceling events', () => {
      _resetConfig();

      const beforeSend = vi.fn(() => {
        // Simulate user hasn't given consent
        return null; // Cancel all events
      });

      init({
        site: 'test-site',
        endpoint: '/api/collect',
        mode: 'production',
        beforeSend
      });

      track('consent_required_event');

      expect(beforeSend).toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
}); 