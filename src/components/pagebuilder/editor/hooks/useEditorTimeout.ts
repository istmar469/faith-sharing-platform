
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseEditorTimeoutProps {
  isEditorReady: boolean;
  onFallback: () => void;
  onReady?: () => void;
  debugId: string;
}

export const useEditorTimeout = ({
  isEditorReady,
  onFallback,
  onReady,
  debugId
}: UseEditorTimeoutProps) => {
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isEditorReady) {
      console.log(`⏹️ ${debugId}: Editor ready, skipping timeout setup`);
      return;
    }

    console.log(`⏰ ${debugId}: Setting up editor initialization timeout (3 seconds with auto-fallback)`);
    
    // Reduced timeout for faster fallback
    initTimeoutRef.current = setTimeout(() => {
      console.error(`⏰ ${debugId}: Editor initialization timeout after 3 seconds - switching to fallback`);
      onFallback();
      onReady?.(); // Call onReady to prevent UI from getting stuck
      toast.error("Using simple editor - advanced editor timed out");
    }, 3000);
    
    return () => {
      console.log(`🧹 ${debugId}: Clearing editor timeout`);
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
    };
  }, [isEditorReady, onFallback, onReady, debugId]);

  const clearEditorTimeout = () => {
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
  };

  return { clearTimeout: clearEditorTimeout };
};
