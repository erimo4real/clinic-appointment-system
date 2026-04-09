import React, { useState, useEffect, useRef } from 'react';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  fallbackSrc = null,
  aspectRatio = null,
  objectFit = 'cover',
  loading = 'lazy',
  sizes = '100vw',
  onLoad,
  onError,
  priority = false,
  rounded = 'full',
  borderColor = 'border-white',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const imgRef = useRef(null);

  useEffect(() => {
    setImageSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
    if (onError) onError();
  };

  const roundedClasses = {
    full: 'rounded-full',
    xl: 'rounded-xl',
    lg: 'rounded-lg',
    md: 'rounded-md',
    none: 'rounded-none',
  };

  const placeholder = (
    <div 
      className={`bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center ${roundedClasses[rounded] || 'rounded-full'} ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    />
  );

  const defaultFallback = (
    <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${roundedClasses[rounded] || 'rounded-full'} ${className}`}>
      <svg className="w-1/3 h-1/3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  );

  if (!imageSrc || hasError) {
    return fallbackSrc ? (
      <div className={`relative overflow-hidden ${roundedClasses[rounded] || 'rounded-full'} ${className}`}>
        <img
          src={fallbackSrc}
          alt={alt}
          className={`w-full h-full object-cover ${roundedClasses[rounded] || 'rounded-full'}`}
          onError={handleError}
        />
      </div>
    ) : (
      defaultFallback
    );
  }

  return (
    <div 
      className={`relative overflow-hidden ${roundedClasses[rounded] || 'rounded-full'} ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!isLoaded && placeholder}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        loading={priority ? 'eager' : loading}
        decoding={priority ? 'sync' : 'async'}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          w-full h-full
          ${objectFit === 'cover' ? 'object-cover' : ''}
          ${objectFit === 'contain' ? 'object-contain' : ''}
          ${roundedClasses[rounded] || 'rounded-full'}
          transition-all duration-300 ease-in-out
          ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-98'}
        `}
        style={{ objectFit }}
      />
    </div>
  );
};

export default OptimizedImage;
