import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`rounded-2xl ${className}`} {...props}>
      {children}
    </div>
  );
}

