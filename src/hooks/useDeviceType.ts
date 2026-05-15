import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the user is on a mobile device or desktop.
 * Breakpoint: 768px (Standard Tablet/Mobile threshold)
 */
export function useDeviceType() {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, deviceType: isMobile ? 'mobile' : 'desktop' };
}
