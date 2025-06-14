import React from 'react';
import { cn } from '@/lib/utils';

// Base Skeleton Component
export const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]",
      className
    )}
    {...props}
  />
));
Skeleton.displayName = "Skeleton";

// Card Skeleton Component
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("glass-card p-4 sm:p-6 space-y-4", className)}>
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  </div>
);

// Table Skeleton Component
export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-4">
    {/* Table Header */}
    <div className="flex space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Table Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 p-4 border-b border-gray-200 dark:border-gray-700">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// Battery Card Skeleton
export const SkeletonBatteryCard: React.FC = () => (
  <div className="glass-card p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <div className="flex items-center justify-between">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-28" />
    </div>
  </div>
);

// Metrics Card Skeleton
export const SkeletonMetricsCard: React.FC = () => (
  <div className="glass-card p-4 text-center space-y-3">
    <Skeleton className="h-8 w-8 rounded-xl mx-auto" />
    <Skeleton className="h-6 w-16 mx-auto" />
    <Skeleton className="h-3 w-20 mx-auto" />
  </div>
);

// Page Loading Component
export const PageSkeleton: React.FC<{ type?: 'dashboard' | 'table' | 'form' }> = ({ 
  type = 'dashboard' 
}) => {
  if (type === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonMetricsCard key={i} />
          ))}
        </div>
        
        {/* Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonMetricsCard key={i} />
          ))}
        </div>
        
        {/* Table */}
        <div className="glass-card">
          <SkeletonTable />
        </div>
      </div>
    );
  }

  return <SkeletonCard />;
};

// Loading Button
export const LoadingButton: React.FC<{ 
  children: React.ReactNode; 
  loading?: boolean;
  className?: string;
}> = ({ children, loading = false, className = "" }) => (
  <button 
    disabled={loading}
    className={cn(
      "relative overflow-hidden transition-all duration-200",
      loading && "cursor-not-allowed opacity-70",
      className
    )}
  >
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )}
    <span className={loading ? "opacity-0" : "opacity-100"}>
      {children}
    </span>
  </button>
);