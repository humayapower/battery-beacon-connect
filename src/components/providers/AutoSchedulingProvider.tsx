import React from 'react';
import { useAutoScheduling } from '@/hooks/useAutoScheduling';

interface AutoSchedulingProviderProps {
  children: React.ReactNode;
}

export const AutoSchedulingProvider: React.FC<AutoSchedulingProviderProps> = ({ children }) => {
  // This will automatically run daily checks when the app loads
  useAutoScheduling();
  
  return <>{children}</>;
};