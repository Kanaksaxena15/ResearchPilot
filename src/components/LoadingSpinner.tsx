import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Processing academic request...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-2',
    lg: 'h-14 w-14 border-4',
  };

  return (
    <div id="loading-spinner" className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-t-transparent border-blue-600 mx-auto`}
      />
      {message && (
        <p className="font-mono text-xs text-[#a8a8a8] tracking-wider uppercase">
          {message}
        </p>
      )}
    </div>
  );
};
