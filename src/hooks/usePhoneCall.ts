import { useCallback } from 'react';

// Shared phone call hook
export const usePhoneCall = () => {
  return useCallback((phone: string) => {
    if (!phone) {
      console.warn('No phone number provided');
      return;
    }
    
    // Clean the phone number
    const cleanedPhone = phone.replace(/\D/g, '');
    
    // Open phone dialer
    window.open(`tel:${cleanedPhone}`, '_self');
  }, []);
};