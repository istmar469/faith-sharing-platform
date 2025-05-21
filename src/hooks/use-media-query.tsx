
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (for SSR)
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      // Set initial value
      setMatches(media.matches);

      // Define listener function
      const listener = () => setMatches(media.matches);
      
      // Add event listener
      media.addEventListener("change", listener);
      
      // Clean up
      return () => media.removeEventListener("change", listener);
    }
    
    return undefined;
  }, [query]); // Only re-run if query changes

  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 768px)");
}
