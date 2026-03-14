import React from 'react';
import { Link } from 'react-router-dom';
import RevealOnScroll from './RevealOnScroll';
import { experiments } from '../data/experiments';

const formatCount = (count: number) => count.toString().padStart(2, '0');

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
              Experiments in tools, interfaces, and small digital systems worth trying in motion.
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
                to={`/experiments/${experiment.slug}`}
                className="group block"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50 dark:bg-white/[0.04]">
                  {experiment.thumbnail ? (
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
