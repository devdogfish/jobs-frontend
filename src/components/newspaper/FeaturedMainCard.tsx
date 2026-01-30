'use client';

import type { Application } from '@/types/newspaper';

interface FeaturedMainCardProps {
  application: Application;
}

export function FeaturedMainCard({ application }: FeaturedMainCardProps) {
  const matchClass = application.matchLevel === 'high' 
    ? 'text-[#1a7f37] font-bold' 
    : application.matchLevel === 'medium' 
    ? 'text-[#d2a106] font-bold' 
    : '';

  return (
    <article 
      onClick={() => window.open(application.href, '_blank')}
      className="md:col-start-1 md:col-end-2 md:row-start-1 md:row-end-3 border border-[#2b2b2b] p-5 bg-[#fbfbfb] flex flex-col justify-between transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#2b2b2b] cursor-pointer"
    >
      <div>
        <span className="font-['Courier_New',monospace] text-xs text-[#666] uppercase mb-2 block">
          {application.location} • {application.compensation.displayValue}
        </span>
        <h2 className="font-['Playfair_Display',serif] font-bold uppercase tracking-[-0.5px] text-[2rem] leading-[1.1] mb-4">
          {application.position}
        </h2>
        <div className="mb-2">
          <span className="inline-block bg-[#2b2b2b] text-white px-1.5 py-0.5 text-[0.7rem] font-sans uppercase mr-1.5">
            {application.company}
          </span>
          {application.matchPercentage && (
            <span className={matchClass}>
              {application.matchPercentage}% Match
            </span>
          )}
        </div>
        <hr className="border-0 border-t border-[#ccc] my-4" />
        <p className="text-[1.1rem] leading-[1.6]">
          {application.description}
        </p>
      </div>
      {application.caption && (
        <div className="mt-5 italic text-[0.9rem]">
          {application.caption}
        </div>
      )}
    </article>
  );
}
