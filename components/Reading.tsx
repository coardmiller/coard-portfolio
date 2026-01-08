import React from 'react';
import RevealOnScroll from './RevealOnScroll';
import { feedItems as importedFeed } from '../data/feed';

interface FeedItem {
  id: string;
  type: 'tweet' | 'article' | 'link';
  title: string;
  excerpt?: string | null;
  url: string;
  source: string;
  date: string;
  author?: string;
  authorHandle?: string;
  domain?: string;
}

// Import curated feed from Raindrop + Twitter
const feedItems: FeedItem[] = importedFeed as FeedItem[];

const FeedRow: React.FC<{ item: FeedItem; index: number }> = ({ item, index }) => {
  return (
    <RevealOnScroll delay={index * 30}>
      <a 
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block py-6 border-b border-gray-100 dark:border-white/5 last:border-b-0"
      >
        {/* Source & Date - small, muted, uppercase */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-sans text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {item.domain || item.source}
          </span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="font-sans text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
            {item.date}
          </span>
        </div>

        {/* Title - main content */}
        <h3 className="font-sans text-base text-black dark:text-white mb-1 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors duration-200">
          {item.title}
          <span className="inline-block ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 text-gray-400">
            →
          </span>
        </h3>

        {/* Excerpt - if available */}
        {item.excerpt && (
          <p className="font-sans text-sm text-gray-500 dark:text-gray-500 leading-relaxed line-clamp-2">
            {item.excerpt}
          </p>
        )}

        {/* Author for tweets */}
        {item.author && (
          <p className="font-sans text-xs text-gray-400 dark:text-gray-600 mt-2">
            {item.author} {item.authorHandle && <span className="text-gray-300 dark:text-gray-700">{item.authorHandle}</span>}
          </p>
        )}
      </a>
    </RevealOnScroll>
  );
};

const Reading: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] pt-32 px-4 md:px-6 pb-20">
      {/* Header */}
      <div className="max-w-xl mx-auto mb-12">
        <RevealOnScroll>
          <span className="font-sans text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-4">
            ( Reading )
          </span>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-black dark:text-white mb-4">
            Things I've found interesting.
          </h1>
          <p className="font-sans text-sm text-gray-500 dark:text-gray-500 leading-relaxed">
            Curated links from around the web.
          </p>
        </RevealOnScroll>
      </div>

      {/* Feed - simple list */}
      <div className="max-w-xl mx-auto">
        <div className="border-t border-gray-100 dark:border-white/5">
          {feedItems.map((item, index) => (
            <FeedRow key={item.id} item={item} index={index} />
          ))}
        </div>

        {/* Footer */}
        <RevealOnScroll delay={feedItems.length * 30 + 100}>
          <p className="font-sans text-[10px] uppercase tracking-widest text-gray-300 dark:text-gray-600 text-center mt-12">
            Updated daily at midnight
          </p>
        </RevealOnScroll>
      </div>
    </div>
  );
};

export default Reading;
