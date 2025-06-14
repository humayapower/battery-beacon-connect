import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Touch-Friendly Button with Minimum 44px Target
export const TouchButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', size = 'md', className, disabled }) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg active:shadow-md",
    secondary: "bg-white border border-gray-300 text-gray-700 shadow-sm active:shadow-sm",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200"
  };

  const sizes = {
    sm: "min-h-[44px] px-4 text-sm",
    md: "min-h-[48px] px-6 text-base",
    lg: "min-h-[52px] px-8 text-lg"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-xl font-semibold transition-all duration-200",
        "touch-manipulation select-none", // Important for mobile
        "active:scale-95 transform",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
};

// Swipe-to-Delete Component
export const SwipeToDelete: React.FC<{
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
  deleteThreshold?: number;
}> = ({ children, onDelete, className, deleteThreshold = 100 }) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diffX = startX - currentX;
    
    if (diffX > 0) { // Only allow left swipe
      setTranslateX(-diffX);
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(translateX) >= deleteThreshold) {
      setIsDeleting(true);
      setTimeout(() => {
        onDelete();
      }, 300);
    } else {
      setTranslateX(0);
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)} ref={containerRef}>
      {/* Delete Background */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6">
        <span className="text-white font-semibold">Delete</span>
      </div>
      
      {/* Content */}
      <div
        className={cn(
          "bg-white dark:bg-gray-900 transition-transform duration-300",
          isDeleting && "translate-x-full opacity-0"
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

// Pull-to-Refresh Component
export const PullToRefresh: React.FC<{
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshThreshold?: number;
  className?: string;
}> = ({ children, onRefresh, refreshThreshold = 100, className }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [canPull, setCanPull] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop === 0) {
      setCanPull(true);
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!canPull) return;
    
    const currentY = e.touches[0].clientY;
    const diffY = currentY - startY;
    
    if (diffY > 0) {
      e.preventDefault();
      setPullDistance(Math.min(diffY, refreshThreshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= refreshThreshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    setCanPull(false);
  };

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-transform duration-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white"
        style={{ 
          transform: `translateY(${pullDistance - 60}px)`,
          height: '60px'
        }}
      >
        {isRefreshing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Refreshing...</span>
          </div>
        ) : (
          <span className="text-sm font-medium">
            {pullDistance >= refreshThreshold ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        )}
      </div>
      
      {/* Content */}
      <div 
        className="transition-transform duration-300"
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        {children}
      </div>
    </div>
  );
};

// Bottom Navigation Bar
export const BottomNavigation: React.FC<{
  items: Array<{
    icon: React.ReactNode;
    label: string;
    href?: string;
    onClick?: () => void;
    badge?: number;
    active?: boolean;
  }>;
  className?: string;
}> = ({ items, className }) => {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
        "border-t border-gray-200 dark:border-gray-700",
        "px-4 py-2 safe-area-inset-bottom",
        className
      )}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg",
              "min-h-[56px] min-w-[56px] transition-all duration-200",
              "active:scale-95 transform touch-manipulation",
              item.active 
                ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            <div className="relative">
              {item.icon}
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-xs font-medium truncate max-w-[60px]">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// Mobile Breadcrumb
export const MobileBreadcrumb: React.FC<{
  items: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
  }>;
  className?: string;
}> = ({ items, className }) => {
  return (
    <nav className={cn("flex items-center space-x-2 p-4", className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-gray-400 text-sm">/</span>
          )}
          <button
            onClick={item.onClick}
            className={cn(
              "text-sm font-medium transition-colors touch-manipulation",
              "min-h-[44px] px-2 py-1 rounded",
              index === items.length - 1
                ? "text-gray-900 dark:text-gray-100"
                : "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            )}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

// Haptic Feedback Hook
export const useHapticFeedback = () => {
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'selection' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50],
        selection: [5]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  return { triggerHaptic };
};