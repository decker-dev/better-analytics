import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { init, track, trackPageview, _resetConfig } from '../index';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to simulate realistic user behavior
const simulateUserInteraction = () => ({
  timestamp: Date.now(),
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  location: {
    href: 'https://example.com/products',
    pathname: '/products',
    hostname: 'example.com'
  }
});

describe('Better Analytics SDK - User Journey Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));
    _resetConfig();

    // Setup realistic browser environment
    Object.defineProperty(window, 'location', {
      value: simulateUserInteraction().location,
      writable: true,
      configurable: true
    });

    Object.defineProperty(navigator, 'userAgent', {
      value: simulateUserInteraction().userAgent,
      writable: true,
      configurable: true
    });

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

  describe('SaaS Onboarding Flow', () => {
    it('should track complete SaaS user onboarding with proper attribution', () => {
      // Landing from Google Ads
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://myapp.com/landing?utm_source=google&utm_medium=cpc&utm_campaign=saas_signup',
          pathname: '/landing',
          hostname: 'myapp.com'
        },
        writable: true,
        configurable: true
      });

      init({ site: 'myapp', endpoint: '/api/analytics', mode: 'production' });

      // 1. Landing page view
      trackPageview();

      // 2. Watch demo video
      track('demo_video_started', {
        video_duration: 120,
        video_quality: '1080p'
      });

      // 3. Sign up form interaction
      track('signup_form_started', {
        form_step: 'email'
      });

      track('signup_form_completed', {
        email_provider: 'gmail',
        signup_method: 'email'
      });

      // 4. Email verification
      track('email_verification_sent');
      track('email_verification_completed');

      // 5. Onboarding steps
      track('onboarding_step_completed', {
        step: 'welcome',
        step_number: 1,
        time_spent: 30
      });

      track('onboarding_step_completed', {
        step: 'profile_setup',
        step_number: 2,
        time_spent: 45
      });

      // 6. First feature usage
      track('feature_first_use', {
        feature: 'dashboard',
        user_type: 'trial'
      });

      // Verify all events share same session and attribution
      expect(mockFetch).toHaveBeenCalledTimes(9);

      const events = mockFetch.mock.calls.map(call => JSON.parse(call[1].body));
      const sessionIds = events.map(e => e.sessionId);
      const uniqueSessionIds = [...new Set(sessionIds)];

      expect(uniqueSessionIds).toHaveLength(1);

      // All events should maintain UTM attribution
      for (const event of events) {
        expect(event.utm).toMatchObject({
          source: 'google',
          medium: 'cpc',
          campaign: 'saas_signup'
        });
      }
    });
  });

  describe('E-commerce Purchase Funnel', () => {
    it('should track complete purchase funnel with cart abandonment recovery', () => {
      init({ site: 'store', endpoint: '/api/analytics', mode: 'production' });

      // Product discovery
      track('product_search', {
        query: 'running shoes',
        results_count: 24
      });

      track('product_viewed', {
        product_id: 'SHOE_001',
        product_name: 'Ultra Runner Pro',
        category: 'footwear',
        price: 149.99
      });

      // Add to cart
      track('add_to_cart', {
        product_id: 'SHOE_001',
        quantity: 1,
        value: 149.99
      });

      // Cart view
      track('cart_viewed', {
        cart_value: 149.99,
        item_count: 1
      });

      // Checkout started
      track('checkout_started', {
        cart_value: 149.99,
        payment_method: 'credit_card'
      });

      // Address form
      track('checkout_step_completed', {
        step: 'shipping_address',
        step_number: 1
      });

      // Payment form - abandoned here
      track('checkout_step_started', {
        step: 'payment',
        step_number: 2
      });

      // Cart abandonment (user leaves)
      track('cart_abandoned', {
        cart_value: 149.99,
        checkout_step: 'payment'
      });

      // Recovery email clicked (different session)
      _resetConfig();
      init({ site: 'store', endpoint: '/api/analytics', mode: 'production' });

      track('email_clicked', {
        email_type: 'cart_recovery',
        campaign: 'abandoned_cart_24h'
      });

      // Complete purchase
      track('purchase', {
        transaction_id: 'TXN_12345',
        value: 149.99,
        currency: 'USD',
        recovery_campaign: 'abandoned_cart_24h'
      });

      expect(mockFetch).toHaveBeenCalledTimes(10);
    });
  });

  describe('Content Engagement Tracking', () => {
    it('should track blog reading behavior with scroll depth', () => {
      init({ site: 'blog', endpoint: '/api/analytics', mode: 'production' });

      // Article pageview
      trackPageview();

      // Reading progression
      track('scroll_depth', {
        depth_percentage: 25,
        time_on_page: 30
      });

      track('scroll_depth', {
        depth_percentage: 50,
        time_on_page: 60
      });

      track('scroll_depth', {
        depth_percentage: 75,
        time_on_page: 120
      });

      // Social sharing
      track('content_shared', {
        platform: 'twitter',
        content_type: 'blog_post'
      });

      // Newsletter signup
      track('newsletter_signup', {
        source: 'blog_article',
        placement: 'content_bottom'
      });

      // Related article click
      track('internal_link_clicked', {
        link_text: 'How to optimize performance',
        link_position: 'related_articles'
      });

      expect(mockFetch).toHaveBeenCalledTimes(7);

      // Verify progressive engagement tracking
      const scrollEvents = mockFetch.mock.calls
        .filter(call => JSON.parse(call[1].body).event === 'scroll_depth')
        .map(call => JSON.parse(call[1].body));

      expect(scrollEvents).toHaveLength(3);
      expect(scrollEvents[0].props.depth_percentage).toBe(25);
      expect(scrollEvents[2].props.depth_percentage).toBe(75);
    });
  });

  describe('Mobile App Tracking', () => {
    it('should track mobile-specific interactions', () => {
      // Simulate mobile environment
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        writable: true,
        configurable: true
      });

      Object.defineProperty(screen, 'width', {
        value: 375,
        writable: true,
        configurable: true
      });

      init({ site: 'mobile_app', endpoint: '/api/analytics', mode: 'production' });

      // App session start
      track('app_session_start', {
        platform: 'ios',
        app_version: '2.1.0'
      });

      // Touch interactions
      track('button_pressed', {
        button_type: 'primary',
        interaction_type: 'touch'
      });

      // Swipe gestures
      track('swipe_gesture', {
        direction: 'left',
        screen: 'product_gallery'
      });

      // Device orientation
      track('orientation_changed', {
        from: 'portrait',
        to: 'landscape'
      });

      // Push notification
      track('push_notification_received', {
        type: 'promotional',
        clicked: true
      });

      expect(mockFetch).toHaveBeenCalledTimes(5);

      // Verify mobile-specific data
      const events = mockFetch.mock.calls.map(call => JSON.parse(call[1].body));
      for (const event of events) {
        expect(event.device.userAgent).toContain('iPhone');
        expect(event.device.screenWidth).toBe(375);
      }
    });
  });

  describe('Error and Performance Tracking', () => {
    it('should track JavaScript errors and performance issues', () => {
      init({ site: 'app', endpoint: '/api/analytics', mode: 'production' });

      // JavaScript error
      track('javascript_error', {
        error_message: 'Cannot read property of undefined',
        error_stack: 'TypeError: Cannot read property...',
        page_url: '/dashboard',
        user_agent: navigator.userAgent
      });

      // Slow API response
      track('api_slow_response', {
        endpoint: '/api/users',
        response_time: 5000,
        timeout_threshold: 3000
      });

      // Large bundle detected
      track('performance_issue', {
        issue_type: 'large_bundle',
        bundle_size: 2500000, // 2.5MB
        load_time: 8000
      });

      // Memory usage spike
      track('memory_warning', {
        memory_used: 150000000, // 150MB
        memory_limit: 100000000, // 100MB
        device_type: 'mobile'
      });

      expect(mockFetch).toHaveBeenCalledTimes(4);

      // Verify error tracking data structure
      const errorEvent = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(errorEvent.event).toBe('javascript_error');
      expect(errorEvent.props.error_message).toBeDefined();
      expect(errorEvent.props.page_url).toBeDefined();
    });
  });

  describe('Advanced User Journey Features (0.6.0)', () => {
    it('should track user journey with identify calls', () => {
      init({ site: 'app', endpoint: '/api/analytics', mode: 'production' });

      // Anonymous user starts journey
      track('page_view', { page: 'landing' });

      // User signs up
      track('signup_completed', { method: 'email' });

      // User becomes identified
      track('identify', { userId: 'user_123', email: 'user@example.com' });

      // Continued journey as identified user
      track('feature_used', { feature: 'dashboard' });
      track('upgrade_viewed', { plan: 'pro' });

      expect(mockFetch).toHaveBeenCalledTimes(5);

      const events = mockFetch.mock.calls.map(call => JSON.parse(call[1].body));

      // All events should share same session
      const sessionIds = events.map(e => e.sessionId);
      const uniqueSessionIds = [...new Set(sessionIds)];
      expect(uniqueSessionIds).toHaveLength(1);

      // Identify event should have user info
      const identifyEvent = events.find(e => e.event === 'identify');
      expect(identifyEvent?.props).toMatchObject({
        userId: 'user_123',
        email: 'user@example.com'
      });
    });

    it('should handle route computation for SPAs', () => {
      // This would be tested more thoroughly in route computation tests
      // but here we verify it works in user journey context
      init({ site: 'spa', endpoint: '/api/analytics', mode: 'production' });

      // Simulate SPA navigation
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://spa.com/user/123/settings',
          pathname: '/user/123/settings',
          hostname: 'spa.com'
        },
        writable: true,
        configurable: true
      });

      track('spa_navigation', {
        from: '/dashboard',
        to: '/user/123/settings',
        route_pattern: '/user/[id]/settings'
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      const event = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(event.props.route_pattern).toBe('/user/[id]/settings');
    });
  });
}); 