import React, { useState } from 'react';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  fallbackSrc = null,
  aspectRatio = null,
  objectFit = 'cover',
  loading = 'lazy',
  sizes = '100vw',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const defaultFallback = (
    <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );

  const placeholder = (
    <div 
      className={`bg-gray-100 animate-pulse ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    />
  );

  if (!src || hasError) {
    return fallbackSrc ? (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        onError={handleError}
      />
    ) : (
      defaultFallback
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={aspectRatio ? { aspectRatio } : undefined}>
      {!isLoaded && placeholder}
      <img
        src={src}
        alt={alt}
        loading={loading}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${objectFit === 'cover' ? 'w-full h-full object-cover' : ''}
          ${objectFit === 'contain' ? 'w-full h-full object-contain' : ''}
        `}
        style={{ objectFit }}
      />
    </div>
  );
};

export default OptimizedImage;
