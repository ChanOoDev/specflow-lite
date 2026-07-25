'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * GoatCounter analytics.
 *
 * To enable, set NEXT_PUBLIC_GOATCOUNTER_CODE in your .env.local:
 *   NEXT_PUBLIC_GOATCOUNTER_CODE=your-goatcounter-code
 *
 * Sign up at https://www.goatcounter.com
 */
const GOATCOUNTER_CODE = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE;

declare global {
  interface Window {
    goatcounter?: { count: (vars?: Record<string, string>) => void };
  }
}

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GOATCOUNTER_CODE) return;

    // Load the GoatCounter script once
    if (!document.querySelector('script[data-goatcounter]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://gc.zgo.at/count.js`;
      script.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
      document.head.appendChild(script);
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (!GOATCOUNTER_CODE) return;
    if (typeof window.goatcounter?.count === 'function') {
      window.goatcounter.count();
    }
  }, [pathname]);

  return null;
}
