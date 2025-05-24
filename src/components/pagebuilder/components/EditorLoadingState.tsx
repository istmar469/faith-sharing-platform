
import React from 'react';
import PageBuilderLoading from './PageBuilderLoading';

interface EditorLoadingStateProps {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  onUseFallback?: () => void;
}

const EditorLoadingState: React.FC<EditorLoadingStateProps> = ({
  message = "Initializing Editor...",
  showRetry = false,
  onRetry,
  onUseFallback
}) => {
  return (
    <PageBuilderLoading 
      message={message}
      showActions={showRetry}
      onForceRefresh={onRetry}
      onStartFresh={onUseFallback}
    />
  );
};

export default EditorLoadingState;
