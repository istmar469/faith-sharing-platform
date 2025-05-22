
import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LoadingStateProps {
  message?: string;
  timeout?: number; // Timeout in milliseconds
  onRetry?: () => void;
  routeInfo?: string; // Add route information
  errorDetails?: string; // Add more detailed error info
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading data...",
  timeout = 5000, // Reduced timeout for faster feedback
  onRetry,
  routeInfo,
  errorDetails
}) => {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [timeoutTime, setTimeoutTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimedOut(true);
      setTimeoutTime(new Date());
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

  // Get the current route for better debugging
  const currentRoute = window.location.pathname;
  const currentSearch = window.location.search;
  const fullRoute = currentSearch ? `${currentRoute}${currentSearch}` : currentRoute;

  if (isTimedOut) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary-light to-primary-dark">
        <div className="p-8 rounded-lg bg-white/10 backdrop-blur-sm max-w-md">
          <Alert variant="destructive" className="mb-4 bg-white/20 border-amber-300">
            <AlertCircle className="h-5 w-5 text-amber-300" />
            <AlertTitle className="text-white text-lg font-semibold">Loading Timeout</AlertTitle>
            <AlertDescription className="text-white/90">
              The request is taking longer than expected. This could be due to network issues or server load.
              {routeInfo && (
                <p className="mt-2 text-sm">
                  <strong>Route:</strong> {routeInfo || fullRoute}
                </p>
              )}
              {errorDetails && (
                <p className="mt-1 text-sm">
                  <strong>Details:</strong> {errorDetails}
                </p>
              )}
              {timeoutTime && (
                <p className="mt-1 text-xs">
                  Timeout occurred at: {timeoutTime.toLocaleTimeString()}
                </p>
              )}
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
                Retry Request
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleHardRefresh}
              className="w-full bg-white/10 text-white hover:bg-white/20"
            >
              Hard Refresh Page
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full bg-white/10 text-white hover:bg-white/20"
            >
              Return to Home
            </Button>
          </div>
          
          <p className="mt-4 text-xs text-white/70 text-center">
            Try signing out and back in, or check your network connection.
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
          <p className="text-white/70 text-xs mt-2 text-center">Loading route: {routeInfo || fullRoute}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
