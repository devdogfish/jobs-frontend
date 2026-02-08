import { useMemo, useState } from "react";
import type { Application } from "@/types/application";
import { buildReport } from "@/lib/report";
import { FeaturedMainCard } from "./FeaturedMainCard";
import { FeaturedSideCard } from "./FeaturedSideCard";
import { ListCard } from "./ListCard";
import { MyScrollableSection, Navbar, Subtitle, Title } from "../shared";

interface NewspaperProps {
  applications: Application[];
  date?: string;
  backUrl?: string;
  loading?: boolean;
}

// Skeleton components for loading states
function HeaderSkeleton({ date }: { date: string }) {
  return (
    <Subtitle className="flex items-center justify-center gap-1">
      <div className="h-3 w-4 bg-muted-foreground/20 rounded animate-pulse inline-block" />
      <span> APPLICATIONS • ISSUE #</span>
      <div className="h-3 w-8 bg-muted-foreground/20 rounded animate-pulse inline-block" />
      <span> • {date} • AVG. </span>
      <div className="h-3 w-12 bg-muted-foreground/20 rounded animate-pulse inline-block" />
    </Subtitle>
  );
}

function FeaturedMainCardSkeleton() {
  return (
    <article className="h-full border border-[#2b2b2b] p-5 bg-[#fbfbfb] flex flex-col justify-between min-h-100">
      <div>
        {/* Location & salary */}
        <div className="h-3 w-32 bg-muted-foreground/20 rounded animate-pulse mb-2" />
        {/* Title */}
        <div className="h-10 w-3/4 bg-muted-foreground/20 rounded animate-pulse mb-4" />
        {/* Company badge & match */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-24 bg-[#2b2b2b]/20 rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted-foreground/20 rounded animate-pulse" />
        </div>
        <hr className="border-0 border-t border-[#ccc] my-4" />
        {/* Description lines */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted-foreground/20 rounded animate-pulse" />
          <div className="h-4 w-full bg-muted-foreground/20 rounded animate-pulse" />
          <div className="h-4 w-full bg-muted-foreground/20 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-muted-foreground/20 rounded animate-pulse" />
          <div className="h-4 w-full bg-muted-foreground/20 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-muted-foreground/20 rounded animate-pulse" />
        </div>
      </div>
    </article>
  );
}

function FeaturedSideCardSkeleton() {
  return (
    <article className="border border-[#2b2b2b] p-5 bg-white flex flex-col justify-center min-h-37.5">
      {/* Location & salary */}
      <div className="h-3 w-28 bg-muted-foreground/20 rounded animate-pulse mb-2" />
      {/* Title */}
      <div className="h-5 w-2/3 bg-muted-foreground/20 rounded animate-pulse mb-1.5" />
      {/* Company badge & match */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="h-5 w-20 bg-[#2b2b2b]/20 rounded animate-pulse" />
        <div className="h-4 w-14 bg-muted-foreground/20 rounded animate-pulse" />
      </div>
      {/* Description */}
      <div className="h-4 w-full bg-muted-foreground/20 rounded animate-pulse" />
    </article>
  );
}

function ListCardSkeleton() {
  return (
    <div className="border border-[#ddd] p-4">
      {/* Location & salary */}
      <div className="h-2.5 w-24 bg-muted-foreground/20 rounded animate-pulse mb-2" />
      {/* Title */}
      <div className="h-4 w-1/2 bg-muted-foreground/20 rounded animate-pulse mb-1.5" />
      {/* Company badge & match */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="h-5 w-16 bg-muted-foreground/10 border border-muted-foreground/20 rounded animate-pulse" />
        <div className="h-3 w-12 bg-muted-foreground/20 rounded animate-pulse" />
      </div>
      {/* Description */}
      <div className="h-3 w-3/4 bg-muted-foreground/20 rounded animate-pulse" />
    </div>
  );
}

export function Newspaper({
  applications,
  date,
  backUrl = "/",
  loading = false,
}: NewspaperProps) {
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
        <Navbar
          button={{
            link: backUrl,
            text: "Home",
            showButton: true,
          }}
          withShadow={isScrolled}
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <MyScrollableSection onScroll={handleScroll}>
          {/* Header */}
          <header className="text-center px-6 py-3">
            <Title text="The Daily Application" />
            {loading ? (
              <HeaderSkeleton date={metadata.date} />
            ) : (
              <Subtitle>
                {metadata.totalApplications} APPLICATIONS • {metadata.date} •
                AVG. {metadata.averageSalary}
              </Subtitle>
            )}
          </header>

          <div className="px-6 py-3">
            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {loading ? (
                <>
                  {/* Skeleton for main featured card */}
                  <div className="md:col-span-2 md:row-span-2">
                    <FeaturedMainCardSkeleton />
                  </div>
                  {/* Skeletons for side cards */}
                  <FeaturedSideCardSkeleton />
                  <FeaturedSideCardSkeleton />
                  {/* Skeletons for list cards */}
                  <ListCardSkeleton />
                  <ListCardSkeleton />
                  <ListCardSkeleton />
                </>
              ) : (
                <>
                  {/* Featured Main Application */}
                  {featuredApplications.main && (
                    <div className="md:col-span-2 md:row-span-2">
                      <FeaturedMainCard
                        application={featuredApplications.main}
                      />
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
                </>
              )}
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
