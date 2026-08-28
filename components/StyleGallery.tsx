import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { looks, type Look } from '../data/looks';

type Rect = { left: number; top: number; width: number; height: number };
type LayoutMode = 'masonry' | 'grid';
type SizeLevel = 0 | 1 | 2;
type GapLevel = 0 | 1;

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const DURATION_MS = 520;
const SOURCE_ASPECT = 1536 / 1024;
const ROW_TOLERANCE_PX = 24;
const STAGGER_MS = 48;
const STORAGE_KEY = 'coard-miller-lookbook';
const GAP_PX = [8, 16] as const;
const GRID_ASPECT = '4/5';
const COLS: Record<SizeLevel, { base: number; md: number; lg: number; xl: number }> = {
  0: { base: 2, md: 3, lg: 4, xl: 5 },
  1: { base: 2, md: 2, lg: 3, xl: 4 },
  2: { base: 2, md: 2, lg: 2, xl: 3 },
};


function colCountFor(size: SizeLevel): number {
  const w = window.innerWidth;
  const cols = COLS[size];
  if (w >= 1440) return cols.xl;
  if (w >= 1024) return cols.lg;
  if (w >= 768) return cols.md;
  return cols.base;
}

function clearMasonryPack(wall: HTMLElement) {
  wall.style.height = '';
  for (const tile of wall.querySelectorAll<HTMLElement>('.look-tile')) {
    tile.style.position = '';
    tile.style.left = '';
    tile.style.top = '';
    tile.style.width = '';
    tile.style.height = '';
  }
}

function tileAspectRatio(tile: HTMLElement): number {
  const raw = getComputedStyle(tile).getPropertyValue('--aspect').trim() || '1/1';
  const parts = raw.split('/').map((n) => Number(n.trim()));
  if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) return parts[0] / parts[1];
  return 1;
}

function packMasonry(wall: HTMLElement, cols: number, gap: number) {
  const tiles = Array.from(wall.querySelectorAll<HTMLElement>('.look-tile'));
  const totalW = wall.clientWidth;
  if (totalW <= 0 || cols < 1) return;
  if (tiles.length === 0) {
    wall.style.height = '0px';
    return;
  }
  const colW = (totalW - gap * (cols - 1)) / cols;
  const heights = Array(cols).fill(0);
  tiles.forEach((tile, i) => {
    const col = i % cols;
    const h = colW / tileAspectRatio(tile);
    tile.style.position = 'absolute';
    tile.style.width = `${colW}px`;
    tile.style.height = `${h}px`;
    tile.style.left = `${col * (colW + gap)}px`;
    tile.style.top = `${heights[col]}px`;
    heights[col] += h + gap;
  });
  wall.style.height = `${Math.max(0, ...heights) - gap}px`;
}

function lookMatches(look: Look, raw: string): boolean {
  const tokens = raw.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const hay = `${look.alt} ${look.caption} ${look.id}`.toLowerCase();
  return tokens.every((token) => hay.includes(token));
}

type LookbookPrefs = { layout: LayoutMode; size: SizeLevel; gap: GapLevel };

const DEFAULT_PREFS: LookbookPrefs = { layout: 'masonry', size: 0, gap: 0 };

function readPrefs(): LookbookPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<LookbookPrefs>;
    return {
      layout: parsed.layout === 'grid' ? 'grid' : 'masonry',
      size: parsed.size === 1 || parsed.size === 2 ? parsed.size : 0,
      gap: Number(parsed.gap) > 0 ? 1 : 0,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

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

const ToolBtn: React.FC<{
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, pressed, disabled, onClick, children }) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={pressed}
    disabled={disabled}
    onClick={onClick}
    className={`look-tool-btn${pressed ? ' is-active' : ''}`}
  >
    {children}
  </button>
);

const IconMasonry = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
    <rect x="0" y="0" width="5.5" height="8" rx="0.5" fill="currentColor" />
    <rect x="0" y="10" width="5.5" height="3" rx="0.5" fill="currentColor" />
    <rect x="7.5" y="0" width="5.5" height="4.5" rx="0.5" fill="currentColor" />
    <rect x="7.5" y="6.5" width="5.5" height="6.5" rx="0.5" fill="currentColor" />
  </svg>
);

const IconGrid = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
    <rect x="0" y="0" width="5.5" height="5.5" rx="0.5" fill="currentColor" />
    <rect x="7.5" y="0" width="5.5" height="5.5" rx="0.5" fill="currentColor" />
    <rect x="0" y="7.5" width="5.5" height="5.5" rx="0.5" fill="currentColor" />
    <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="0.5" fill="currentColor" />
  </svg>
);

const IconGapTight = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
    <rect x="4" y="1" width="2" height="11" rx="0.5" fill="currentColor" />
    <rect x="7" y="1" width="2" height="11" rx="0.5" fill="currentColor" />
  </svg>
);

const IconGapLoose = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
    <rect x="1.5" y="1" width="2" height="11" rx="0.5" fill="currentColor" />
    <rect x="9.5" y="1" width="2" height="11" rx="0.5" fill="currentColor" />
  </svg>
);

const SEARCH_PROMPTS = [
  "Arc'teryx",
  'field jacket',
  'chambray',
  'loafers',
  'rain shell',
  'chore coat',
  'Chelsea boots',
  'oxford',
];

const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M5.6 1.15a4.45 4.45 0 1 0 2.73 7.96l2.48 2.48a.7.7 0 0 0 .99-.99L9.32 8.13A4.45 4.45 0 0 0 5.6 1.15Zm-3.05 4.45a3.05 3.05 0 1 1 6.1 0 3.05 3.05 0 0 1-6.1 0Z"
    />
  </svg>
);

const LookbookToolbar: React.FC<{
  layout: LayoutMode;
  size: SizeLevel;
  gap: GapLevel;
  query: string;
  searchOpen: boolean;
  onSearchOpen: (open: boolean) => void;
  onQuery: (query: string) => void;
  onLayout: (layout: LayoutMode) => void;
  onSize: (size: SizeLevel) => void;
  onGap: (gap: GapLevel) => void;
}> = ({ layout, size, gap, query, searchOpen, onSearchOpen, onQuery, onLayout, onSize, onGap }) => {
  const [promptI, setPromptI] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const prompt = SEARCH_PROMPTS[promptI];

  useEffect(() => {
    if (!searchOpen || query) return;
    const id = window.setInterval(() => setPromptI((i) => (i + 1) % SEARCH_PROMPTS.length), 2800);
    return () => window.clearInterval(id);
  }, [searchOpen, query]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const toggleSearch = () => {
    if (searchOpen && !query) {
      onSearchOpen(false);
      return;
    }
    onSearchOpen(true);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      if (query) onQuery('');
      else onSearchOpen(false);
    } else if (event.key === 'Enter' && !query) {
      onQuery(prompt);
    } else if (event.key === '/' && !query) {
      event.preventDefault();
    }
  };

  return (
    <div className="lookbook-toolbar-slot">
      <div
        className={`lookbook-toolbar${searchOpen ? ' is-searching' : ''}`}
        role="toolbar"
        aria-label="Lookbook display"
      >
        <div className="look-tool-group">
          <ToolBtn label={searchOpen ? 'Close search' : 'Search looks'} pressed={searchOpen} onClick={toggleSearch}>
            <IconSearch />
          </ToolBtn>
          <div className="look-search-field">
            <input
              ref={inputRef}
              className="look-search-input"
              type="search"
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Search looks"
              autoComplete="off"
              spellCheck={false}
            />
            {searchOpen && !query && (
              <button
                type="button"
                className="look-search-hint"
                tabIndex={-1}
                onClick={() => onQuery(prompt)}
              >
                Try <span>'{prompt}'</span>
              </button>
            )}
          </div>
        </div>

        <div className="look-tool-divider" aria-hidden="true" />

        <div className="look-tool-group">
          <ToolBtn
            label={layout === 'masonry' ? 'Switch to grid layout' : 'Switch to masonry layout'}
            pressed
            onClick={() => onLayout(layout === 'masonry' ? 'grid' : 'masonry')}
          >
            {layout === 'masonry' ? <IconMasonry /> : <IconGrid />}
          </ToolBtn>
          <ToolBtn
            label={gap === 0 ? 'Switch to looser spacing' : 'Switch to tighter spacing'}
            pressed
            onClick={() => onGap(gap === 0 ? 1 : 0)}
          >
            {gap === 0 ? <IconGapTight /> : <IconGapLoose />}
          </ToolBtn>
        </div>

        <div className="look-tool-divider" aria-hidden="true" />

        <div className="look-tool-group">
          <ToolBtn
            label="Smaller tiles"
            disabled={size <= 0}
            onClick={() => onSize((size - 1) as SizeLevel)}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <rect x="1.5" y="5" width="9" height="2" rx="0.5" fill="currentColor" />
            </svg>
          </ToolBtn>
          <ToolBtn
            label="Larger tiles"
            disabled={size >= 2}
            onClick={() => onSize((size + 1) as SizeLevel)}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <rect x="1.5" y="5" width="9" height="2" rx="0.5" fill="currentColor" />
              <rect x="5" y="1.5" width="2" height="9" rx="0.5" fill="currentColor" />
            </svg>
          </ToolBtn>
        </div>
      </div>
    </div>
  );
};

const StyleGallery: React.FC<{ animationClass: string }> = ({ animationClass }) => {
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState<{ look: Look; origin: Rect } | null>(null);
  const [delayById, setDelayById] = useState<Record<string, string> | null>(null);
  const [intro, setIntro] = useState<'wait' | 'stagger' | 'ready'>('wait');
  const [prefs, setPrefs] = useState<LookbookPrefs>(readPrefs);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const wallRef = useRef<HTMLDivElement>(null);
  const pendingScrollRef = useRef<number | null>(null);
  const visibleLooks = useMemo(() => looks.filter((look) => lookMatches(look, query)), [query]);

  const setPrefsAnimated = useCallback((update: (p: LookbookPrefs) => LookbookPrefs) => {
    pendingScrollRef.current = window.scrollY;
    const apply = () => setPrefs(update);
    const restore = () => {
      const y = pendingScrollRef.current;
      if (y == null) return;
      window.scrollTo({ top: y, left: 0, behavior: 'instant' });
    };
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<unknown> };
    };
    if (!reducedMotion && typeof doc.startViewTransition === 'function') {
      const vt = doc.startViewTransition(() => {
        flushSync(apply);
        restore();
      });
      void vt.finished.then(restore).catch(restore);
    } else {
      apply();
    }
  }, [reducedMotion]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      const slash = event.key === '/';
      const cmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if ((slash || cmdK) && !typing) {
        event.preventDefault();
        event.stopPropagation();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  const open = (look: Look, el: HTMLElement) => {
    setActive({ look, origin: measure(el) });
  };

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  useLayoutEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;
    const gap = GAP_PX[prefs.gap];
    if (prefs.layout === 'masonry') {
      packMasonry(wall, colCountFor(prefs.size), gap);
    } else {
      clearMasonryPack(wall);
    }
    if (pendingScrollRef.current != null) {
      window.scrollTo({ top: pendingScrollRef.current, left: 0, behavior: 'instant' });
    }
    if (intro === 'wait') {
      if (reducedMotion) {
        setIntro('ready');
      } else {
        setDelayById(visualRowDelays(wall));
        setIntro('stagger');
      }
    }
    const ro = new ResizeObserver(() => {
      if (prefs.layout === 'masonry') packMasonry(wall, colCountFor(prefs.size), gap);
    });
    ro.observe(wall);
    const onLoad = () => {
      if (prefs.layout === 'masonry') packMasonry(wall, colCountFor(prefs.size), gap);
    };
    wall.addEventListener('load', onLoad, true);
    return () => {
      ro.disconnect();
      wall.removeEventListener('load', onLoad, true);
    };
  }, [reducedMotion, intro, prefs.layout, prefs.size, prefs.gap, query]);

  useEffect(() => {
    if (intro !== 'stagger' || !delayById) return;
    const ms = Math.max(0, ...Object.values(delayById).map((d: string) => parseFloat(d) || 0)) + 750;
    const t = window.setTimeout(() => setIntro('ready'), ms);
    return () => window.clearTimeout(t);
  }, [intro, delayById]);

  const cols = COLS[prefs.size];
  const wallStyle = {
    '--look-gap': `${GAP_PX[prefs.gap]}px`,
    '--cols-base': String(cols.base),
    '--cols-md': String(cols.md),
    '--cols-lg': String(cols.lg),
    '--cols-xl': String(cols.xl),
  } as React.CSSProperties;

  return (
    <main className={`relative z-10 lookbook ${animationClass}`} style={wallStyle}>
      <div className="lookbook-pad">
        <div
          ref={wallRef}
          className={`lookbook-wall is-${prefs.layout}${intro === 'stagger' ? ' is-staggered' : ''}${intro === 'ready' ? ' is-ready' : ''}`}
        >
          {visibleLooks.map((look, index) => {
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
                    '--aspect': prefs.layout === 'grid' ? GRID_ASPECT : look.aspect,
                    '--object-pos': look.objectPosition,
                    ...(intro === 'stagger' && delayById ? { '--look-delay': delayById[look.id] } : {}),
                    viewTransitionName: `look-${look.id}`,
                  } as React.CSSProperties
                }
                aria-label={look.alt}
              >
                <img
                  src={look.src}
                  alt={look.alt}
                  loading={index < 12 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
        {query.trim() && visibleLooks.length === 0 && (
          <p className="look-search-empty">No looks for '{query.trim()}'</p>
        )}
      </div>

      {!active && createPortal(
        <LookbookToolbar
          layout={prefs.layout}
          size={prefs.size}
          gap={prefs.gap}
          query={query}
          searchOpen={searchOpen}
          onSearchOpen={setSearchOpen}
          onQuery={setQuery}
          onLayout={(layout) => setPrefsAnimated((p) => ({ ...p, layout }))}
          onSize={(size) => setPrefsAnimated((p) => ({ ...p, size }))}
          onGap={(gap) => setPrefsAnimated((p) => ({ ...p, gap }))}
        />,
        document.body
      )}

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
          padding-top: calc(48px + var(--look-gap, 8px));
          padding-left: var(--look-gap, 8px);
          padding-right: var(--look-gap, 8px);
          padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px) + var(--look-gap, 8px));
        }

        .lookbook-wall {
          position: relative;
        }
        .lookbook-wall.is-grid {
          display: grid;
          grid-template-columns: repeat(var(--cols-base), minmax(0, 1fr));
          gap: var(--look-gap);
        }
        @media (min-width: 768px) {
          .lookbook-wall.is-grid { grid-template-columns: repeat(var(--cols-md), minmax(0, 1fr)); }
        }
        @media (min-width: 1024px) {
          .lookbook-wall.is-grid { grid-template-columns: repeat(var(--cols-lg), minmax(0, 1fr)); }
        }
        @media (min-width: 1440px) {
          .lookbook-wall.is-grid { grid-template-columns: repeat(var(--cols-xl), minmax(0, 1fr)); }
        }

        .look-tile {
          --aspect: 1/1;
          --object-pos: top;
          --look-delay: 0ms;
          position: relative;
          display: block;
          width: 100%;
          margin: 0;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: zoom-in;
          font-size: 0;
          line-height: 0;
          appearance: none;
          -webkit-appearance: none;
          aspect-ratio: var(--aspect);
          overflow: hidden;
          opacity: 0;
        }
        .lookbook-wall.is-staggered .look-tile {
          animation: lookRise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: var(--look-delay);
        }
        .lookbook-wall.is-ready .look-tile {
          opacity: 1;
          animation: none;
        }
        .lookbook-toolbar {
          view-transition-name: lookbook-toolbar;
        }
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
        }
        ::view-transition-group(*) {
          animation-duration: 0.48s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        ::view-transition-group(lookbook-toolbar) {
          z-index: 1000;
          overflow: hidden;
          border-radius: 9999px;
        }
        ::view-transition-old(lookbook-toolbar),
        ::view-transition-new(lookbook-toolbar) {
          overflow: hidden;
          border-radius: 9999px;
          height: 100%;
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

        .lookbook-toolbar-slot {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 80;
          display: flex;
          justify-content: center;
          pointer-events: none;
          padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
        }
        .look-search-empty {
          margin: 24px 0 0;
          color: #9ca3af;
          font-size: 14px;
          text-align: center;
        }
        .lookbook-toolbar {
          pointer-events: auto;
          display: flex;
          align-items: center;
          padding: 4px 6px;
          border-radius: 9999px;
          overflow: hidden;
          max-width: calc(100vw - 32px);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid #f3f4f6;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          color: #111;
          font-family: inherit;
          user-select: none;
        }
        :root.dark .lookbook-toolbar {
          background: rgba(26, 26, 26, 0.95);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 36px rgba(0, 0, 0, 0.5);
          color: #f3f4f6;
        }
        .look-tool-group {
          display: flex;
          align-items: center;
          gap: 0;
        }
        .look-search-field {
          position: relative;
          width: 0;
          height: 32px;
          opacity: 0;
          overflow: hidden;
          transition: width 0.42s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
        }
        .lookbook-toolbar.is-searching .look-search-field {
          width: min(52vw, 260px);
          opacity: 1;
        }
        .look-search-input {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 32px;
          margin: 0;
          padding: 0 8px 0 2px;
          border: 0;
          background: transparent;
          color: inherit;
          font: inherit;
          font-size: 13px;
          outline: none;
          appearance: none;
        }
        .look-search-input::-webkit-search-decoration,
        .look-search-input::-webkit-search-cancel-button {
          -webkit-appearance: none;
        }
        .look-search-hint {
          position: absolute;
          left: 2px;
          right: 8px;
          top: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          overflow: hidden;
          margin: 0;
          padding: 0;
          border: 0;
          background: transparent;
          color: #9ca3af;
          font: inherit;
          font-size: 13px;
          text-align: left;
          white-space: nowrap;
          cursor: text;
        }
        .look-search-hint span {
          color: #111;
          font-weight: 600;
          margin-left: 0.25em;
        }
        :root.dark .look-search-hint span {
          color: #f3f4f6;
        }
        .look-search-hint::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.7) 50%, transparent 80%);
          transform: translateX(-120%);
          animation: lookShimmer 2.2s ease-in-out infinite;
          pointer-events: none;
        }
        :root.dark .look-search-hint::after {
          background: linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.18) 50%, transparent 80%);
        }
        @keyframes lookShimmer {
          0% { transform: translateX(-120%); }
          55%, 100% { transform: translateX(120%); }
        }
        .look-tool-divider {
          width: 1px;
          height: 14px;
          margin: 0 6px;
          background: #f3f4f6;
        }
        :root.dark .look-tool-divider {
          background: rgba(255, 255, 255, 0.1);
        }
        .look-tool-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          padding: 0;
          border: 0;
          border-radius: 9999px;
          background: transparent;
          color: inherit;
          cursor: pointer;
          opacity: 0.4;
          outline: none;
          transition: opacity 0.15s ease, box-shadow 0.15s ease;
        }
        .look-tool-btn:focus,
        .look-tool-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 1.5px currentColor;
        }
        .look-tool-btn.is-active,
        .look-tool-btn:hover {
          opacity: 1;
        }
        .look-tool-btn:disabled {
          opacity: 0.2;
          cursor: default;
        }
        .look-tool-btn:disabled:hover {
          opacity: 0.2;
        }
        .look-tool-btn svg {
          display: block;
        }

        @media (prefers-reduced-motion: reduce) {
          .look-search-hint::after {
            animation: none;
          }
          .look-search-field {
            transition: none;
          }
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
