import React, { useEffect, useRef } from 'react';

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number; // 1 = normal scroll, 0.5 = half speed, etc.
  className?: string;
}

const Parallax: React.FC<ParallaxProps> = ({ children, speed = 0.75, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId: number;
    
    const loop = () => {
      if (ref.current) {
        // Use pageYOffset for broader compatibility
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Optimization: Only animate if the element is potentially in view
        // Since this is primarily for the top bio, we can stop calculating after scrolling past viewport 
        if (scrollY < window.innerHeight * 1.5) {
            // Calculate offset: 
            // If speed is 0.75, the element should move up 25% slower than the scroll.
            // We translate it DOWN by 25% of the scroll distance to counteract the upward movement.
            const offset = scrollY * (1 - speed);
            ref.current.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
      }
      frameId = requestAnimationFrame(loop);
    };

    // Start the loop
    loop();

    return () => cancelAnimationFrame(frameId);
  }, [speed]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
};

export default Parallax;