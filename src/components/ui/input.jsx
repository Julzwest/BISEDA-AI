import React from 'react';

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
      {...props}
    />
  );
}

