"use client";

import { useState } from "react";
import type { Application } from "@/types/application";

interface FeaturedMainCardProps {
  application: Application;
}

const CHAR_LIMIT = 1000;

export function FeaturedMainCard({ application }: FeaturedMainCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isTruncated = application.description.length > CHAR_LIMIT;
  const displayText =
    isExpanded || !isTruncated
      ? application.description
      : application.description.slice(0, CHAR_LIMIT);

  const handleClick = () => {
    if (isTruncated && !isExpanded) {
      setIsExpanded(true);
    } else {
      window.open(application.href, "_blank");
    }
  };

  const matchClass =
    application.match >= 80
      ? "text-[#1a7f37] font-bold"
      : application.match >= 50
        ? "text-[#d2a106] font-bold"
        : "";

  return (
    <article
      onClick={handleClick}
      className="h-full border border-[#2b2b2b] p-5 bg-[#fbfbfb] flex flex-col justify-between transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#2b2b2b] cursor-pointer"
    >
      <div>
        <span className="font-['Courier_New',monospace] text-xs text-[#666] uppercase mb-2 block">
          {application.location}
          {application.salary?.displayValue &&
            application.salary.displayValue.toLowerCase() !==
              "not specified" && (
              <> • {application.salary.displayValue}</>
            )}
        </span>
        <h2 className="font-['Playfair_Display',serif] font-bold uppercase tracking-[-0.5px] text-[2rem] leading-[1.1] mb-4">
          {application.role}
        </h2>
        <div className="mb-2">
          <span className="inline-block bg-[#2b2b2b] text-white px-1.5 py-0.5 text-[0.7rem] font-sans uppercase mr-1.5">
            {application.company}
          </span>
          {application.match && (
            <span className={matchClass}>
              {application.match}% Match
            </span>
          )}
        </div>
        <hr className="border-0 border-t border-[#ccc] my-4" />
        <p className="text-[1.1rem] leading-[1.6]">
          {displayText}
          {isTruncated && !isExpanded && (
            <span className="text-[#666] italic"> ...more</span>
          )}
        </p>
      </div>
    </article>
  );
}
