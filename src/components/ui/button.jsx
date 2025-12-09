import React from 'react';

export function Button({ children, className = '', variant = 'default', size = 'default', ...props }) {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    default: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-400',
    outline: 'border border-slate-700 bg-transparent hover:bg-slate-800 text-white'
  };
  
  const sizeClasses = {
    default: 'h-12 px-4',
    icon: 'h-10 w-10',
    sm: 'h-9 px-3 text-sm'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

