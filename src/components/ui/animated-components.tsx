import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';
import { Button } from './button';

// Animated Button with Micro-interactions
export const AnimatedButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
  }
>(({ className, variant = 'primary', size = 'md', loading, icon, children, ...props }, ref) => {
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm hover:shadow-md",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
    destructive: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs h-8",
    md: "px-4 py-2 text-sm h-10",
    lg: "px-6 py-3 text-base h-12"
  };

  return (
    <button
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 transform",
        "hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        variants[variant],
        sizes[size],
        isPressed && "scale-95",
        className
      )}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      disabled={loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <span className={cn("flex items-center gap-2", loading && "opacity-0")}>
        {icon}
        {children}
      </span>
    </button>
  );
});
AnimatedButton.displayName = "AnimatedButton";

// Animated Badge with Status Colors
export const AnimatedBadge: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  animate?: boolean;
  pulse?: boolean;
  className?: string;
}> = ({ children, variant = 'default', animate = true, pulse = false, className }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        "transition-all duration-200",
        animate && "hover:scale-105 transform",
        pulse && "animate-pulse",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

// Animated Card with Hover Effects
export const AnimatedCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}> = ({ children, className, hoverable = true, onClick }) => {
  return (
    <div
      className={cn(
        "glass-card transition-all duration-300",
        hoverable && "hover:shadow-2xl hover:scale-[1.02] cursor-pointer",
        "transform-gpu will-change-transform",
        onClick && "active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Floating Action Button
export const FloatingActionButton: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
  ariaLabel?: string;
}> = ({ 
  icon, 
  onClick, 
  position = 'bottom-right', 
  className,
  ariaLabel = "Floating action"
}) => {
  const positions = {
    'bottom-right': "bottom-6 right-6",
    'bottom-left': "bottom-6 left-6",
    'top-right': "top-6 right-6",
    'top-left': "top-6 left-6"
  };

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "fixed z-50 w-14 h-14 rounded-full shadow-lg",
        "bg-gradient-to-r from-blue-600 to-purple-600",
        "hover:from-blue-700 hover:to-purple-700",
        "text-white flex items-center justify-center",
        "transition-all duration-300 transform",
        "hover:scale-110 active:scale-95",
        "focus:outline-none focus:ring-4 focus:ring-blue-300",
        positions[position],
        className
      )}
    >
      {icon}
    </button>
  );
};

// Battery Charging Animation
export const BatteryChargingIcon: React.FC<{
  percentage?: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}> = ({ percentage = 50, size = 'md', animated = true }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={cn("relative", sizes[size])}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full"
      >
        {/* Battery Outline */}
        <rect
          x="3"
          y="6"
          width="16"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        {/* Battery Terminal */}
        <rect
          x="19"
          y="9"
          width="2"
          height="6"
          rx="1"
          fill="currentColor"
        />
        {/* Battery Fill */}
        <rect
          x="5"
          y="8"
          width={`${(percentage / 100) * 12}`}
          height="8"
          rx="1"
          fill="currentColor"
          className={animated ? "transition-all duration-1000 ease-in-out" : ""}
        />
        {/* Charging Bolt */}
        {animated && (
          <path
            d="M12 2L8 12h4l0 8l4-10h-4z"
            fill="white"
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
};

// Ripple Effect Component
export const RippleButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className }) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    onClick?.();
  };

  return (
    <button
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
      onClick={handleClick}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
    </button>
  );
};