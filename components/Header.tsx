import React, { useState, useRef, useEffect } from 'react';
import { ThemeMode } from '../types';

interface HeaderProps {
  setPage: (page: string) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  noiseEnabled: boolean;
  setNoiseEnabled: (enabled: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  setPage, 
  theme,
  setTheme,
  noiseEnabled,
  setNoiseEnabled
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMobileNav = (page: string) => {
    setPage(page);
    setMobileMenuOpen(false);
  };

  const NavItem = ({ label, onClick, disabled = false }: { label: string, onClick?: () => void, disabled?: boolean }) => {
    if (disabled) {
      return (
        <button className="opacity-30 cursor-not-allowed uppercase tracking-wide">
          {label}
        </button>
      );
    }
    return (
      <button 
        onClick={onClick} 
        className="group relative uppercase tracking-wide hover:text-black dark:hover:text-white transition-colors"
      >
        <span>{label}</span>
        <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-black dark:bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
      </button>
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white/90 dark:bg-[#121212]/90 backdrop-blur-sm z-50 px-4 md:px-6 h-12 md:h-12 transition-colors duration-500 font-sans text-xs tracking-wide uppercase flex justify-between items-center text-black dark:text-gray-200">
        {/* Logo */}
        <div className="flex-1">
          <button onClick={() => { setPage('HOME'); setMobileMenuOpen(false); }} className="hover:text-gray-500 dark:hover:text-white transition-colors font-bold tracking-widest whitespace-nowrap">
            COARD MILLER
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-1 justify-center space-x-6 lg:space-x-12 text-black/80 dark:text-gray-300">
          <NavItem label="Work" onClick={() => setPage('HOME')} />
          <NavItem label="About" onClick={() => setPage('ABOUT')} />
          <a href="mailto:hello@coardmiller.com" className="group relative uppercase tracking-wide hover:text-black dark:hover:text-white transition-colors">
            <span>Contact</span>
            <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-black dark:bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
          </a>
        </nav>

        {/* Desktop Settings */}
        <div className="hidden md:flex flex-1 justify-end items-center space-x-6 text-right text-black/60 dark:text-gray-400 relative">
          <button 
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`group relative hover:text-black dark:hover:text-white transition-colors ${settingsOpen ? 'text-black dark:text-white' : ''}`}
          >
            <span>Settings</span>
          </button>

          {/* Settings Panel */}
          {settingsOpen && (
            <div 
              ref={settingsRef}
              className="absolute top-8 right-0 w-48 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md border border-gray-100 dark:border-white/10 p-4 shadow-xl animate-fade-in flex flex-col gap-4 text-[10px] tracking-wider text-left"
            >
              {/* Theme Section */}
              <div className="flex flex-col gap-2">
                <span className="text-gray-400 dark:text-gray-500 uppercase">Theme</span>
                <div className="flex justify-between text-black dark:text-white uppercase">
                  <button 
                    onClick={() => setTheme('SYSTEM')}
                    className={`hover:opacity-100 transition-opacity ${theme === 'SYSTEM' ? 'opacity-100 underline decoration-1 underline-offset-4' : 'opacity-40'}`}
                  >
                    System
                  </button>
                  <button 
                    onClick={() => setTheme('LIGHT')}
                    className={`hover:opacity-100 transition-opacity ${theme === 'LIGHT' ? 'opacity-100 underline decoration-1 underline-offset-4' : 'opacity-40'}`}
                  >
                    Light
                  </button>
                  <button 
                    onClick={() => setTheme('DARK')}
                    className={`hover:opacity-100 transition-opacity ${theme === 'DARK' ? 'opacity-100 underline decoration-1 underline-offset-4' : 'opacity-40'}`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              {/* Noise Section */}
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-white/10">
                <span className="text-gray-400 dark:text-gray-500 uppercase">Texture</span>
                <div className="flex gap-4 text-black dark:text-white uppercase">
                  <button 
                    onClick={() => setNoiseEnabled(true)}
                    className={`hover:opacity-100 transition-opacity ${noiseEnabled ? 'opacity-100 underline decoration-1 underline-offset-4' : 'opacity-40'}`}
                  >
                    On
                  </button>
                  <button 
                    onClick={() => setNoiseEnabled(false)}
                    className={`hover:opacity-100 transition-opacity ${!noiseEnabled ? 'opacity-100 underline decoration-1 underline-offset-4' : 'opacity-40'}`}
                  >
                    Off
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Mobile Hamburger */}
        <button 
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-[1.5px] bg-black dark:bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[4px]' : ''}`}></span>
          <span className={`block w-5 h-[1.5px] bg-black dark:bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[3px]' : ''}`}></span>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-white dark:bg-[#121212] z-40 transition-all duration-500 md:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col pt-24 px-4">
          <button 
            onClick={() => handleMobileNav('HOME')} 
            className="py-4 border-b border-gray-100 dark:border-white/10 text-left text-sm uppercase tracking-widest hover:opacity-50 transition-opacity text-black dark:text-white"
          >
            WORK
          </button>
          <button 
            onClick={() => handleMobileNav('ABOUT')} 
            className="py-4 border-b border-gray-100 dark:border-white/10 text-left text-sm uppercase tracking-widest hover:opacity-50 transition-opacity text-black dark:text-white"
          >
            ABOUT
          </button>
          <a 
            href="mailto:hello@coardmiller.com" 
            className="py-4 border-b border-gray-100 dark:border-white/10 text-left text-sm uppercase tracking-widest hover:opacity-50 transition-opacity text-black dark:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            CONTACT
          </a>
        </nav>
      </div>
    </>
  );
};

export default Header;
