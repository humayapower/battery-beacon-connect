import { useEffect } from 'react';
import { AutoSchedulingService } from '@/services/AutoSchedulingService';

const DAILY_CHECK_KEY = 'last_daily_check_date';

export const useAutoScheduling = () => {
  
  useEffect(() => {
    // Perform daily check when app loads
    checkAndRunDailyTasks();
  }, []);
  
  const checkAndRunDailyTasks = async () => {
    try {
      const today = new Date().toDateString();
      const lastCheckDate = localStorage.getItem(DAILY_CHECK_KEY);
      
      // Only run if we haven't checked today
      if (lastCheckDate !== today) {
        console.log('🔄 Running daily auto-scheduling check...');
        
        const result = await AutoSchedulingService.performDailyStatusCheck();
        
        if (result.success) {
          // Store today's date to prevent multiple runs
          localStorage.setItem(DAILY_CHECK_KEY, today);
          console.log('✅ Daily check completed successfully');
        }
      } else {
        console.log('✅ Daily check already completed today');
      }
    } catch (error) {
      console.error('❌ Error in daily check:', error);
    }
  };
  
  const scheduleEMIPayments = async (
    customerId: string,
    totalAmount: number,
    downPayment: number,
    emiCount: number,
    joinDate: string
  ) => {
    return await AutoSchedulingService.scheduleEMIPayments(
      customerId,
      totalAmount,
      downPayment,
      emiCount,
      joinDate
    );
  };
  
  const scheduleRentalPayments = async (
    customerId: string,
    monthlyRent: number,
    joinDate: string
  ) => {
    return await AutoSchedulingService.scheduleRentalPayments(
      customerId,
      monthlyRent,
      joinDate
    );
  };
  
  const forceRunDailyCheck = async () => {
    // Force run daily check (useful for testing)
    localStorage.removeItem(DAILY_CHECK_KEY);
    return await checkAndRunDailyTasks();
  };
  
  return {
    scheduleEMIPayments,
    scheduleRentalPayments,
    forceRunDailyCheck
  };
};