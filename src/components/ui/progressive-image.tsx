import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallback?: React.ReactNode;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  placeholder,
  className,
  blurDataURL,
  onLoad,
  onError,
  fallback
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  // Generate blur placeholder if not provided
  const defaultBlurDataURL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+";

  if (imageError && fallback) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Blur Placeholder */}
      {!imageLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
          style={{
            backgroundImage: `url(${blurDataURL || placeholder || defaultBlurDataURL})`,
            filter: 'blur(10px)',
            transform: 'scale(1.1)' // Prevent blur edges
          }}
        />
      )}

      {/* Skeleton Loader */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}

      {/* Main Image */}
      {inView && !imageError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Error State */}
      {imageError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Failed to load image</p>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {inView && !imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

// Avatar with Progressive Loading
export const ProgressiveAvatar: React.FC<{
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}> = ({ src, alt, size = 'md', fallback, className }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const getFallbackContent = () => {
    if (fallback) return fallback;
    return alt.charAt(0).toUpperCase();
  };

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600",
        "flex items-center justify-center text-white font-semibold",
        sizes[size],
        className
      )}
    >
      {src ? (
        <ProgressiveImage
          src={src}
          alt={alt}
          className="w-full h-full"
          fallback={
            <span className="text-white font-semibold">
              {getFallbackContent()}
            </span>
          }
        />
      ) : (
        <span>{getFallbackContent()}</span>
      )}
    </div>
  );
};

// Optimized Image Gallery
export const ImageGallery: React.FC<{
  images: Array<{
    src: string;
    alt: string;
    thumbnail?: string;
  }>;
  className?: string;
  columns?: number;
  onImageClick?: (index: number) => void;
}> = ({ images, className, columns = 3, onImageClick }) => {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
        columns === 4 && "grid-cols-4",
        className
      )}
    >
      {images.map((image, index) => (
        <button
          key={index}
          onClick={() => onImageClick?.(index)}
          className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200"
        >
          <ProgressiveImage
            src={image.thumbnail || image.src}
            alt={image.alt}
            className="w-full h-full cursor-pointer"
          />
        </button>
      ))}
    </div>
  );
};