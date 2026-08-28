import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { looks, type Look } from '../data/looks';

type Rect = { left: number; top: number; width: number; height: number };

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const DURATION_MS = 520;
const SOURCE_ASPECT = 1536 / 1024;
const ROW_TOLERANCE_PX = 24;
const STAGGER_MS = 48;

function visualRowDelays(wall: HTMLElement): Record<string, string> {
  const tiles = Array.from(wall.querySelectorAll<HTMLElement>('.look-tile'));
  const measured = tiles.map((el) => {
    const rect = el.getBoundingClientRect();
    return { el, top: rect.top, left: rect.left };
  });

  measured.sort((a, b) => a.top - b.top || a.left - b.left);

  const ordered: typeof measured = [];
  let row: typeof measured = [];
  let rowTop = 0;

  for (const item of measured) {
    if (row.length > 0 && Math.abs(item.top - rowTop) >= ROW_TOLERANCE_PX) {
      row.sort((a, b) => a.left - b.left);
      ordered.push(...row);
      row = [item];
      rowTop = item.top;
    } else {
      if (row.length === 0) rowTop = item.top;
      row.push(item);
    }
  }
  row.sort((a, b) => a.left - b.left);
  ordered.push(...row);

  const delays: Record<string, string> = {};
  ordered.forEach((item, i) => {
    const id = item.el.dataset.lookId;
    if (id) delays[id] = `${i * STAGGER_MS}ms`;
  });
  return delays;
}


function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

function measure(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

function destRect(): Rect {
  const maxW = window.innerWidth * 0.94;
  const maxH = window.innerHeight * 0.94;
  let width = maxW;
  let height = width / SOURCE_ASPECT;
  if (height > maxH) {
    height = maxH;
    width = height * SOURCE_ASPECT;
  }
  return {
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
    width,
    height,
  };
}

const LookExpand: React.FC<{
  look: Look;
  origin: Rect;
  reducedMotion: boolean;
  onClose: () => void;
}> = ({ look, origin, reducedMotion, onClose }) => {
  const [rect, setRect] = useState<Rect>(reducedMotion ? destRect() : origin);
  const [open, setOpen] = useState(reducedMotion);
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    if (reducedMotion) {
      onCloseRef.current();
      return;
    }
    closingRef.current = true;
    setClosing(true);
    setOpen(false);
    const slot = document.querySelector(`[data-look-id="${look.id}"]`);
    setRect(slot ? measure(slot) : origin);
  }, [look.id, origin, reducedMotion]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [requestClose]);

  useEffect(() => {
    if (reducedMotion) return;
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) {
          setOpen(true);
          setRect(destRect());
        }
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!closing) return;
    const t = window.setTimeout(() => onCloseRef.current(), DURATION_MS + 80);
    return () => window.clearTimeout(t);
  }, [closing]);

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== 'width' && event.propertyName !== 'transform') return;
    if (closing) onCloseRef.current();
  };

  const duration = reducedMotion ? 0 : DURATION_MS;

  return createPortal(
    <div
      className="look-expand"
      onClick={requestClose}
      role="dialog"
      aria-modal="true"
      aria-label={look.alt}
    >
      <div
        className={`look-expand-backdrop${open && !closing ? ' is-open' : ''}`}
        style={{ transitionDuration: `${duration}ms` }}
      />
      <div
        className="look-expand-frame"
        style={{
          width: rect.width,
          height: rect.height,
          transform: `translate(${rect.left}px, ${rect.top}px)`,
          transition: reducedMotion
            ? 'none'
            : `transform ${duration}ms ${EASE}, width ${duration}ms ${EASE}, height ${duration}ms ${EASE}`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <img
          src={look.src}
          alt={look.alt}
          draggable={false}
          style={{ objectPosition: look.objectPosition }}
        />
      </div>
    </div>,
    document.body
  );
};

const StyleGallery: React.FC<{ animationClass: string }> = ({ animationClass }) => {
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState<{ look: Look; origin: Rect } | null>(null);
  const [delayById, setDelayById] = useState<Record<string, string> | null>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const didStaggerRef = useRef(false);

  const open = (look: Look, el: HTMLElement) => {
    setActive({ look, origin: measure(el) });
  };

  const close = useCallback(() => setActive(null), []);

  useLayoutEffect(() => {
    if (reducedMotion || didStaggerRef.current) return;
    const wall = wallRef.current;
    if (!wall) return;
    const delays = visualRowDelays(wall);
    didStaggerRef.current = true;
    setDelayById(delays);
  }, [reducedMotion]);

  return (
    <main className={`relative z-10 lookbook ${animationClass}`}>
      <div className="lookbook-pad">
        <div ref={wallRef} className={`lookbook-wall${delayById ? ' is-staggered' : ''}`}>
          {looks.map((look, index) => {
            const isActive = active?.look.id === look.id;
            return (
              <button
                key={look.id}
                type="button"
                data-look-id={look.id}
                onClick={(event) => open(look, event.currentTarget)}
                className={`look-tile${isActive ? ' is-active' : ''}`}
                style={
                  {
                    '--aspect': look.aspect,
                    '--object-pos': look.objectPosition,
                    ...(delayById ? { '--look-delay': delayById[look.id] } : {}),
                  } as React.CSSProperties
                }
                aria-label={look.alt}
              >
                <img
                  src={look.src}
                  alt={look.alt}
                  loading={index < 8 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      </div>

      {active && (
        <LookExpand
          look={active.look}
          origin={active.origin}
          reducedMotion={reducedMotion}
          onClose={close}
        />
      )}

      <style>{`
        .lookbook-pad {
          padding: 8px;
        }
        @media (min-width: 768px) {
          .lookbook-pad { padding: 12px; }
        }

        .lookbook-wall {
          columns: 2;
          column-gap: 8px;
        }
        @media (min-width: 768px) {
          .lookbook-wall { columns: 3; column-gap: 12px; }
        }
        @media (min-width: 1024px) {
          .lookbook-wall { columns: 4; column-gap: 12px; }
        }
        @media (min-width: 1440px) {
          .lookbook-wall { columns: 5; column-gap: 12px; }
        }

        .look-tile {
          --aspect: 1/1;
          --object-pos: top;
          --look-delay: 0ms;
          position: relative;
          display: block;
          width: 100%;
          margin: 0 0 8px;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: zoom-in;
          break-inside: avoid;
          aspect-ratio: var(--aspect);
          overflow: hidden;
          opacity: 0;
        }
        .lookbook-wall.is-staggered .look-tile {
          animation: lookRise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: var(--look-delay);
        }
        @media (min-width: 768px) {
          .look-tile { margin-bottom: 12px; }
        }
        .look-tile img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: var(--object-pos);
          display: block;
        }
        .look-tile.is-active {
          visibility: hidden;
          pointer-events: none;
        }

        @keyframes lookRise {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (hover: hover) and (prefers-reduced-motion: no-preference) {
          .look-tile img {
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .look-tile:hover img {
            transform: scale(1.045);
          }
        }

        .look-expand {
          position: fixed;
          inset: 0;
          z-index: 9999;
          cursor: zoom-out;
        }
        .look-expand-backdrop {
          position: absolute;
          inset: 0;
          background: #ffffff;
          opacity: 0;
          transition-property: opacity;
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        :root.dark .look-expand-backdrop {
          background: #121212;
        }
        .look-expand-backdrop.is-open {
          opacity: 1;
        }
        .look-expand-frame {
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
          will-change: transform, width, height;
          pointer-events: none;
        }
        .look-expand-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          user-select: none;
          pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .look-tile,
          .lookbook-wall.is-staggered .look-tile {
            opacity: 1;
            animation: none;
          }
          .look-tile img {
            transition: none;
          }
          .look-tile:hover img {
            transform: none;
          }
          .look-expand-backdrop,
          .look-expand-frame {
            transition: none !important;
          }
        }
      `}</style>
    </main>
  );
};

export default StyleGallery;
