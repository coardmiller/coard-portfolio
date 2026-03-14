import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { experiments } from '../data/experiments';

const ExperimentView: React.FC<{ animationClass: string }> = ({ animationClass }) => {
  const { slug } = useParams<{ slug: string }>();
  const [aboutOpen, setAboutOpen] = useState(false);
  const experiment = experiments.find((item) => item.slug === slug);

  if (!experiment) {
    return (
      <main className={`relative z-10 min-h-screen bg-white dark:bg-[#121212] ${animationClass}`}>
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              Experiment not found
            </p>
            <Link
              to="/experiments"
              className="mt-4 inline-block text-sm uppercase tracking-[0.18em] text-black dark:text-white"
            >
              Back to Experiments
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`relative z-10 h-screen overflow-hidden bg-white text-black dark:bg-[#121212] dark:text-gray-100 ${animationClass}`}>
      <div className="flex h-full flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/10 bg-white/92 px-4 backdrop-blur-sm dark:border-white/10 dark:bg-[#121212]/92 md:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              to="/experiments"
              className="font-sans text-xs uppercase tracking-[0.18em] text-gray-500 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
              aria-label="Back to experiments"
            >
              ← Back
            </Link>
            <h1 className="truncate text-sm font-light uppercase tracking-[0.16em] text-black dark:text-gray-100">
              {experiment.title}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setAboutOpen((open) => !open)}
            className="font-sans text-xs uppercase tracking-[0.18em] text-gray-500 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            About
          </button>
        </div>

        <div className="relative flex-1 bg-gray-50 dark:bg-black">
          {experiment.iframeSrc ? (
            <iframe
              src={experiment.iframeSrc}
              title={experiment.title}
              className="h-full w-full border-0"
              allow="clipboard-read; clipboard-write; fullscreen"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6">
              <div className="max-w-md text-center">
                <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-gray-400 dark:text-gray-500">
                  Embed pending
                </p>
                <p className="mt-4 text-2xl font-light leading-[1.15] tracking-tight text-black dark:text-gray-100">
                  {experiment.title} will live here once the deployed URL is ready.
                </p>
              </div>
            </div>
          )}

          <div
            className={`absolute right-4 top-4 max-w-sm bg-white/94 p-4 backdrop-blur-md transition-all duration-300 dark:bg-[#171717]/94 ${
              aboutOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
            }`}
          >
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              {experiment.category}
            </p>
            <p className="mt-3 font-sans text-xs uppercase leading-relaxed tracking-[0.08em] text-gray-600 dark:text-gray-300">
              {experiment.description}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ExperimentView;
