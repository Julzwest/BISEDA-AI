import React from 'react';

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${className}`}
      {...props}
    />
  );
}

