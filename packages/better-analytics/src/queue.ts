// Better Analytics - Event Queue System
// Handles events before SDK initialization and offline scenarios

interface QueuedEvent {
  type: 'track' | 'pageview' | 'identify';
  event?: string;
  props?: Record<string, unknown>;
  timestamp: number;
  retries?: number;
}

interface BetterAnalytics {
  (action: string, ...args: unknown[]): void;
  queue?: QueuedEvent[];
  ready?: boolean;
  processQueue?: () => void;
}

declare global {
  interface Window {
    ba?: BetterAnalytics;
    baq?: QueuedEvent[];
  }
}

/**
 * Initialize the event queue system
 * This runs before the SDK is fully loaded to capture early events
 */
export function initQueue(): void {
  if (typeof window === 'undefined') return;

  // If already initialized, skip
  if (window.ba?.ready) return;

  // Create queue if it doesn't exist
  window.baq = window.baq || [];

  // Create stub function that queues events
  window.ba = function queueEvent(action: string, ...args: unknown[]): void {
    // If SDK is ready, process immediately
    if (window.ba?.ready && window.ba.processQueue) {
      window.ba.processQueue();
      return;
    }

    // Otherwise queue the event
    const event: QueuedEvent = {
      type: action as QueuedEvent['type'],
      timestamp: Date.now(),
    };

    // Parse arguments based on action type
    if (action === 'track' && args[0]) {
      event.event = args[0] as string;
      event.props = args[1] as Record<string, unknown>;
    } else if (action === 'pageview') {
      event.props = args[0] as Record<string, unknown>;
    } else if (action === 'identify' && args[0]) {
      event.props = { userId: args[0], ...(args[1] as Record<string, unknown>) };
    }

    window.baq = window.baq || [];
    window.baq.push(event);
  };

  // Preserve the queue reference
  window.ba.queue = window.baq;
}

/**
 * Process all queued events
 * Called when SDK is fully initialized
 */
export function processQueue(handler: (event: QueuedEvent) => void): void {
  if (typeof window === 'undefined') return;

  const queue = window.baq || [];

  // Mark SDK as ready
  if (window.ba) {
    window.ba.ready = true;
    window.ba.processQueue = () => processQueue(handler);
  }

  // Process all queued events
  while (queue.length > 0) {
    const event = queue.shift();
    if (event) {
      try {
        handler(event);
      } catch (error) {
        // Re-queue failed events with retry count
        if ((event.retries || 0) < 3) {
          event.retries = (event.retries || 0) + 1;
          queue.push(event);
        }
      }
    }
  }
}

/**
 * Clear the event queue (for testing)
 */
export function clearQueue(): void {
  if (typeof window !== 'undefined') {
    window.baq = [];
  }
}

/**
 * Get current queue size
 */
export function getQueueSize(): number {
  if (typeof window === 'undefined') return 0;
  return (window.baq || []).length;
}

// Offline support with localStorage
const OFFLINE_QUEUE_KEY = 'ba_offline_queue';
const MAX_OFFLINE_EVENTS = 100;

/**
 * Save events to localStorage when offline
 */
export function saveOfflineEvents(events: QueuedEvent[]): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getOfflineEvents();
    const combined = [...existing, ...events].slice(-MAX_OFFLINE_EVENTS);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(combined));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get offline events from localStorage
 */
export function getOfflineEvents(): QueuedEvent[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (stored) {
      return JSON.parse(stored) as QueuedEvent[];
    }
  } catch {
    // Ignore errors
  }

  return [];
}

/**
 * Clear offline events
 */
export function clearOfflineEvents(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch {
    // Ignore errors
  }
}

export type { QueuedEvent, BetterAnalytics }; 