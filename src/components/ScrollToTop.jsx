import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component - scrolls to top on every route change
 * This ensures pages always start at the top when navigating
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top instantly when route changes
    window.scrollTo(0, 0);
    
    // Also try scrolling the main content container if it exists
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo(0, 0);
    }
    
    // And the layout container
    const layoutContainer = document.getElementById('main-scroll-container');
    if (layoutContainer) {
      layoutContainer.scrollTo(0, 0);
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}

