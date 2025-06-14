import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AnimatedButton } from './animated-components';
import { GlassCard } from './glass-components';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
          <GlassCard className="max-w-md w-full text-center p-8">
            <div className="w-20 h-20 mx-auto mb-6 text-red-500">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Oops! Something went wrong
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an unexpected error. Don't worry, our team has been notified.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-auto max-h-32 text-red-600 dark:text-red-400">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <AnimatedButton
                variant="primary"
                onClick={this.handleRetry}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                Try Again
              </AnimatedButton>
              
              <AnimatedButton
                variant="secondary"
                onClick={this.handleReload}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                }
              >
                Reload Page
              </AnimatedButton>
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Simple Error Fallback Component
export const SimpleErrorFallback: React.FC<{
  error?: Error;
  resetError?: () => void;
  message?: string;
}> = ({ error, resetError, message = "Something went wrong" }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 text-gray-400 mb-4">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
    </div>
    
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {message}
    </h3>
    
    <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
      {error?.message || "An unexpected error occurred while loading this component."}
    </p>
    
    {resetError && (
      <AnimatedButton variant="secondary" onClick={resetError} size="sm">
        Try Again
      </AnimatedButton>
    )}
  </div>
);

// Network Error Component
export const NetworkErrorFallback: React.FC<{
  onRetry?: () => void;
}> = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 text-gray-400 mb-4">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" 
        />
      </svg>
    </div>
    
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
      Connection Problem
    </h3>
    
    <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
      Unable to connect to the server. Please check your internet connection and try again.
    </p>
    
    {onRetry && (
      <AnimatedButton variant="primary" onClick={onRetry} size="sm">
        Retry Connection
      </AnimatedButton>
    )}
  </div>
);