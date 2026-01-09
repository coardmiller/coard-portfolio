import React, { useState } from 'react';
import { CVItem } from '../types';
import RevealOnScroll from './RevealOnScroll';

const experience: CVItem[] = [
  { year: '2022—PRES', role: 'Lead Product Designer', company: 'Lowe\'s', location: 'Charlotte' },
  { year: '2020—2022', role: 'Senior Product Designer', company: 'Lowe\'s', location: 'Charlotte' },
  { year: '2016—2020', role: 'Designer', company: 'Union', location: 'Charlotte' },
];

const CV: React.FC = () => {
  const [bio] = useState("Product designer specializing in spatial computing and mobile experiences. I help people visualize possibilities and make complex interactions feel effortless.");

  return (
    <div className="w-full border-t border-black dark:border-white/20 pt-20 mt-20 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-4 md:px-6">
        
        {/* Title */}
        <RevealOnScroll className="col-span-1 md:col-span-3 font-sans text-xs uppercase opacity-50 sticky top-32 h-fit text-black dark:text-gray-300">
          ( Curriculum Vitae )
        </RevealOnScroll>

        {/* Content */}
        <div className="col-span-1 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32">
          
          {/* Bio Column */}
          <RevealOnScroll delay={100} className="space-y-10">
            <h3 className="font-sans text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500">Profile</h3>
            <p className="text-xl md:text-2xl font-light leading-relaxed max-w-md font-sans text-black/90 dark:text-gray-100">
              {bio}
            </p>
          </RevealOnScroll>

          {/* Lists Column */}
          <div className="space-y-16">
            
            {/* Experience */}
            <RevealOnScroll delay={200}>
              <h3 className="font-sans text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-8">Experience</h3>
              <ul className="space-y-6">
                {experience.map((item, idx) => (
                  <li key={idx} className="grid grid-cols-12 gap-4 font-sans text-xs uppercase group hover:text-gray-500 dark:hover:text-gray-300 transition-all duration-300 cursor-default text-black dark:text-gray-200 hover:translate-x-2">
                    <span className="col-span-3 text-gray-400 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white transition-colors">{item.year}</span>
                    <span className="col-span-5 font-medium">{item.company}</span>
                    <span className="col-span-4 text-right md:text-left text-gray-500 dark:text-gray-400">{item.role}</span>
                  </li>
                ))}
              </ul>
            </RevealOnScroll>

            {/* Focus Areas */}
            <RevealOnScroll delay={300}>
              <h3 className="font-sans text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-8">Focus Areas</h3>
              <ul className="space-y-4 font-sans text-xs uppercase text-black dark:text-gray-200">
                 <li className="flex justify-between border-b border-gray-100 dark:border-white/10 py-2 group hover:pl-2 transition-all duration-300">
                    <span>Spatial Computing</span> <span className="text-gray-400 dark:text-gray-600">Vision Pro</span>
                 </li>
                 <li className="flex justify-between border-b border-gray-100 dark:border-white/10 py-2 group hover:pl-2 transition-all duration-300">
                    <span>Mobile Product</span> <span className="text-gray-400 dark:text-gray-600">iOS / Android</span>
                 </li>
                 <li className="flex justify-between border-b border-gray-100 dark:border-white/10 py-2 group hover:pl-2 transition-all duration-300">
                    <span>Immersive Experiences</span> <span className="text-gray-400 dark:text-gray-600">AR / VR</span>
                 </li>
                 <li className="flex justify-between border-b border-gray-100 dark:border-white/10 py-2 group hover:pl-2 transition-all duration-300">
                    <span>Design Systems</span> <span className="text-gray-400 dark:text-gray-600">Scale</span>
                 </li>
              </ul>
            </RevealOnScroll>

            {/* Contact */}
             <RevealOnScroll delay={400}>
              <h3 className="font-sans text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-8">Connect</h3>
              <ul className="space-y-4 font-sans text-xs uppercase text-black dark:text-gray-200">
                 <li className="border-b border-gray-100 dark:border-white/10 py-2">
                    <a href="mailto:hello@coardmiller.com" className="flex justify-between hover:pl-2 transition-all duration-300 group">
                      <span>Email</span> 
                      <span className="text-gray-400 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white transition-colors">→</span>
                    </a>
                 </li>
                 <li className="border-b border-gray-100 dark:border-white/10 py-2">
                    <a href="https://linkedin.com/in/coardmiller" target="_blank" rel="noopener noreferrer" className="flex justify-between hover:pl-2 transition-all duration-300 group">
                      <span>LinkedIn</span> 
                      <span className="text-gray-400 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white transition-colors">→</span>
                    </a>
                 </li>
              </ul>
            </RevealOnScroll>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CV;
