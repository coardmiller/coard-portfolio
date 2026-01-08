import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProjectCard from './components/ProjectCard';
import CaseStudy from './components/CaseStudy';
import About from './components/About';
import CV from './components/CV';
import Playground from './components/Playground';
import RevealOnScroll from './components/RevealOnScroll';
import Noise from './components/Noise';
import Parallax from './components/Parallax';
import Preloader from './components/Preloader';
import { Project, ViewMode, Page, ThemeMode } from './types';

// Coard Miller's Real Work
const projects: Project[] = [
  { 
    id: '01', 
    title: 'Lowe\'s Style Studio', 
    category: 'Spatial Computing', 
    year: '2024', 
    image: '/images/style-studio-hero.png',
    detailImages: [
      '/images/style-studio-hero.png'
    ],
    description: 'A groundbreaking kitchen design experience built exclusively for Apple Vision Pro. Helping users visualize what a space could be before a single tile is laid.',
    role: 'Lead Product Designer',
    client: 'Lowe\'s Innovation Labs'
  },
  { 
    id: '02', 
    title: 'Lowe\'s In-Store Mode', 
    category: 'Mobile Product', 
    year: '2024', 
    image: '/images/in-store-hero.jpg',
    detailImages: [
      '/images/in-store-1.jpg',
      '/images/in-store-2.jpg',
      '/images/in-store-3.jpg',
      '/images/in-store-hero.jpg'
    ],
    description: 'Helping customers quickly and easily navigate stores. Find products instantly, check inventory, and get to what you need in 112,000+ square feet.',
    role: 'Lead Product Designer',
    client: 'Lowe\'s Mobile'
  },
  { 
    id: '03', 
    title: 'Next Gen Design Concepts', 
    category: 'Design Exploration', 
    year: '2025', 
    image: '/images/nextgen-hero.jpg',
    detailImages: [
      '/images/nextgen-1.jpg',
      '/images/nextgen-2.jpg',
      '/images/nextgen-3.jpg',
      '/images/nextgen-hero.jpg'
    ],
    description: 'Creating the future of mobile e-commerce. Exploring AI-powered product discovery, conversational shopping, and seamless omnichannel experiences.',
    role: 'Lead Product Designer',
    client: 'Lowe\'s Mobile'
  },
  { 
    id: '04', 
    title: 'Union.co', 
    category: 'Brand & Web', 
    year: '2020', 
    image: '/images/union-hero.jpg',
    detailImages: [
      '/images/union-hero.jpg',
      '/images/union-1.jpg',
      '/images/union-2.jpg',
      '/images/union-3.jpg'
    ],
    description: 'A modern design system and site for an established agency entering a new era. Balancing heritage with modernity, structure with creative freedom.',
    role: 'Design Lead',
    client: 'Union'
  },
  { 
    id: '05', 
    title: 'NASCAR Next', 
    category: 'Platform Design', 
    year: '2019', 
    image: '/images/nascar-next-hero.png',
    detailImages: [
      '/images/nascar-next-hero.png',
      '/images/nascar-next-1.jpg',
      '/images/nascar-next-2.jpg',
      '/images/nascar-next-3.jpg'
    ],
    description: 'Creating a new home for some of NASCAR\'s rising talents. A platform that celebrates emerging drivers and connects them with the racing community.',
    role: 'Product Designer',
    client: 'NASCAR'
  },
  { 
    id: '06', 
    title: 'Boar\'s Head', 
    category: 'Interactive Experience', 
    year: '2019', 
    image: '/images/boars-head-hero.jpg',
    detailImages: [
      '/images/boars-head-hero.jpg',
      '/images/boars-head-1.jpg',
      '/images/boars-head-2.jpg',
      '/images/boars-head-3.jpg'
    ],
    description: 'Interactive product experiences for one of the largest deli purveyors in the US. Bringing craft and quality to life through digital touchpoints.',
    role: 'Product Designer',
    client: 'Boar\'s Head'
  },
];

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<Page>('HOME');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('GRID');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationClass, setAnimationClass] = useState('animate-in');
  const [exitDirection, setExitDirection] = useState<'down' | 'up'>('down');
  
  // Settings State
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('coard-miller-theme') as ThemeMode) || 'SYSTEM';
  });
  const [noiseEnabled, setNoiseEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('coard-miller-noise');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Theme Logic Effect
  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = () => {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = theme === 'DARK' || (theme === 'SYSTEM' && isSystemDark);
      
      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('coard-miller-theme', theme);

    if (theme === 'SYSTEM') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  // Noise Persistence Effect
  useEffect(() => {
    localStorage.setItem('coard-miller-noise', JSON.stringify(noiseEnabled));
  }, [noiseEnabled]);

  // Animation Lifecycle
  useEffect(() => {
    // Only run transitions if NOT loading
    if (loading) return;

    if (isTransitioning) {
      setAnimationClass(exitDirection === 'up' ? 'animate-out-up' : 'animate-out');
    } else {
      setAnimationClass('animate-in');
      const timer = setTimeout(() => {
        setAnimationClass(''); // Remove class to clear transform and restore standard stacking context
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, exitDirection, loading]);

  // Transition Handler
  const handlePageChange = (newPage: Page, newProject: Project | null = null, dir: 'down' | 'up' = 'down') => {
    if (page === newPage && !newProject) return;

    setExitDirection(dir);
    setIsTransitioning(true);
    
    // Wait for the exit animation
    setTimeout(() => {
      setPage(newPage);
      if (newProject) {
        setSelectedProject(newProject);
      } else {
        if (newPage !== 'CASE_STUDY') setSelectedProject(null);
      }
      
      window.scrollTo(0, 0);
      setIsTransitioning(false);
    }, 500);
  };

  const handleProjectClick = (project: Project) => {
    handlePageChange('CASE_STUDY', project);
  };

  const handleNextProject = (project: Project) => {
    handlePageChange('CASE_STUDY', project, 'up');
  };

  const handleBack = () => {
    handlePageChange('HOME');
  };

  const getProjectStyle = (index: number) => {
    const patternIndex = index % 6;
    switch (patternIndex) {
      case 0: return { gridClass: "md:col-span-3", aspectRatio: "aspect-[3/4]" };
      case 1: return { gridClass: "md:col-span-4 md:col-start-5", aspectRatio: "aspect-square" };
      case 2: return { gridClass: "md:col-span-4", aspectRatio: "aspect-[4/5]" };
      case 3: return { gridClass: "md:col-span-4", aspectRatio: "aspect-video" };
      case 4: return { gridClass: "md:col-span-3 md:col-start-6", aspectRatio: "aspect-[3/4]" };
      case 5: return { gridClass: "md:col-span-2 md:col-start-10", aspectRatio: "aspect-[1/2]" };
      default: return { gridClass: "md:col-span-4", aspectRatio: "aspect-square" };
    }
  };

  const getNextProject = (currentProject: Project): Project => {
    const currentIndex = projects.findIndex(p => p.id === currentProject.id);
    const nextIndex = (currentIndex + 1) % projects.length;
    return projects[nextIndex];
  };

  const ViewSwitcher = () => (
    <div className="flex gap-2 text-black dark:text-white items-center">
      <button 
        onClick={() => setViewMode('GRID')} 
        className={`hover:opacity-100 transition-opacity ${viewMode === 'GRID' ? 'opacity-100' : 'opacity-20'}`}
        aria-label="Grid View"
      >
        <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <rect width="3.5" height="3.5"/>
            <rect x="5.5" width="3.5" height="3.5"/>
            <rect y="5.5" width="3.5" height="3.5"/>
            <rect x="5.5" y="5.5" width="3.5" height="3.5"/>
        </svg>
      </button>
      <button 
        onClick={() => setViewMode('LIST')} 
        className={`hover:opacity-100 transition-opacity ${viewMode === 'LIST' ? 'opacity-100' : 'opacity-20'}`}
        aria-label="List View"
      >
        <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <rect width="9" height="3.5"/>
            <rect y="5.5" width="9" height="3.5"/>
        </svg>
      </button>
   </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-black dark:text-gray-200 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black font-sans antialiased transition-colors duration-500 relative">
      {noiseEnabled && <Noise />}
      
      {/* Preloader */}
      {loading && (
        <Preloader onComplete={() => setLoading(false)} />
      )}

      {/* Main Content - Only render when loading is complete */}
      {!loading && (
        <>
          <Header 
            setPage={(p) => handlePageChange(p)} 
            theme={theme}
            setTheme={setTheme}
            noiseEnabled={noiseEnabled}
            setNoiseEnabled={setNoiseEnabled}
          />

          <main className={`relative z-10 ${animationClass}`}>
            
            {page === 'PLAYGROUND' && <Playground />}

            {page === 'ABOUT' && <About />}

            {page === 'CASE_STUDY' && selectedProject && (
              <CaseStudy 
                project={selectedProject} 
                nextProject={getNextProject(selectedProject)}
                onNext={handleNextProject}
                onBack={handleBack} 
              />
            )}

            {page === 'HOME' && (
              <div className="pt-32 px-4 md:px-6">
                
                <Parallax speed={0.75} className="mb-24 md:mb-32 max-w-5xl">
                  <RevealOnScroll>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-light leading-[1.15] tracking-tight text-black dark:text-gray-100">
                      Product designer pushing the boundaries of spatial computing and mobile experiences. I help people see their future before it exists.
                    </h1>
                  </RevealOnScroll>
                </Parallax>

                <div className="hidden md:grid grid-cols-12 gap-x-4 mb-8 font-sans text-xs uppercase tracking-tight sticky top-10 md:top-12 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-sm z-30 py-4 items-center transition-all ease-out">
                  <div className="col-span-3 opacity-60">
                    WORKS 0{projects.length}
                  </div>
                  <div className="col-start-12 col-span-1 flex justify-end">
                      <ViewSwitcher />
                  </div>
                </div>

                <div className="md:hidden flex justify-between items-center mb-8 font-sans text-xs uppercase sticky top-10 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-sm z-30 py-4 border-b border-gray-100 dark:border-white/10">
                    <div className="opacity-60">WORKS 0{projects.length}</div>
                    <ViewSwitcher />
                </div>

                <div className={`
                  w-full min-h-[50vh] transition-all duration-700
                  ${viewMode === 'GRID' ? 'grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-16 md:gap-y-32' : ''}
                  ${viewMode === 'LIST' ? 'flex flex-col gap-0' : ''}
                `}>
                  {projects.map((project, index) => {
                    const style = viewMode === 'GRID' ? getProjectStyle(index) : { gridClass: '', aspectRatio: 'aspect-[4/5]' };
                    
                    return (
                      <RevealOnScroll key={project.id} delay={index * 50} className={viewMode === 'GRID' ? style.gridClass : 'w-full'}>
                        <ProjectCard 
                            project={project} 
                            onClick={handleProjectClick} 
                            layout={viewMode === 'LIST' ? 'list' : 'grid'}
                            aspectRatio={style.aspectRatio}
                        />
                      </RevealOnScroll>
                    );
                  })}
                </div>

                <RevealOnScroll delay={200} className="mt-32">
                  <CV />
                </RevealOnScroll>
                
                <RevealOnScroll delay={300}>
                  <footer className="border-t border-black/10 dark:border-white/10 py-12 font-sans text-[10px] uppercase flex justify-between text-gray-400 dark:text-gray-600">
                    <span>© 2026 Coard Miller</span>
                    <span>Charlotte, NC</span>
                  </footer>
                </RevealOnScroll>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
};

export default App;