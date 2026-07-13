import React, { useState } from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 px-4 md:px-6 animate-fade-in pb-20 text-black dark:text-white">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        <div className="md:col-span-3 font-sans text-xs uppercase sticky top-32 h-fit text-gray-400 dark:text-gray-500">
          ( About )
        </div>

        <div className="md:col-span-6 flex flex-col gap-12">
          <h1 className="text-4xl md:text-6xl font-light leading-[1.1] tracking-tight">
            I’m Coard Miller, a product designer at Fastbreak AI.
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans text-xs leading-relaxed uppercase text-gray-600 dark:text-gray-400">
             <p>
               I’m drawn to complex systems and the challenge of making them feel clear, useful, and human.
             </p>
             <p>
               At Fastbreak AI, I help design AI-powered products for the people who make sports happen, from professional leagues to youth tournaments. My work turns complicated scheduling, event management, and operational workflows into intuitive tools that help organizations spend less time managing logistics and more time creating great experiences for athletes, families, and fans. Previously at Lowe’s, I led product design across mobile, spatial computing, and generative AI, including Lowe’s Style Studio for Apple Vision Pro.
             </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-black dark:border-white/20 mt-12">
             <div>
               <h4 className="font-sans text-xs uppercase mb-4 text-gray-400 dark:text-gray-500">Expertise</h4>
               <ul className="font-sans text-xs uppercase space-y-2 text-black dark:text-gray-200">
                 <li>Product Design</li>
                 <li>AI-Powered Products</li>
                 <li>Mobile Products</li>
                 <li>Design Systems</li>
                 <li>Prototyping</li>
               </ul>
             </div>
             <div>
               <h4 className="font-sans text-xs uppercase mb-4 text-gray-400 dark:text-gray-500">Experience</h4>
               <ul className="font-sans text-xs uppercase space-y-2 text-black dark:text-gray-200">
                 <li>Fastbreak AI</li>
                 <li>Lowe’s</li>
                 <li>Union</li>
               </ul>
             </div>
             <div>
               <h4 className="font-sans text-xs uppercase mb-4 text-gray-400 dark:text-gray-500">Tools</h4>
               <ul className="font-sans text-xs uppercase space-y-2 text-black dark:text-gray-200">
                 <li>Figma</li>
                 <li>Cursor</li>
                 <li>Claude Code</li>
                 <li>Play</li>
               </ul>
             </div>
             <div>
               <h4 className="font-sans text-xs uppercase mb-4 text-gray-400 dark:text-gray-500">Focus</h4>
               <ul className="font-sans text-xs uppercase space-y-2 text-black dark:text-gray-200">
                 <li>Sports Technology</li>
                 <li>Complex Workflows</li>
                 <li>AI Integration</li>
                 <li>Web and Mobile</li>
               </ul>
             </div>
          </div>

          <div className="pt-12 border-t border-black dark:border-white/20 mt-12">
            <h4 className="font-sans text-xs uppercase mb-6 text-gray-400 dark:text-gray-500">Philosophy</h4>
            <blockquote className="text-2xl md:text-3xl font-light leading-[1.3] tracking-tight italic">
              "Great design turns complexity into momentum. It helps people understand what’s possible and gives them the confidence to act."
            </blockquote>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
