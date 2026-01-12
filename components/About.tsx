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
            I'm Coard Miller—a product designer specializing in spatial computing and mobile experiences at Lowe's.
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans text-xs leading-relaxed uppercase text-gray-600 dark:text-gray-400">
             <p>
               I have a passion for creating solutions that help people dream and explore.
             </p>
             <p>
               In my current role at Lowe's, I'm responsible for creating new experiences across the Lowe’s mobile app for iOS and Android. I'm also helping to create forward-looking initiatives like Lowe's Style Studio for Apple Vision Pro and helping users leverage generative AI to shop for home improvement needs and visualize what a space could be.
             </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-black dark:border-white/20 mt-12">
             <div>
               <h4 className="font-sans text-xs uppercase mb-4 text-gray-400 dark:text-gray-500">Expertise</h4>
               <ul className="font-sans text-xs uppercase space-y-2 text-black dark:text-gray-200">
                 <li>Spatial Computing</li>
                 <li>Mobile Product</li>
                 <li>Design Systems</li>
                 <li>Prototyping</li>
                 <li>Brand Identity</li>
               </ul>
             </div>
             <div>
               <h4 className="font-sans text-xs uppercase mb-4 text-gray-400 dark:text-gray-500">Experience</h4>
               <ul className="font-sans text-xs uppercase space-y-2 text-black dark:text-gray-200">
                 <li>Lowe's</li>
                 <li>NASCAR</li>
                 <li>Union</li>
                 <li>Boar's Head</li>
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
                 <li>Vision Pro</li>
                 <li>iOS / Android</li>
                 <li>AR / VR</li>
                 <li>AI Integration</li>
               </ul>
             </div>
          </div>

          <div className="pt-12 border-t border-black dark:border-white/20 mt-12">
            <h4 className="font-sans text-xs uppercase mb-6 text-gray-400 dark:text-gray-500">Philosophy</h4>
            <blockquote className="text-2xl md:text-3xl font-light leading-[1.3] tracking-tight italic">
              "Great design is invisible. It makes complex things feel simple, and impossible things feel inevitable."
            </blockquote>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
