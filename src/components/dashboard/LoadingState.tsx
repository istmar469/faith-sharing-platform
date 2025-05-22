
import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LoadingStateProps {
  message?: string;
  timeout?: number; // Timeout in milliseconds
  onRetry?: () => void;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading data...",
  timeout = 12000, // Reduced to 12s default timeout for better UX
  onRetry
}) => {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, retryCount]);
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    setIsTimedOut(false);
    setRetryCount(prev => prev + 1);
  };
  
  const handleHardRefresh = () => {
    // Force a full page reload
    window.location.reload();
  };

  if (isTimedOut) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary-light to-primary-dark">
        <div className="p-8 rounded-lg bg-white/10 backdrop-blur-sm max-w-md">
          <Alert variant="destructive" className="mb-4 bg-white/20 border-amber-300">
            <AlertCircle className="h-5 w-5 text-amber-300" />
            <AlertTitle className="text-white text-lg font-semibold">Loading Timeout</AlertTitle>
            <AlertDescription className="text-white/90">
              The authentication check is taking longer than expected. This may be due to database latency or connection issues.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            {onRetry && (
              <Button 
                variant="default"
                onClick={handleRetry}
                className="w-full flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Authentication Check
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleHardRefresh}
              className="w-full bg-white/10 text-white hover:bg-white/20"
            >
              Refresh Page
            </Button>
          </div>
          
          <p className="mt-4 text-xs text-white/70 text-center">
            If this issue persists, please try signing out and in again, or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary-light to-primary-dark">
      <div className="p-8 rounded-lg bg-white/10 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mb-3" />
          <span className="text-white font-medium text-center">{message}</span>
          <p className="text-white/70 text-xs mt-2 text-center">This may take a few moments...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
