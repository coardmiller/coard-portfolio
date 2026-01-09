import React, { useState } from 'react';
import { Project } from '../types';
import RevealOnScroll from './RevealOnScroll';
import Lightbox from './Lightbox';

interface CaseStudyProps {
  project: Project;
  nextProject: Project;
  onNext: (project: Project) => void;
  onBack: () => void;
}

const CaseStudy: React.FC<CaseStudyProps> = ({ project, nextProject, onNext, onBack }) => {
  // All images including hero
  const allImages = [project.image, ...(project.detailImages || [])];

  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] pt-24 px-4 md:px-6 pb-20 text-black dark:text-white">
      
      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox 
          images={allImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}

      {/* Nav for Case Study */}
      <div className="flex justify-between items-center mb-12 font-sans text-xs uppercase sticky top-10 md:top-12 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-sm py-4 z-40 border-b border-gray-100 dark:border-white/10 transition-colors duration-500">
        {/* Desktop: Text link */}
        <button onClick={onBack} className="hidden md:flex group items-center gap-2 hover:text-black dark:hover:text-white text-gray-500 dark:text-gray-400 transition-colors">
           <span className="inline-block transform transition-transform duration-300 group-hover:-translate-x-1">←</span>
           <span>Back to Index</span>
        </button>
        
        {/* Mobile: X button */}
        <button 
          onClick={onBack} 
          className="md:hidden flex items-center justify-center w-10 h-10 -ml-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white active:text-black dark:active:text-white transition-colors"
          aria-label="Close project"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        
        <span className="text-gray-400 dark:text-gray-500">{project.category} / {project.year}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        
        {/* Left Column: Info */}
        <div className="lg:col-span-4 flex flex-col gap-12">
          <RevealOnScroll>
            <div>
              <span className="font-sans text-xs text-gray-400 dark:text-gray-500 block mb-2">( PROJECT )</span>
              <h1 className="text-5xl md:text-7xl font-light tracking-tighter uppercase leading-none break-words">
                {project.title}
              </h1>
            </div>
          </RevealOnScroll>

          <div className="space-y-6 lg:sticky lg:top-32">
            <RevealOnScroll delay={100} className="border-t border-black dark:border-white/20 pt-4">
              <span className="font-sans text-xs text-gray-400 dark:text-gray-500 block mb-2">( SYNOPSIS )</span>
              <p className="font-sans text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                 {project.description || `A comprehensive product exploration for ${project.title}, focusing on the intersection of utility and usability.`}
              </p>
            </RevealOnScroll>

             <RevealOnScroll delay={200} className="border-t border-black dark:border-white/20 pt-4">
                <button 
                  onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                  className="flex justify-between w-full items-center group cursor-pointer mb-4"
                >
                   <span className="font-sans text-xs text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors">( PROJECT DATA )</span>
                   <span className="font-sans text-xs text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors">
                     {isDetailsOpen ? 'Hide' : 'Show'}
                   </span>
                </button>
                
                <div className={`grid grid-cols-2 gap-4 font-sans text-xs uppercase transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${isDetailsOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Role</span>
                      <span>{project.role || 'Product Design'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Client</span>
                      <span>{project.client || project.title}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Category</span>
                      <span>{project.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Year</span>
                      <span>{project.year}</span>
                    </div>
                </div>
             </RevealOnScroll>
          </div>
        </div>

        {/* Right Column: Stacked Images */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {allImages.map((img, index) => {
            const isHero = img === project.image;
            return (
              <RevealOnScroll key={index} delay={100 + index * 100}>
                <div 
                  className={`w-full overflow-hidden cursor-pointer group ${isHero ? 'bg-black/5 dark:bg-white/5' : 'bg-gray-100 dark:bg-white/5'}`}
                  onClick={() => openLightbox(index)}
                >
                  <img 
                    src={img} 
                    alt={`${project.title} - Image ${index + 1}`} 
                    className={`w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-500 ${isHero ? 'max-h-[70vh] md:max-h-[80vh]' : ''}`}
                    loading={index < 2 ? 'eager' : 'lazy'}
                  />
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

      </div>

      {/* Next Project Teaser */}
      <RevealOnScroll className="mt-32 border-t border-black dark:border-white/20 pt-8">
        <div 
          className="flex justify-between items-end cursor-pointer group" 
          onClick={() => onNext(nextProject)}
        >
           <div>
             <span className="font-sans text-xs text-gray-400 dark:text-gray-500 block mb-2">( NEXT PROJECT )</span>
             <h2 className="text-3xl md:text-5xl font-light uppercase tracking-tight group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
               {nextProject.title}
             </h2>
           </div>
           <div className="text-2xl md:text-4xl transform group-hover:translate-x-4 transition-transform duration-500">
             →
           </div>
        </div>
      </RevealOnScroll>
    </div>
  );
};

export default CaseStudy;
