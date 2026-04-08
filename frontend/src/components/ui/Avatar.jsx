import React, { useState } from 'react';

const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
    '3xl': 'w-24 h-24 text-3xl',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleError = () => {
    setImageError(true);
  };

  const initials = getInitials(name || alt);

  if (imageError || !src) {
    return (
      <div
        className={`
          ${sizes[size]}
          rounded-full bg-gradient-to-br from-teal-400 to-teal-600
          flex items-center justify-center text-white font-bold
          ring-2 ring-white shadow-md
          ${className}
        `}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || name}
      onError={handleError}
      className={`
        ${sizes[size]}
        rounded-full object-cover
        ring-2 ring-white shadow-md
        bg-gray-100
        ${className}
      `}
    />
  );
};

export default Avatar;
