'use client';

import type { Application } from '@/types/newspaper';

interface FeaturedSideCardProps {
  application: Application;
}

export function FeaturedSideCard({ application }: FeaturedSideCardProps) {
  const matchClass = application.matchLevel === 'high' 
    ? 'text-[#1a7f37] font-bold' 
    : application.matchLevel === 'medium' 
    ? 'text-[#d2a106] font-bold' 
    : '';

  return (
    <article 
      onClick={() => window.open(application.href, '_blank')}
      className="md:col-start-2 md:col-end-3 border border-[#2b2b2b] p-5 bg-white flex flex-col justify-center transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#2b2b2b] cursor-pointer"
    >
      <span className="font-['Courier_New',monospace] text-xs text-[#666] uppercase mb-2 block">
        {application.location} • {application.compensation.displayValue}
      </span>
      <h3 className="font-['Playfair_Display',serif] font-bold uppercase tracking-[-0.5px] text-[1.1rem] mb-1.5">
        {application.position}
      </h3>
      <div className="mb-1.5">
        <span className="inline-block bg-[#2b2b2b] text-white px-1.5 py-0.5 text-[0.7rem] font-sans uppercase mr-1.5">
          {application.company}
        </span>
        {application.matchPercentage && (
          <span className={matchClass}>
            {application.matchPercentage}% Match
          </span>
        )}
      </div>
      <p className="text-[0.95rem] text-[#444]">
        {application.description}
      </p>
    </article>
  );
}
