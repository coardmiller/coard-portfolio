import React, { useEffect, useRef } from 'react';

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number; // 1 = normal scroll, 0.5 = half speed, etc.
  className?: string;
}

const Parallax: React.FC<ParallaxProps> = ({ children, speed = 0.75, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      if (ref.current) {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollY < window.innerHeight * 1.5) {
          const offset = scrollY * (1 - speed);
          ref.current.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
      }
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(update);
      }
    };

    // Apply initial position
    update();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
};

export default Parallax;