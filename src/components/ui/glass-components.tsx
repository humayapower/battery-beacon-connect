import React from 'react';
import { cn } from '@/lib/utils';

// Glass Card Variants
export const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'intense' | 'subtle' | 'colored';
  hover?: boolean;
}> = ({ children, className, variant = 'default', hover = true }) => {
  const variants = {
    default: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30",
    intense: "bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/30 dark:border-gray-600/40",
    subtle: "bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border border-white/10 dark:border-gray-800/20",
    colored: "bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-xl border border-blue-200/30 dark:border-blue-700/30"
  };

  return (
    <div
      className={cn(
        "rounded-2xl shadow-xl transition-all duration-300",
        variants[variant],
        hover && "hover:shadow-2xl hover:scale-[1.01] hover:bg-opacity-90",
        className
      )}
    >
      {children}
    </div>
  );
};

// Glass Modal/Sheet
export const GlassModal: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}> = ({ children, isOpen, onClose, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div
        className={cn(
          "relative max-w-lg w-full mx-4 p-6 rounded-2xl",
          "bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl",
          "border border-white/20 dark:border-gray-700/30",
          "shadow-2xl transform transition-all duration-300",
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

// Glass Navigation Bar
export const GlassNavbar: React.FC<{
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}> = ({ children, className, sticky = true }) => {
  return (
    <nav
      className={cn(
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl",
        "border-b border-white/20 dark:border-gray-700/30",
        "shadow-lg transition-all duration-300",
        sticky && "sticky top-0 z-40",
        className
      )}
    >
      {children}
    </nav>
  );
};

// Glass Bottom Sheet for Mobile
export const GlassBottomSheet: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}> = ({ children, isOpen, onClose, className }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Bottom Sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300",
          "bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl",
          "border-t border-white/20 dark:border-gray-700/30",
          "rounded-t-3xl shadow-2xl",
          isOpen ? "translate-y-0" : "translate-y-full",
          className
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
};

// Glass Sidebar
export const GlassSidebar: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'left' | 'right';
}> = ({ children, className, variant = 'left' }) => {
  return (
    <aside
      className={cn(
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl",
        "border-r border-white/20 dark:border-gray-700/30",
        variant === 'right' && "border-r-0 border-l",
        "shadow-xl h-full",
        className
      )}
    >
      {children}
    </aside>
  );
};

// Glass Alert/Toast
export const GlassAlert: React.FC<{
  children: React.ReactNode;
  type?: 'success' | 'error' | 'warning' | 'info';
  className?: string;
}> = ({ children, type = 'info', className }) => {
  const typeStyles = {
    success: "border-green-300/30 bg-green-50/80 dark:bg-green-900/20 text-green-800 dark:text-green-200",
    error: "border-red-300/30 bg-red-50/80 dark:bg-red-900/20 text-red-800 dark:text-red-200",
    warning: "border-yellow-300/30 bg-yellow-50/80 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200",
    info: "border-blue-300/30 bg-blue-50/80 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
  };

  return (
    <div
      className={cn(
        "p-4 rounded-xl backdrop-blur-xl border shadow-lg",
        "transition-all duration-300 transform",
        typeStyles[type],
        className
      )}
    >
      {children}
    </div>
  );
};