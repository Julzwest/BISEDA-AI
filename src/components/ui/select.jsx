import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const SelectContext = React.createContext(null);

export function Select({ children, value, onValueChange, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, selectedLabel, setSelectedLabel }}>
      <div className="select-wrapper relative" ref={selectRef}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { ...props });
          }
          return child;
        })}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className = '', placeholder, ...props }) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('SelectTrigger must be used within Select');
  }
  const { isOpen, setIsOpen, selectedLabel } = context;
  
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`w-full rounded-xl border px-4 py-3 text-sm flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
      {...props}
    >
      <span>{selectedLabel || placeholder}</span>
      <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function SelectValue({ placeholder }) {
  const context = React.useContext(SelectContext);
  if (context) {
    context.setSelectedLabel(placeholder);
  }
  return null;
}

export function SelectContent({ children }) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('SelectContent must be used within Select');
  }
  const { isOpen, setIsOpen, setSelectedLabel, onValueChange } = context;
  
  if (!isOpen) return null;

  const handleSelect = (val, label) => {
    setSelectedLabel(label);
    onValueChange?.(val);
    setIsOpen(false);
  };

  return (
    <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-lg max-h-60 overflow-auto">
      <div className="py-1">
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && child.type === SelectItem) {
            return React.cloneElement(child, { onSelect: handleSelect });
          }
          return child;
        })}
      </div>
    </div>
  );
}

export function SelectItem({ children, value, onSelect, ...props }) {
  const label = typeof children === 'string' ? children : React.Children.toArray(children).join('');
  return (
    <div
      onClick={() => onSelect?.(value, label)}
      className="px-4 py-2 text-sm text-white hover:bg-slate-800 cursor-pointer transition-colors"
      {...props}
    >
      {children}
    </div>
  );
}

