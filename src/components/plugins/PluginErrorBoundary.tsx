
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { pluginSafetyManager } from '@/services/pluginSafetyManager';

interface Props {
  children: ReactNode;
  pluginId: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class PluginErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Plugin error boundary caught an error:', error, errorInfo);
    pluginSafetyManager.recordPluginError(this.props.pluginId, error);
  }

  handleRetry = () => {
    pluginSafetyManager.clearPluginErrors(this.props.pluginId);
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Alert variant="destructive" className="m-4">
          <AlertDescription className="space-y-2">
            <p>Plugin "{this.props.pluginId}" encountered an error.</p>
            <p className="text-sm text-gray-600">
              Error: {this.state.error?.message}
            </p>
            <Button 
              onClick={this.handleRetry}
              variant="outline"
              size="sm"
            >
              Retry Plugin
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default PluginErrorBoundary;
