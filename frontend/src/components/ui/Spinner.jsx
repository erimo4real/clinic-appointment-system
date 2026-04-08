import React from 'react';

const Spinner = ({ size = 'md', className = '', color = 'teal' }) => {
  const sizes = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const colors = {
    teal: 'border-teal-200 border-t-teal-600',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-200 border-t-gray-600',
    blue: 'border-blue-200 border-t-blue-600',
  };

  return (
    <div
      className={`${sizes[size]} ${colors[color]} rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const PageLoader = () => (
  <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-500">Loading...</p>
    </div>
  </div>
);

export const ButtonSpinner = () => (
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default Spinner;
