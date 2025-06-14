import React from 'react';
import { cn } from '@/lib/utils';

// Battery-themed Background Gradients
export const BatteryGradientBackground: React.FC<{
  children: React.ReactNode;
  variant?: 'charge' | 'energy' | 'power' | 'eco' | 'tech';
  className?: string;
  animated?: boolean;
}> = ({ children, variant = 'charge', className, animated = false }) => {
  const gradients = {
    charge: "bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700",
    energy: "bg-gradient-to-br from-green-400 via-blue-500 to-purple-600",
    power: "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600",
    eco: "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600",
    tech: "bg-gradient-to-br from-gray-700 via-blue-800 to-indigo-900"
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        gradients[variant],
        animated && "bg-[length:200%_200%] animate-gradient-shift",
        className
      )}
    >
      {/* Animated Background Pattern */}
      {animated && (
        <>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white rounded-full blur-2xl animate-pulse delay-1000" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        </>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Status-based Gradient Cards
export const StatusGradientCard: React.FC<{
  children: React.ReactNode;
  status: 'available' | 'assigned' | 'maintenance' | 'charging' | 'low';
  className?: string;
}> = ({ children, status, className }) => {
  const statusGradients = {
    available: "bg-gradient-to-r from-green-400 to-emerald-500",
    assigned: "bg-gradient-to-r from-blue-400 to-indigo-500",
    maintenance: "bg-gradient-to-r from-orange-400 to-red-500",
    charging: "bg-gradient-to-r from-yellow-400 to-green-500",
    low: "bg-gradient-to-r from-red-400 to-pink-500"
  };

  return (
    <div
      className={cn(
        "p-4 rounded-xl text-white shadow-lg transition-all duration-300",
        "hover:shadow-xl hover:scale-105",
        statusGradients[status],
        className
      )}
    >
      {children}
    </div>
  );
};

// Animated Battery Level Indicator
export const BatteryLevelGradient: React.FC<{
  level: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showPercentage?: boolean;
}> = ({ level, size = 'md', animated = true, showPercentage = true }) => {
  const sizes = {
    sm: "w-16 h-8",
    md: "w-24 h-12",
    lg: "w-32 h-16"
  };

  const getGradient = (level: number) => {
    if (level >= 70) return "from-green-400 to-green-600";
    if (level >= 40) return "from-yellow-400 to-orange-500";
    return "from-red-400 to-red-600";
  };

  return (
    <div className={cn("relative", sizes[size])}>
      {/* Battery Shell */}
      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 relative overflow-hidden">
        {/* Battery Fill */}
        <div
          className={cn(
            "h-full bg-gradient-to-r transition-all duration-1000 ease-out",
            getGradient(level),
            animated && "animate-pulse"
          )}
          style={{ width: `${level}%` }}
        />
        
        {/* Charging Animation */}
        {animated && level < 100 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-right" />
        )}
      </div>
      
      {/* Battery Terminal */}
      <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-1/3 bg-gray-400 dark:bg-gray-500 rounded-r" />
      
      {/* Percentage */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
          {level}%
        </div>
      )}
    </div>
  );
};

// Gradient Icon Wrapper
export const GradientIcon: React.FC<{
  children: React.ReactNode;
  gradient?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ children, gradient = 'primary', size = 'md', className }) => {
  const gradients = {
    primary: "bg-gradient-to-br from-blue-500 to-purple-600",
    success: "bg-gradient-to-br from-green-500 to-emerald-600",
    warning: "bg-gradient-to-br from-yellow-500 to-orange-600",
    danger: "bg-gradient-to-br from-red-500 to-pink-600"
  };

  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center text-white shadow-lg",
        "transition-all duration-300 hover:shadow-xl hover:scale-110",
        gradients[gradient],
        sizes[size],
        className
      )}
    >
      {children}
    </div>
  );
};