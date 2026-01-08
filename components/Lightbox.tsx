import React, { useEffect, useCallback, useState, useRef } from 'react';
import ReactDOM from 'react-dom';

interface LightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      onNext();
    } else if (isRightSwipe) {
      onPrev();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const content = (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close Button - Fixed position with safe area */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 text-white/80 hover:text-white active:text-white transition-colors z-50 p-3 -m-3"
        style={{ 
          paddingTop: 'max(12px, env(safe-area-inset-top, 12px))',
          paddingRight: 'max(12px, env(safe-area-inset-right, 12px))'
        }}
        aria-label="Close lightbox"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Previous Zone - Hidden on mobile, use swipe instead */}
      <div 
        onClick={onPrev}
        className="hidden md:flex absolute left-0 top-0 bottom-0 w-1/3 items-center justify-start pl-6 cursor-pointer group z-10"
      >
        <span className="font-sans text-xs uppercase tracking-widest text-white/0 group-hover:text-white/60 transition-all duration-300">
          ( Prev )
        </span>
      </div>

      {/* Next Zone - Hidden on mobile, use swipe instead */}
      <div 
        onClick={onNext}
        className="hidden md:flex absolute right-0 top-0 bottom-0 w-1/3 items-center justify-end pr-6 cursor-pointer group z-10"
      >
        <span className="font-sans text-xs uppercase tracking-widest text-white/0 group-hover:text-white/60 transition-all duration-300">
          ( Next )
        </span>
      </div>

      {/* Image Container */}
      <div className="w-[90vw] h-[85vh] md:h-[90vh] flex items-center justify-center">
        <img 
          src={images[currentIndex]} 
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain select-none"
          style={{ 
            animation: 'fadeIn 0.3s ease-out'
          }}
          draggable={false}
        />
      </div>

      {/* Image Counter + Swipe Hint on Mobile */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <span className="md:hidden font-sans text-[10px] uppercase tracking-widest text-white/30">
          Swipe to navigate
        </span>
        <span className="font-sans text-xs uppercase tracking-widest text-white/40">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );

  // Render via portal to ensure it's above everything
  return ReactDOM.createPortal(content, document.body);
};

export default Lightbox;
