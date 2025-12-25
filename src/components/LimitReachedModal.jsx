import React from 'react';

// Everything is FREE - this modal should never show
export default function LimitReachedModal({ isOpen, onClose }) {
  // Never show this modal since everything is unlimited
  if (isOpen && onClose) {
    // Auto-close if somehow opened
    onClose();
  }
  return null;
}
