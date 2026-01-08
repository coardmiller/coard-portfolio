import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check if page is already loaded
    if (document.readyState === 'complete') {
      setIsLoaded(true);
    } else {
      const handleLoad = () => setIsLoaded(true);
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  useEffect(() => {
    let interval: number;
    let currentProgress = 0;

    // Simulation logic
    interval = window.setInterval(() => {
      // If actual page load isn't done, stall at 85%
      if (!isLoaded && currentProgress >= 85) {
        return; 
      }

      // Variable speed
      const diff = Math.random() * 10;
      currentProgress += diff;

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Brief pause at 100% before fading out
        setTimeout(() => {
          setIsFadingOut(true);
          // Wait for fade out animation to finish before unmounting
          setTimeout(onComplete, 800); 
        }, 200);
      }

      setProgress(Math.round(currentProgress));
    }, 100);

    return () => clearInterval(interval);
  }, [isLoaded, onComplete]);

  // Circle config
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-[#121212] transition-opacity duration-800 ease-[cubic-bezier(0.19,1,0.22,1)] ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* SVG Circle */}
        <svg 
          width="120" 
          height="120" 
          viewBox="0 0 120 120" 
          className="transform -rotate-90"
        >
          {/* Track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-gray-200 dark:text-gray-800"
          />
          {/* Progress */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-black dark:text-white transition-all duration-300 ease-out"
          />
        </svg>

        {/* Percentage Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-sans text-xs font-medium tabular-nums tracking-widest text-black dark:text-white">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;