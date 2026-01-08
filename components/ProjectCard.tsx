import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  layout?: 'grid' | 'list';
  className?: string;
  aspectRatio?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onClick, 
  layout = 'grid',
  className = '',
  aspectRatio = 'aspect-[4/5]'
}) => {
  if (layout === 'list') {
    return (
      <div 
        onClick={() => onClick(project)}
        className="group flex items-baseline justify-between py-6 border-b border-gray-100 dark:border-white/10 hover:border-black dark:hover:border-white cursor-pointer transition-all duration-500 font-sans text-sm uppercase text-black dark:text-gray-200 hover:pl-4"
      >
        <div className="flex items-center space-x-12">
           <span className="text-gray-300 dark:text-gray-600 w-8 group-hover:text-black dark:group-hover:text-white transition-colors">0{project.id}</span>
           <h3 className="group-hover:translate-x-4 transition-transform duration-500 ease-out">{project.title}</h3>
        </div>
        <div className="flex items-center space-x-16 text-xs text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors duration-500">
          <span className="hidden md:block">{project.category}</span>
          <span>{project.year}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(project)}
      className={`group cursor-pointer flex flex-col gap-3 ${className}`}
    >
      <div className={`overflow-hidden relative bg-gray-50 dark:bg-white/5 w-full ${aspectRatio}`}>
        {/* Image with High-End Scale Curve */}
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Subtle Darkening Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 dark:group-hover:bg-white/10 transition-colors duration-700" />
        
        {/* Floating Details Badges (ID & Year) */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] translate-y-[-10px] group-hover:translate-y-0">
            <span className="font-sans text-[9px] uppercase tracking-widest text-black dark:text-white font-medium bg-white/90 dark:bg-black/80 backdrop-blur-md px-2 py-1 rounded-full border border-black/5 dark:border-white/10 shadow-sm">
              0{project.id}
            </span>
            <span className="font-sans text-[9px] uppercase tracking-widest text-black dark:text-white font-medium bg-white/90 dark:bg-black/80 backdrop-blur-md px-2 py-1 rounded-full border border-black/5 dark:border-white/10 shadow-sm">
              {project.year}
            </span>
        </div>
      </div>
      
      {/* Bottom Text Info */}
      <div className="flex justify-between items-start mt-2 font-sans text-[10px] uppercase tracking-wide overflow-hidden">
        <div className="flex flex-col gap-1">
          <h3 className="text-black dark:text-gray-100 font-medium group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{project.title}</h3>
          <span className="text-gray-400 dark:text-gray-500">{project.category}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] text-gray-500 dark:text-gray-400">
          <span>View</span>
          <span className="inline-block transform transition-transform duration-300 group-hover:translate-x-1">→</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;