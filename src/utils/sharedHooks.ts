import { useToast } from '@/hooks/use-toast';
import { useCallback, useState } from 'react';

/**
 * Shared utility for handling API errors consistently across hooks
 */
export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback((error: any, title: string) => {
    console.error(title, error);
    
    // Don't show toast for network errors to prevent spam
    if (!error.message?.includes('Load failed')) {
      toast({
        title,
        description: error.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    }
  }, [toast]);

  return { handleError };
};

/**
 * Shared loading state logic for data fetching hooks
 */
export const useLoadingState = () => {
  const [loading, setLoading] = useState(true);

  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);

  return { loading, startLoading, stopLoading };
};