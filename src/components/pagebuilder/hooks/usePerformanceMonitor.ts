
import { useEffect, useRef } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  const startTimeRef = useRef<number>(Date.now());
  const lastLogRef = useRef<number>(Date.now());

  const logTiming = (operation: string) => {
    const now = Date.now();
    const totalTime = now - startTimeRef.current;
    const sinceLastLog = now - lastLogRef.current;
    
    console.log(`[${componentName}] ${operation}: +${sinceLastLog}ms (total: ${totalTime}ms)`);
    lastLogRef.current = now;
  };

  useEffect(() => {
    logTiming('Component mounted');
    
    return () => {
      const totalTime = Date.now() - startTimeRef.current;
      console.log(`[${componentName}] Component unmounted after ${totalTime}ms`);
    };
  }, [componentName]);

  return { logTiming };
};
