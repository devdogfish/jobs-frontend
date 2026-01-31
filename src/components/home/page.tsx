import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import GitHubHeatmap from "@/components/home/github-heatmap";
import { Search, SlidersHorizontal, LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { jobsApi } from "@/api/client";
import type { Application } from "@/types/application";

// Virtual scrolling configuration
const INITIAL_RENDER_COUNT = 15; // Number of items to render initially
const RENDER_BUFFER = 10; // Number of items to render beyond visible area when scrolling
const SCROLL_THRESHOLD = 200; // Pixels from bottom to trigger loading more

// Generate heatmap data from applications
function generateHeatmapData(applications: Application[]) {
  const dataMap = new Map<string, number>();
  applications.forEach((app) => {
    // Skip applications with missing or invalid dates (YYYY-MM-DD format)
    if (!app.date || !/^\d{4}-\d{2}-\d{2}$/.test(app.date)) {
      return;
    }
    const count = dataMap.get(app.date) || 0;
    dataMap.set(app.date, count + 1);
  });
  return Array.from(dataMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

export default function HomePage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    minMatch: 0,
    location: "all",
    eligibility: "eligible" as "eligible" | "all" | "non-eligible",
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [renderedCount, setRenderedCount] = useState(INITIAL_RENDER_COUNT);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const DESCRIPTION_CHAR_LIMIT = 80;

  const handleHeatmapCellClick = (date: string) => {
    navigate(`/report/${date}`);
  };

  const toggleDescriptionExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleApplicationClick = (app: Application) => {
    window.open(app.href, "_blank");
  };

  // Fetch all jobs on mount
  useEffect(() => {
    async function fetchAllJobs() {
      setLoading(true);
      setError(null);
      const response = await jobsApi.getJobs();
      if (response.error) {
        setError(response.error);
        setApplications([]);
      } else {
        setApplications(response.data || []);
      }
      setLoading(false);
    }
    fetchAllJobs();
  }, []);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Keyboard shortcuts to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // "/" key (only when not typing)
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Cmd+k or Cmd+f
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "f")) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        searchQuery === "" ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesStatus =
        filters.status === "all" ||
        app.status.toLowerCase().includes(filters.status.toLowerCase());
      const matchesMinMatch = app.match >= filters.minMatch;
      const matchesLocation =
        filters.location === "all" ||
        app.location.toLowerCase().includes(filters.location.toLowerCase());

      // undefined is treated as eligible
      const isEligible = app.eligible !== false;
      const matchesEligibility =
        filters.eligibility === "all" ||
        (filters.eligibility === "eligible" && isEligible) ||
        (filters.eligibility === "non-eligible" && !isEligible);

      return (
        matchesSearch && matchesStatus && matchesMinMatch && matchesLocation && matchesEligibility
      );
    });
  }, [applications, searchQuery, filters]);

  // Reset rendered count when filters/search change
  useEffect(() => {
    setRenderedCount(INITIAL_RENDER_COUNT);
    // Also scroll to top when filters change
    scrollContainerRef.current?.scrollTo(0, 0);
  }, [searchQuery, filters]);

  // Virtual scrolling: only render a subset of filtered applications
  const visibleApplications = useMemo(
    () => filteredApplications.slice(0, renderedCount),
    [filteredApplications, renderedCount]
  );

  // Handle scroll to load more items
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setIsScrolled(target.scrollTop > 0);

    // Check if we're near the bottom
    const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (distanceFromBottom < SCROLL_THRESHOLD) {
      setRenderedCount((prev) => {
        const next = prev + RENDER_BUFFER;
        return Math.min(next, filteredApplications.length);
      });
    }
  }, [filteredApplications.length]);

  // Generate heatmap data based on filtered results
  const heatmapData = useMemo(
    () => generateHeatmapData(filteredApplications),
    [filteredApplications],
  );

  const uniqueStatuses = useMemo(
    () => [...new Set(applications.map((app) => app.status))],
    [applications]
  );
  const uniqueLocations = useMemo(
    () => [
      ...new Set(
        applications.map((app) => {
          if (app.location.toLowerCase().includes("remote")) return "Remote";
          if (app.location.toLowerCase().includes("contract")) return "Contract";
          return app.location.split(",")[0].split("(")[0].trim();
        }),
      ),
    ],
    [applications]
  );

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="font-serif text-2xl text-foreground mb-2">
            Loading applications...
          </div>
          <div className="text-muted-foreground font-serif italic">
            Fetching your job applications
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="font-serif text-2xl text-foreground mb-2">
            Unable to load applications
          </div>
          <div className="text-muted-foreground font-serif mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-foreground text-background font-serif hover:opacity-80 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground font-sans leading-relaxed flex flex-col overflow-hidden">
      {/* Fixed Top Section */}
      <div className="shrink-0 bg-card z-10">
        {/* Navigation */}
        <nav>
          <div className="max-w-225 mx-auto px-6 py-2.5 flex items-center justify-between border-x border-b border-border">
            <button
              type="button"
              className="font-mono text-[0.75rem] text-muted-foreground uppercase tracking-wide
                       border border-border bg-card px-3 py-1.5
                       transition-all duration-200
                       hover:shadow-[1px_1px_0px_#2b2b2b]
                       focus:outline-none focus:shadow-[2px_2px_0px_#2b2b2b]"
            >
              <LogOut className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5" />
              Log Out
            </button>

            <a
              href="/report"
              className="bg-primary text-primary-foreground px-4 py-1.5 uppercase font-bold text-[0.75rem] tracking-wider font-sans
                       transition-all duration-200
                       hover:shadow-[1px_1px_0px_#2b2b2b]
                       focus:outline-none focus:shadow-[2px_2px_0px_#2b2b2b]"
            >
              Daily Report
            </a>
          </div>
        </nav>

        {/* Header + Heatmap + Search in one unified block */}
        <div className="max-w-225 mx-auto border-x border-border">
          {/* Header */}
          <header className="text-center p-6 pb-9">
            <h1 className="font-serif font-bold uppercase tracking-[-0.5px] text-[1.75rem] sm:text-[2rem] mb-1">
              The Daily Application
            </h1>
            <div className="font-mono text-[0.7rem] text-muted-foreground uppercase tracking-wide">
              {filteredApplications.length} Applications • Jan 2026
            </div>
          </header>

          {/* Heatmap section with info box */}
          <div className="px-6 pb-3 border-b border-border flex gap-4 h-[142px]">
            {/* Heatmap - horizontally scrollable with custom scrollbar, matches box height */}
            <ScrollArea className="flex-1 min-w-0 h-full [&_[data-radix-scroll-area-viewport]>div]:!h-full [&_[data-radix-scroll-area-viewport]>div]:!block [&_[data-slot=scroll-area-scrollbar]]:absolute [&_[data-slot=scroll-area-scrollbar]]:top-0 [&_[data-slot=scroll-area-scrollbar]]:left-0 [&_[data-slot=scroll-area-scrollbar]]:right-0 [&_[data-slot=scroll-area-scrollbar]]:opacity-0 [&_[data-slot=scroll-area-scrollbar]]:hover:opacity-100 [&_[data-slot=scroll-area-scrollbar][data-state=visible]]:opacity-100 [&_[data-slot=scroll-area-scrollbar]]:transition-opacity">
              <GitHubHeatmap
                data={heatmapData}
                startYear={2026}
                endYear={2026}
                colors={["#ebedf0", "#d4d4d0", "#a8a8a0", "#666660", "#2b2b2b"]}
                cellSize={13}
                cellGap={3}
                showMonthLabels={true}
                showWeekdayLabels={false}
                renderTooltip={(cell) =>
                  `${cell.count} application${cell.count !== 1 ? "s" : ""} on ${cell.date}`
                }
                onCellClick={handleHeatmapCellClick}
                className="[&_.github-heatmap]:!p-0 [&_.heatmap-year]:!mb-0 [&_.heatmap-title]:hidden [&_.heatmap-legend]:!mt-2 [&_.heatmap-legend]:!mb-1 h-full"
              />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Info box - fixed square matching full heatmap height */}
            <div className="flex-shrink-0 border border-border bg-card flex items-center justify-center font-mono text-sm text-muted-foreground w-[142px] h-full relative shadow-[-24px_0_20px_-4px_rgba(255,255,255,0.9)]">
              Hello World
            </div>
          </div>

          {/* Search + Filters */}
          <div className={`px-6 py-3 border-b border-border flex items-center gap-3 transition-shadow duration-200 [clip-path:inset(0_0_-10px_0)] ${isScrolled ? "shadow-[0_4px_8px_-2px_rgba(0,0,0,0.08)]" : ""}`}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applications..."
                className="w-full border border-border bg-card pl-10 pr-4 py-2 font-sans text-sm
                         transition-all duration-200
                         focus:outline-none focus:shadow-[2px_2px_0px_#2b2b2b]
                         hover:shadow-[1px_1px_0px_#2b2b2b]
                         placeholder:text-muted-foreground"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="border border-border bg-card px-3 py-2 flex items-center gap-2
                           font-sans text-[0.75rem] uppercase tracking-wide font-bold
                           transition-all duration-200
                           hover:shadow-[1px_1px_0px_#2b2b2b]
                           focus:outline-none focus:shadow-[2px_2px_0px_#2b2b2b]
                           data-[state=open]:shadow-[2px_2px_0px_#2b2b2b]"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-64 p-4 border border-foreground shadow-[3px_3px_0px_#2b2b2b] bg-card"
                align="end"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block font-sans font-bold uppercase text-[0.65rem] tracking-wider mb-1.5 text-foreground">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, status: e.target.value }))
                      }
                      className="w-full border border-border bg-card px-3 py-1.5 font-sans text-sm
                               focus:outline-none focus:shadow-[2px_2px_0px_#2b2b2b]"
                    >
                      <option value="all">All Statuses</option>
                      {uniqueStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-sans font-bold uppercase text-[0.65rem] tracking-wider mb-1.5 text-foreground">
                      Min Match %
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={filters.minMatch}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          minMatch: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-foreground"
                    />
                    <div className="text-[0.7rem] font-mono text-muted-foreground mt-1">
                      {filters.minMatch}%+
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans font-bold uppercase text-[0.65rem] tracking-wider mb-1.5 text-foreground">
                      Location
                    </label>
                    <select
                      value={filters.location}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, location: e.target.value }))
                      }
                      className="w-full border border-border bg-card px-3 py-1.5 font-sans text-sm
                               focus:outline-none focus:shadow-[2px_2px_0px_#2b2b2b]"
                    >
                      <option value="all">All Locations</option>
                      {uniqueLocations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-sans font-bold uppercase text-[0.65rem] tracking-wider mb-1.5 text-foreground">
                      Eligibility
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          eligibility:
                            f.eligibility === "eligible"
                              ? "all"
                              : f.eligibility === "all"
                                ? "non-eligible"
                                : "eligible",
                        }))
                      }
                      className="w-full border border-border bg-card px-3 py-1.5 font-sans text-sm text-left
                               transition-all duration-200
                               hover:shadow-[1px_1px_0px_#2b2b2b]
                               focus:outline-none focus:shadow-[2px_2px_0px_#2b2b2b]"
                    >
                      {filters.eligibility === "eligible" && "Eligible Only"}
                      {filters.eligibility === "all" && "All Jobs"}
                      {filters.eligibility === "non-eligible" && "Non-Eligible Only"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setFilters({
                        status: "all",
                        minMatch: 0,
                        location: "all",
                        eligibility: "eligible",
                      })
                    }
                    className="w-full border border-border px-3 py-1.5 font-sans text-[0.7rem] uppercase tracking-wide
                             transition-all duration-200 hover:border-foreground hover:shadow-[1px_1px_0px_#2b2b2b]"
                  >
                    Clear Filters
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

        </div>
      </div>

      {/* Scrollable Results Section */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="max-w-[900px] mx-auto bg-card border-x border-border">
          <div className="divide-y divide-border">
            {filteredApplications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-mono text-muted-foreground text-sm">
                  No applications found matching your criteria.
                </p>
              </div>
            ) : (
              visibleApplications.map((app) => {
                const isExpanded = expandedIds.has(app.id);
                const isTruncated = app.description.length > DESCRIPTION_CHAR_LIMIT;
                const displayText = isExpanded || !isTruncated
                  ? app.description
                  : app.description.slice(0, DESCRIPTION_CHAR_LIMIT);

                return (
                  <article
                    key={app.id}
                    onClick={() => handleApplicationClick(app)}
                    className="px-6 py-4 transition-all duration-200 hover:bg-accent cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-[0.7rem] text-muted-foreground uppercase block mb-1">
                          {app.location}
                          {app.salary?.displayValue &&
                            app.salary.displayValue.toLowerCase() !== "not specified" && (
                              <> • {app.salary.displayValue}</>
                            )}
                        </span>
                        <h3 className="font-serif font-bold text-lg leading-tight mb-1 group-hover:underline underline-offset-2">
                          {app.role}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block bg-primary text-primary-foreground px-1.5 py-0.5 text-[0.65rem] font-sans uppercase">
                            {app.company}
                          </span>
                          <span
                            className={`font-bold text-[0.8rem] ${app.match >= 90 ? "text-[#1a7f37]" : app.match >= 80 ? "text-[#d2a106]" : "text-muted-foreground"}`}
                          >
                            {app.match}% Match
                          </span>
                        </div>
                        <p
                          onClick={(e) => {
                            if (isTruncated) {
                              e.stopPropagation();
                              toggleDescriptionExpanded(app.id);
                            }
                          }}
                          className={`text-[0.9rem] text-muted-foreground leading-snug ${isTruncated && !isExpanded ? "cursor-pointer" : ""}`}
                        >
                          {displayText}
                          {isTruncated && !isExpanded && (
                            <span className="text-[#666] italic"> ...read more</span>
                          )}
                          {isTruncated && isExpanded && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDescriptionExpanded(app.id);
                              }}
                              className="text-[#666] italic ml-1 hover:underline"
                            >
                              show less
                            </button>
                          )}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-[0.65rem] text-muted-foreground uppercase block mb-1">
                          {app.date}
                        </span>
                        <span className="inline-block border border-border px-2 py-0.5 text-[0.65rem] font-sans uppercase">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
            {/* Loading indicator when more items are available */}
            {visibleApplications.length < filteredApplications.length && (
              <div className="px-6 py-4 text-center">
                <p className="font-mono text-muted-foreground text-xs">
                  Showing {visibleApplications.length} of {filteredApplications.length} applications — scroll for more
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


