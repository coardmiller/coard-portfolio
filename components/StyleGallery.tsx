import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { looks, type Look } from '../data/looks';

const LookPreview: React.FC<{ look: Look; onClose: () => void }> = ({ look, onClose }) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex cursor-zoom-out items-center justify-center bg-white dark:bg-[#121212]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={look.alt}
    >
      <img
        src={look.src}
        alt={look.alt}
        className="max-h-[94vh] max-w-[94vw] select-none object-contain"
        draggable={false}
      />
    </div>,
    document.body
  );
};

const StyleGallery: React.FC<{ animationClass: string }> = ({ animationClass }) => {
  const [active, setActive] = useState<Look | null>(null);
  const close = useCallback(() => setActive(null), []);

  return (
    <main className={`relative z-10 ${animationClass}`}>
      <div className="px-2 pt-14 pb-8 md:px-3 md:pt-16 md:pb-12">
        <div className="columns-2 gap-2 md:columns-3 md:gap-3 lg:columns-4">
          {looks.map((look) => (
            <button
              key={look.id}
              type="button"
              onClick={() => setActive(look)}
              className="mb-2 block w-full cursor-zoom-in break-inside-avoid border-0 bg-transparent p-0 md:mb-3"
              aria-label={look.alt}
            >
              <img
                src={look.src}
                alt={look.alt}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
              />
            </button>
          ))}
        </div>
      </div>

      {active && <LookPreview look={active} onClose={close} />}
    </main>
  );
};

export default StyleGallery;
