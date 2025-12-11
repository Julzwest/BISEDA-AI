import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children, disabled = false }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const THRESHOLD = 80; // Distance needed to trigger refresh
  const MAX_PULL = 120; // Maximum pull distance

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const handleTouchStart = (e) => {
      // Only enable pull-to-refresh when at top of scroll
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling || isRefreshing) return;
      
      currentY.current = e.touches[0].clientY;
      const diff = currentY.current - startY.current;
      
      if (diff > 0 && container.scrollTop === 0) {
        e.preventDefault();
        // Apply resistance to pull
        const resistance = 0.5;
        const distance = Math.min(diff * resistance, MAX_PULL);
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      
      setIsPulling(false);
      
      if (pullDistance >= THRESHOLD && onRefresh && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(60); // Keep spinner visible
        
        try {
          await onRefresh();
        } catch (err) {
          console.error('Refresh failed:', err);
        }
        
        setIsRefreshing(false);
      }
      
      setPullDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, isRefreshing, pullDistance, onRefresh, disabled]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const rotation = progress * 180;
  const shouldTrigger = pullDistance >= THRESHOLD;

  return (
    <div ref={containerRef} className="relative overflow-auto h-full">
      {/* Pull indicator */}
      <div 
        className="absolute left-0 right-0 flex justify-center items-center pointer-events-none z-50 transition-transform"
        style={{ 
          transform: `translateY(${pullDistance - 60}px)`,
          opacity: pullDistance > 10 ? 1 : 0
        }}
      >
        <div className={`p-3 rounded-full ${
          shouldTrigger || isRefreshing
            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
            : 'bg-slate-700'
        } shadow-lg transition-colors`}>
          <RefreshCw 
            className={`w-6 h-6 text-white transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ transform: isRefreshing ? undefined : `rotate(${rotation}deg)` }}
          />
        </div>
      </div>

      {/* Pull text */}
      {pullDistance > 20 && !isRefreshing && (
        <div 
          className="absolute left-0 right-0 text-center pointer-events-none z-50 transition-opacity"
          style={{ 
            top: pullDistance + 10,
            opacity: pullDistance > 30 ? 1 : 0
          }}
        >
          <span className={`text-sm font-medium ${shouldTrigger ? 'text-purple-400' : 'text-slate-500'}`}>
            {shouldTrigger ? 'Lësho për rifreskim' : 'Tërhiq për rifreskim'}
          </span>
        </div>
      )}

      {/* Refreshing text */}
      {isRefreshing && (
        <div 
          className="absolute left-0 right-0 text-center pointer-events-none z-50"
          style={{ top: 70 }}
        >
          <span className="text-sm font-medium text-purple-400">
            Duke rifreskuar...
          </span>
        </div>
      )}

      {/* Content with pull offset */}
      <div 
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}

