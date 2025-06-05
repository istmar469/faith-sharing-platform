import React, { Component, ReactNode } from 'react';

interface SafeDragWrapperProps {
  children: ReactNode;
}

interface SafeDragWrapperState {
  hasError: boolean;
  error?: Error;
}

class SafeDragWrapper extends Component<SafeDragWrapperProps, SafeDragWrapperState> {
  constructor(props: SafeDragWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SafeDragWrapperState {
    // Check if it's a collision detection error
    if (error.message.includes('toString') || 
        error.message.includes('Cannot read properties of undefined') ||
        error.message.includes('collision')) {
      console.warn('Drag collision error caught and handled:', error);
      return { hasError: true, error };
    }
    // For other errors, let them bubble up
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('SafeDragWrapper caught error:', error, errorInfo);
    
    // Auto-recover after a short delay
    setTimeout(() => {
      this.setState({ hasError: false, error: undefined });
    }, 100);
  }

  render() {
    if (this.state.hasError) {
      // Render children normally but with error protection
      return (
        <div 
          style={{ 
            position: 'relative',
            minHeight: '100%',
            pointerEvents: 'auto'
          }}
          onDragStart={(e) => {
            // Prevent problematic drag operations
            try {
              e.dataTransfer?.setData('text/plain', JSON.stringify({ safe: true }));
            } catch (error) {
              console.warn('Drag start error prevented:', error);
              e.preventDefault();
            }
          }}
        >
          {this.props.children}
        </div>
      );
    }

    return this.props.children;
  }
}

export default SafeDragWrapper; 