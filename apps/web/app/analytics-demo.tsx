'use client';

import { track } from '@better-analytics/next';
import { Button } from '@repo/ui/button';
import styles from './page.module.css';

export function AnalyticsDemo() {
  const handleButtonClick = (buttonName: string) => {
    track('button_click', {
      button: buttonName,
      section: 'demo',
      timestamp: Date.now(),
    });
  };

  const handleCustomEvent = () => {
    track('custom_event', {
      action: 'demo_interaction',
      value: Math.random(),
      user_engaged: true,
    });
  };

  return (
    <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>🚀 Better Analytics Demo</h3>
      <p>Click these buttons to see analytics events in the browser console:</p>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <Button 
          onClick={() => handleButtonClick('signup')}
          className={styles.primary}
        >
          Track Signup Click
        </Button>
        
        <Button 
          onClick={() => handleButtonClick('login')}
          className={styles.secondary}
        >
          Track Login Click
        </Button>
        
        <Button 
          onClick={handleCustomEvent}
          className={styles.secondary}
        >
          Track Custom Event
        </Button>
      </div>
      
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
        💡 Open your browser's developer console and the terminal to see the events being tracked!
      </p>
    </div>
  );
} 