import React, { useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

interface LightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  
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

  const content = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10 group"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Previous Zone */}
      <div 
        onClick={onPrev}
        className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-start pl-6 cursor-pointer group z-10"
      >
        <span className="font-sans text-xs uppercase tracking-widest text-white/0 group-hover:text-white/60 transition-all duration-300">
          ( Prev )
        </span>
      </div>

      {/* Next Zone */}
      <div 
        onClick={onNext}
        className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-end pr-6 cursor-pointer group z-10"
      >
        <span className="font-sans text-xs uppercase tracking-widest text-white/0 group-hover:text-white/60 transition-all duration-300">
          ( Next )
        </span>
      </div>

      {/* Image Container */}
      <div className="w-[90vw] h-[90vh] flex items-center justify-center">
        <img 
          src={images[currentIndex]} 
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain animate-fade-in"
          style={{ 
            animation: 'fadeIn 0.3s ease-out'
          }}
        />
      </div>

      {/* Image Counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-sans text-xs uppercase tracking-widest text-white/40">
        {currentIndex + 1} / {images.length}
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
