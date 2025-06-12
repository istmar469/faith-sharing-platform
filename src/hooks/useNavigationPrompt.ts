import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation, NavigateOptions } from 'react-router-dom';

interface UseNavigationPromptOptions {
  when: boolean;
  message?: string;
}

/**
 * Hook to warn users before navigating within the app when there are unsaved changes
 * This complements useBeforeUnload by handling in-app navigation
 * @param when - Boolean condition for when to show the warning (e.g., isDirty)
 * @param message - Custom warning message
 */
export function useNavigationPrompt({ when, message }: UseNavigationPromptOptions) {
  const navigate = useNavigate();
  const location = useLocation();

  const confirmNavigation = useCallback(() => {
    if (when) {
      const confirmationMessage = message || 'You have unsaved changes. Are you sure you want to leave?';
      return window.confirm(confirmationMessage);
    }
    return true;
  }, [when, message]);

  // Create a navigation function that checks for unsaved changes
  const navigateWithConfirmation = useCallback((to: string | number, options?: NavigateOptions) => {
    if (when) {
      const confirmationMessage = message || 'You have unsaved changes. Are you sure you want to leave?';
      if (window.confirm(confirmationMessage)) {
        if (typeof to === 'number') {
          navigate(to);
        } else {
          navigate(to, options);
        }
      }
    } else {
      if (typeof to === 'number') {
        navigate(to);
      } else {
        navigate(to, options);
      }
    }
  }, [navigate, when, message]);

  // Override browser back/forward behavior
  useEffect(() => {
    if (when) {
      const handlePopState = (event: PopStateEvent) => {
        if (!confirmNavigation()) {
          // Prevent the navigation by pushing the current state back
          window.history.pushState(null, '', location.pathname + location.search);
        }
      };

      window.addEventListener('popstate', handlePopState);
      
      // Push a state to detect back button usage
      window.history.pushState(null, '', location.pathname + location.search);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [when, confirmNavigation, location]);

  return {
    navigateWithConfirmation,
    confirmNavigation
  };
}

export default useNavigationPrompt; 