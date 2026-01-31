"use client";

import { useState } from "react";
import type { Application } from "@/types/application";

interface ListCardProps {
  application: Application;
}

const CHAR_LIMIT = 50;

export function ListCard({ application }: ListCardProps) {
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
    <div
      onClick={handleClick}
      className="border border-[#ddd] p-4 transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#2b2b2b] cursor-pointer"
    >
      <span className="font-['Courier_New',monospace] text-[0.7rem] text-[#666] uppercase mb-2 block">
        {application.location}
        {application.salary?.displayValue &&
          application.salary.displayValue.toLowerCase() !==
            "not specified" && <> • {application.salary.displayValue}</>}
      </span>
      <h3 className="font-['Playfair_Display',serif] font-bold uppercase tracking-[-0.5px] text-base mb-1.5">
        {application.role}
      </h3>
      <div className="mb-1.5">
        <span className="inline-block border border-[#2b2b2b] text-[#2b2b2b] px-1.5 py-0.5 text-[0.7rem] font-sans uppercase mr-1.5">
          {application.company}
        </span>
        {application.match && (
          <span className={matchClass}>
            {application.match}% Match
          </span>
        )}
      </div>
      <p className="text-[0.8rem] text-[#666]">
        {displayText}
        {isTruncated && !isExpanded && (
          <span className="text-[#444] italic"> ...more</span>
        )}
      </p>
    </div>
  );
}
