import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import RevealOnScroll from './RevealOnScroll';
import { experiments } from '../data/experiments';

const formatCount = (count: number) => count.toString().padStart(2, '0');

const CYCLE_MS = 500;
const FADE_MS = 260;

function shuffled<T>(items: T[]): T[] {
  const next = items.slice();
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
  }
  return next;
}

const CyclingThumbnail: React.FC<{ srcs: string[]; alt: string }> = ({ srcs, alt }) => {
  const frames = useMemo(() => (srcs.length > 1 ? shuffled(srcs) : srcs), [srcs]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const holderRef = useRef<HTMLDivElement>(null);

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const el = holderRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => setVisible(entries.some((entry) => entry.isIntersecting)),
      { rootMargin: '120px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || frames.length < 2 || !visible) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [reduced, frames.length, visible]);

  useEffect(() => {
    if (frames.length < 2) return;
    const next = new Image();
    next.src = frames[(index + 1) % frames.length];
  }, [frames, index]);

  const current = frames[index] || frames[0];
  const previous = frames.length > 1 ? frames[(index - 1 + frames.length) % frames.length] : null;

  return (
    <div ref={holderRef} className="relative h-full w-full overflow-hidden">
      {previous && !reduced && (
        <img
          src={previous}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      )}
      <img
        key={current}
        src={current}
        alt={alt}
        className="exp-cycle-frame absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
        loading="eager"
        draggable={false}
      />
      <style>{`
        .exp-cycle-frame {
          animation: expCycleIn ${FADE_MS}ms ease both;
        }
        @keyframes expCycleIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .exp-cycle-frame { animation: none; }
        }
      `}</style>
    </div>
  );
};

const ExperimentsIndex: React.FC<{ animationClass: string }> = ({ animationClass }) => {
  return (
    <main className={`relative z-10 ${animationClass}`}>
      <div className="pt-32 px-4 md:px-6 pb-20">
        <div className="mb-14 md:mb-20 max-w-3xl">
          <RevealOnScroll>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-5">
              Ongoing builds
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={50}>
            <h1 className="text-3xl md:text-5xl font-light leading-[1.1] tracking-tight text-black dark:text-gray-100">
              Experiments in curating a personal clothing moodboard using generative AI.
            </h1>
          </RevealOnScroll>
        </div>

        <div className="hidden md:grid grid-cols-12 gap-x-4 mb-10 font-sans text-xs uppercase tracking-tight sticky top-10 md:top-12 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-sm z-30 py-4 items-center transition-all ease-out">
          <div className="col-span-3 opacity-60">
            EXPERIMENTS {formatCount(experiments.length)}
          </div>
        </div>

        <div className="md:hidden flex items-center mb-8 font-sans text-xs uppercase sticky top-10 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-sm z-30 py-4 border-b border-gray-100 dark:border-white/10">
          <div className="opacity-60">EXPERIMENTS {formatCount(experiments.length)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-16 md:gap-y-24">
          {experiments.map((experiment, index) => (
            <RevealOnScroll
              key={experiment.slug}
              delay={index * 60}
              className="md:col-span-6 lg:col-span-4"
            >
              <Link
                to={experiment.href || `/experiments/${experiment.slug}`}
                className="group block"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50 dark:bg-white/[0.04]">
                  {experiment.thumbnailCycle && experiment.thumbnailCycle.length > 1 ? (
                    <CyclingThumbnail srcs={experiment.thumbnailCycle} alt={experiment.title} />
                  ) : experiment.thumbnail ? (
                    <img
                      src={experiment.thumbnail}
                      alt={experiment.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="relative flex h-full w-full items-end bg-[radial-gradient(circle_at_top_left,_rgba(0,0,0,0.04),_transparent_45%),linear-gradient(180deg,_rgba(0,0,0,0),_rgba(0,0,0,0.03))] p-5 dark:bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_45%),linear-gradient(180deg,_rgba(255,255,255,0),_rgba(255,255,255,0.03))]">
                      <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-black/35 dark:text-white/30">
                        Preview pending
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <div className="mb-3 flex items-center justify-between gap-4 font-sans text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                    <span>{experiment.category}</span>
                    <span className="translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
                      Open
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-light tracking-tight text-black transition-colors duration-300 group-hover:text-gray-500 dark:text-gray-100 dark:group-hover:text-gray-300">
                    {experiment.title}
                  </h2>
                  <p className="mt-2 max-w-md font-sans text-xs uppercase leading-relaxed tracking-[0.08em] text-gray-500 dark:text-gray-400">
                    {experiment.description}
                  </p>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ExperimentsIndex;
