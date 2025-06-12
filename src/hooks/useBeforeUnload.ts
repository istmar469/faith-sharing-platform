import { useEffect, useRef } from 'react';

interface UseBeforeUnloadOptions {
  when: boolean;
  message?: string;
}

/**
 * Hook to warn users before they leave the page/refresh when there are unsaved changes
 * @param when - Boolean condition for when to show the warning (e.g., isDirty)
 * @param message - Custom warning message (optional, browser may override)
 */
export function useBeforeUnload({ when, message }: UseBeforeUnloadOptions) {
  const messageRef = useRef(message);
  
  // Update message ref when it changes
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (when) {
        // Standard way to trigger browser's leave confirmation
        event.preventDefault();
        
        // Some browsers use returnValue, others use the return value
        const confirmationMessage = messageRef.current || 'You have unsaved changes. Are you sure you want to leave?';
        event.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    };

    // Add the event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [when]);
}

export default useBeforeUnload; 