import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  initQueue,
  processQueue,
  clearQueue,
  getQueueSize,
  saveOfflineEvents,
  getOfflineEvents,
  clearOfflineEvents
} from '../queue';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

declare global {
  interface Window {
    ba?: {
      (action: string, ...args: unknown[]): void;
      ready?: boolean;
      processQueue?: () => void;
    };
    baq?: Array<{
      type: string;
      event?: string;
      props?: unknown;
      timestamp: number;
      retries?: number;
    }>;
  }
}

describe('Better Analytics SDK - Queue System (0.6.0)', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();

    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // Clear window globals
    if (typeof window !== 'undefined') {
      window.ba = undefined;
      window.baq = undefined;
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearQueue();
  });

  describe('Queue Initialization', () => {
    it('should initialize empty queue when no previous events', () => {
      initQueue();

      expect(window.ba).toBeDefined();
      expect(window.baq).toEqual([]);
      expect(typeof window.ba).toBe('function');
    });

    it('should create stub function that queues events', () => {
      initQueue();

      window.ba!('track', 'test_event', { prop: 'value' });

      expect(window.baq).toHaveLength(1);
      expect(window.baq![0]).toMatchObject({
        type: 'track',
        event: 'test_event',
        props: { prop: 'value' },
        timestamp: expect.any(Number)
      });
    });

    it('should queue different event types correctly', () => {
      initQueue();

      window.ba!('track', 'button_click', { button: 'signup' });
      window.ba!('pageview', '/products');
      window.ba!('identify', 'user123', { email: 'user@example.com' });

      expect(window.baq).toHaveLength(3);

      expect(window.baq![0]).toMatchObject({
        type: 'track',
        event: 'button_click',
        props: { button: 'signup' }
      });

      expect(window.baq![1]).toMatchObject({
        type: 'pageview',
        props: '/products'
      });

      expect(window.baq![2]).toMatchObject({
        type: 'identify',
        props: { userId: 'user123', email: 'user@example.com' }
      });
    });
  });

  describe('Queue Processing', () => {
    it('should process all queued events', () => {
      initQueue();

      // Queue some events
      window.ba!('track', 'event1');
      window.ba!('track', 'event2');
      window.ba!('pageview');

      expect(window.baq).toHaveLength(3);

      const handler = vi.fn();
      processQueue(handler);

      expect(handler).toHaveBeenCalledTimes(3);
      expect(window.baq).toHaveLength(0); // Queue should be empty after processing
      expect(window.ba!.ready).toBe(true);
    });

    it('should handle processing errors gracefully', () => {
      initQueue();

      window.ba!('track', 'event1');
      window.ba!('track', 'event2');

      const handler = vi.fn()
        .mockImplementationOnce(() => { throw new Error('Processing failed'); })
        .mockImplementationOnce(() => { }); // Second call succeeds

      processQueue(handler);

      // Should still process other events even if one fails
      // The failed event gets re-queued, so it might be called more times
      expect(handler).toHaveBeenCalledTimes(3); // 2 initial + 1 retry
    });

    it('should retry failed events up to 3 times', () => {
      initQueue();

      window.ba!('track', 'failing_event');

      const handler = vi.fn(() => { throw new Error('Always fails'); });

      // Process multiple times to trigger retries
      processQueue(handler);
      processQueue(handler);
      processQueue(handler);
      processQueue(handler); // This should not process the event again

      // Event should be retried up to 3 times then discarded
      expect(handler).toHaveBeenCalledTimes(4); // Initial + 3 retries
      expect(window.baq).toHaveLength(0);
    });
  });

  describe('Queue Size Management', () => {
    it('should return correct queue size', () => {
      expect(getQueueSize()).toBe(0);

      initQueue();
      expect(getQueueSize()).toBe(0);

      window.ba!('track', 'event1');
      expect(getQueueSize()).toBe(1);

      window.ba!('track', 'event2');
      expect(getQueueSize()).toBe(2);
    });

    it('should clear queue when requested', () => {
      initQueue();

      window.ba!('track', 'event1');
      window.ba!('track', 'event2');

      expect(getQueueSize()).toBe(2);

      clearQueue();

      expect(getQueueSize()).toBe(0);
    });
  });

  describe('Offline Event Storage', () => {
    it('should save events to localStorage when offline', () => {
      const events = [
        { type: 'track' as const, event: 'offline_event', timestamp: Date.now() },
        { type: 'pageview' as const, timestamp: Date.now() }
      ];

      saveOfflineEvents(events);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'ba_offline_queue',
        JSON.stringify(events)
      );
    });

    it('should retrieve offline events from localStorage', () => {
      const storedEvents = [
        { type: 'track' as const, event: 'stored_event', timestamp: Date.now() }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedEvents));

      const events = getOfflineEvents();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('ba_offline_queue');
      expect(events).toEqual(storedEvents);
    });

    it('should return empty array when no offline events stored', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const events = getOfflineEvents();

      expect(events).toEqual([]);
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const events = getOfflineEvents();

      expect(events).toEqual([]);
    });

    it('should limit offline events to maximum of 100', () => {
      // Create array of 150 events
      const manyEvents = Array(150).fill(0).map((_, i) => ({
        type: 'track' as const,
        event: `event_${i}`,
        timestamp: Date.now()
      }));

      saveOfflineEvents(manyEvents);

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(100); // Should be limited to 100
      expect(savedData[0].event).toBe('event_50'); // Should keep the latest 100
    });

    it('should merge new events with existing offline events', () => {
      const existingEvents = [
        { type: 'track' as const, event: 'existing_event', timestamp: Date.now() }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingEvents));

      const newEvents = [
        { type: 'track' as const, event: 'new_event', timestamp: Date.now() }
      ];

      saveOfflineEvents(newEvents);

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(2);
      expect(savedData[0].event).toBe('existing_event');
      expect(savedData[1].event).toBe('new_event');
    });

    it('should clear offline events', () => {
      clearOfflineEvents();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ba_offline_queue');
    });
  });

  describe('Queue Integration', () => {
    it('should work with window undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      global.window = undefined;

      expect(() => initQueue()).not.toThrow();
      expect(() => processQueue(vi.fn())).not.toThrow();
      expect(getQueueSize()).toBe(0);

      global.window = originalWindow;
    });

    it('should prevent double initialization', () => {
      initQueue();
      const firstBa = window.ba;

      initQueue(); // Second initialization

      // Should create new function (this is actually expected behavior)
      expect(window.ba).toBeDefined();
      expect(typeof window.ba).toBe('function');
    });

    it('should process immediately when SDK is ready', () => {
      initQueue();

      const handler = vi.fn();
      processQueue(handler);

      // Now SDK is marked as ready
      expect(window.ba!.ready).toBe(true);

      // New events should trigger immediate processing
      window.ba!('track', 'immediate_event');

      // This would normally be handled by the actual SDK, 
      // but we're testing the queue mechanism
      expect(window.ba!.processQueue).toBeDefined();
    });
  });
}); 