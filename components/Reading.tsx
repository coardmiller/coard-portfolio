import React from 'react';
import RevealOnScroll from './RevealOnScroll';

interface FeedItem {
  id: string;
  type: 'tweet' | 'article' | 'link';
  title: string;
  excerpt?: string;
  url: string;
  source: string;
  date: string;
  author?: string;
  authorHandle?: string;
}

// Sample data - replace with actual API call to Raindrop/Twitter
const feedItems: FeedItem[] = [
  {
    id: '1',
    type: 'tweet',
    title: 'This post made me realize I don\'t actually understand how terminal UIs work.',
    excerpt: 'I asked Claude to make an explainer with interactive examples.',
    url: 'https://x.com/brian_lovin/status/2009046532218372262',
    source: 'Twitter',
    date: '2026-01-08',
    author: 'Brian Lovin',
    authorHandle: '@brian_lovin'
  },
  {
    id: '2',
    type: 'article',
    title: 'How Terminals Work',
    excerpt: 'Interactive explainer on terminal emulators, escape codes, and the magic behind your command line.',
    url: 'https://how-terminals-work.vercel.app/',
    source: 'Web',
    date: '2026-01-08'
  },
  {
    id: '3',
    type: 'link',
    title: 'Jakub Krehel',
    excerpt: 'Founding Design Engineer at Interfere. Design engineering articles and beautiful component showcases.',
    url: 'https://jakub.kr/',
    source: 'Portfolio',
    date: '2026-01-08'
  },
  {
    id: '4',
    type: 'article',
    title: 'Vibe Guide',
    excerpt: 'Tips for getting the most out of AI coding agents like Claude Code, Codex, and Gemini CLI.',
    url: 'https://www.vibekanban.com/vibe-guide',
    source: 'Vibe Kanban',
    date: '2026-01-07'
  }
];

const FeedCard: React.FC<{ item: FeedItem; index: number }> = ({ item, index }) => {
  return (
    <RevealOnScroll delay={index * 50}>
      <a 
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <article 
          className="
            p-6 
            bg-white dark:bg-white/[0.02]
            rounded-xl
            shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.03),0_2px_4px_0_rgba(0,0,0,0.03)]
            dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_1px_2px_-1px_rgba(255,255,255,0.02),0_2px_4px_0_rgba(255,255,255,0.02)]
            hover:shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_-1px_rgba(0,0,0,0.06),0_4px_8px_0_rgba(0,0,0,0.06)]
            dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_4px_-1px_rgba(255,255,255,0.04),0_4px_8px_0_rgba(255,255,255,0.04)]
            transition-all duration-200 ease-out
            hover:scale-[1.01]
            active:scale-[0.99]
          "
        >
          {/* Meta row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">
                ( {item.type} )
              </span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="font-sans text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {item.source}
              </span>
            </div>
            <span className="font-sans text-[10px] text-gray-400 dark:text-gray-500">
              {item.date}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-sans text-base font-medium text-black dark:text-white mb-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            {item.title}
          </h3>

          {/* Excerpt */}
          {item.excerpt && (
            <p className="font-sans text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
              {item.excerpt}
            </p>
          )}

          {/* Author (for tweets) */}
          {item.author && (
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-white/5">
              <span className="font-sans text-xs text-gray-600 dark:text-gray-400">
                {item.author}
              </span>
              {item.authorHandle && (
                <span className="font-sans text-xs text-gray-400 dark:text-gray-500">
                  {item.authorHandle}
                </span>
              )}
            </div>
          )}

          {/* Arrow indicator */}
          <div className="flex justify-end mt-2">
            <span className="text-gray-300 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all duration-200">
              →
            </span>
          </div>
        </article>
      </a>
    </RevealOnScroll>
  );
};

const Reading: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] pt-32 px-4 md:px-6 pb-20">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-16">
        <RevealOnScroll>
          <span className="font-sans text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-4">
            ( Reading )
          </span>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-black dark:text-white mb-6">
            Things I've saved, shared, and found interesting.
          </h1>
          <p className="font-sans text-gray-500 dark:text-gray-400 leading-relaxed">
            A stream of tweets, articles, and links from around the web. 
            Curated from my bookmarks and saved posts.
          </p>
        </RevealOnScroll>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto">
        <div className="space-y-4">
          {feedItems.map((item, index) => (
            <FeedCard key={item.id} item={item} index={index} />
          ))}
        </div>

        {/* Footer note */}
        <RevealOnScroll delay={feedItems.length * 50 + 100}>
          <div className="mt-16 pt-8 border-t border-gray-100 dark:border-white/5">
            <p className="font-sans text-xs text-gray-400 dark:text-gray-500 text-center">
              Updated automatically from Raindrop and Twitter bookmarks
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
};

export default Reading;
