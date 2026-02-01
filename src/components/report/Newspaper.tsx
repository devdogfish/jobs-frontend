import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Application } from "@/types/application";
import { buildReport } from "@/lib/report";
import { FeaturedMainCard } from "./FeaturedMainCard";
import { FeaturedSideCard } from "./FeaturedSideCard";
import { ListCard } from "./ListCard";
import { LogoutButton } from "../auth/logout-button";
import {
  CardWithOptionalShadow,
  CenteredBox,
  MyScrollableSection,
  Navbar,
} from "../shared";

interface NewspaperProps {
  applications: Application[];
  date?: string;
}

export function Newspaper({ applications, date }: NewspaperProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  const reportDate = date || new Date().toISOString().split("T")[0];
  const report = useMemo(
    () => buildReport(applications, reportDate),
    [applications, reportDate],
  );

  const { metadata, featuredApplications, otherApplications } = report;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 0);
  };

  return (
    <div className="h-screen bg-background text-foreground font-sans leading-relaxed flex flex-col overflow-hidden">
      {/* Fixed Top Section */}
      <div className="shrink-0 bg-card z-10">
        <Navbar link="/" text="Home" withShadow={isScrolled} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <MyScrollableSection onScroll={handleScroll}>
          {/* Header */}
          <header className="text-center px-6 py-3">
            <h1 className="font-['Playfair_Display',serif] font-bold uppercase tracking-[-0.5px] text-[2.5rem] mb-1">
              The Daily Application
            </h1>
            <div className="font-['Courier_New',monospace] text-xs text-[#666] uppercase">
              {metadata.totalApplications} APPLICATIONS • ISSUE #
              {metadata.issueNumber} • {metadata.date} • AVG.{" "}
              {metadata.averageSalary}
            </div>
          </header>

          <div className="px-6 py-3">
            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Featured Main Application */}
              {featuredApplications.main && (
                <div className="md:col-span-2 md:row-span-2">
                  <FeaturedMainCard application={featuredApplications.main} />
                </div>
              )}

              {/* Featured Side Applications */}
              {featuredApplications.secondary.map((app, index) => (
                <FeaturedSideCard key={index} application={app} />
              ))}

              {/* Other Applications Section */}
              {otherApplications.map((app, index) => (
                <ListCard key={index} application={app} />
              ))}
            </div>
          </div>
        </MyScrollableSection>
      </div>
    </div>
  );
}

/**
Old containers:

<div className="min-h-screen bg-[#f4f4f0] text-[#2b2b2b] font-serif leading-relaxed flex justify-center">
        <div className="w-full bg-[#fdfdfd] p-10 flex flex-col gap-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)]" >
        </div>
      </div>
 */
