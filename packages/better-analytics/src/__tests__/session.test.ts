import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { init, track, _resetConfig } from '../index';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

// Mock crypto for testing device ID generation
const mockCrypto = {
  randomUUID: vi.fn(() => 'mocked-uuid-123')
};

describe('Better Analytics SDK - Session Management', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();

    // Setup global mocks
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    Object.defineProperty(global, 'crypto', {
      value: mockCrypto,
      writable: true,
    });

    _resetConfig();
    init({ site: 'test-site', endpoint: '/api/collect' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Session ID Generation', () => {
    it('should generate new session ID when none exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.sessionId).toBeDefined();
      expect(typeof callBody.sessionId).toBe('string');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'ba_s',
        expect.stringContaining(callBody.sessionId)
      );
    });

    it('should reuse valid session ID', () => {
      const validSession = {
        id: 'existing-session-123',
        t: Date.now() - 1000 // 1 second ago, still valid
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validSession));

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.sessionId).toBe('existing-session-123');
    });

    it('should generate new session when old one expired', () => {
      const expiredSession = {
        id: 'expired-session-123',
        t: Date.now() - (31 * 60 * 1000) // 31 minutes ago, expired
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredSession));

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.sessionId).not.toBe('expired-session-123');
      expect(callBody.sessionId).toBeDefined();
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      expect(() => track('test_event')).not.toThrow();

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.sessionId).toBeDefined();
    });

    it('should update session timestamp on activity', () => {
      const validSession = {
        id: 'existing-session-123',
        t: Date.now() - 10000 // 10 seconds ago
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validSession));

      track('test_event');

      // Should update timestamp
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'ba_s',
        expect.stringMatching(/"id":"existing-session-123"/)
      );
    });
  });

  describe('Device ID Generation', () => {
    it('should generate device ID using crypto.randomUUID when available', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'ba_d') return null;
        return null;
      });
      mockCrypto.randomUUID.mockReturnValue('crypto-uuid-123');

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.deviceId).toBe('crypto-uuid-123');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('ba_d', 'crypto-uuid-123');
    });

    it('should fallback to custom ID generation when crypto unavailable', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'ba_d') return null;
        return null;
      });
      Object.defineProperty(global, 'crypto', { value: undefined, writable: true });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.deviceId).toBeDefined();
      expect(typeof callBody.deviceId).toBe('string');
      expect(callBody.deviceId).not.toBe('crypto-uuid-123');
    });

    it('should reuse existing device ID', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'ba_d') return 'existing-device-456';
        return null;
      });

      track('test_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.deviceId).toBe('existing-device-456');
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith('ba_d', expect.any(String));
    });

    it('should handle device ID localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'ba_d') throw new Error('localStorage not available');
        return null;
      });
      mockLocalStorage.setItem.mockImplementation((key) => {
        if (key === 'ba_d') throw new Error('localStorage not available');
      });

      expect(() => track('test_event')).not.toThrow();

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.deviceId).toBeDefined();
    });
  });

  describe('Session Duration', () => {
    it('should extend session on multiple events within timeout', () => {
      const initialTime = Date.now();
      const validSession = {
        id: 'session-123',
        t: initialTime - 5000 // 5 seconds ago
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validSession));

      track('event1');
      track('event2');

      // Both events should use same session
      const call1Body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const call2Body = JSON.parse(mockFetch.mock.calls[1][1].body);

      expect(call1Body.sessionId).toBe('session-123');
      expect(call2Body.sessionId).toBe('session-123');
    });

    it('should create new session after 30 minute timeout', () => {
      const expiredTime = Date.now() - (35 * 60 * 1000); // 35 minutes ago
      const expiredSession = {
        id: 'old-session-123',
        t: expiredTime
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredSession));

      track('new_event');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.sessionId).not.toBe('old-session-123');
      expect(callBody.sessionId).toBeDefined();
    });
  });
}); 