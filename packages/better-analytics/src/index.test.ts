import { describe, it, expect, vi, beforeEach } from 'vitest';
import { init, track, trackPageview, _resetConfig } from './index';

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

describe('Better Analytics SDK', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));
  });

  it('should initialize and fire pageview', async () => {
    init({ endpoint: '/api/collect' });

    expect(mockFetch).toHaveBeenCalledWith('/api/collect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"event":"pageview"'),
    });
  });

  it('should track custom events', async () => {
    init({ endpoint: '/api/collect' });
    mockFetch.mockClear(); // Clear the pageview call

    track('button_click', { button: 'signup' });

    expect(mockFetch).toHaveBeenCalledWith('/api/collect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"event":"button_click"'),
    });

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.props).toEqual({ button: 'signup' });
  });

  it('should include metadata in events', async () => {
    init({ endpoint: '/api/collect' });
    mockFetch.mockClear();

    track('test_event');

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody).toMatchObject({
      event: 'test_event',
      url: 'https://example.com/test',
      referrer: 'https://google.com',
      userAgent: 'Mozilla/5.0 (Test Browser)',
      timestamp: expect.any(Number),
    });
  });

  it('should warn when not initialized', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

    // Reset config to test uninitialized state
    _resetConfig();
    track('test_event');

    expect(consoleSpy).toHaveBeenCalledWith(
      'Better Analytics: SDK not initialized. Call init() first.'
    );

    consoleSpy.mockRestore();
  });
}); 