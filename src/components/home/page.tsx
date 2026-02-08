import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import GitHubHeatmap from "@/components/home/github-heatmap";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { jobsApi } from "@/lib/api";
import type { Application } from "@/types/application";
import {
  CenteredBox,
  CardWithOptionalShadow,
  MyScrollableSection,
  Navbar,
} from "../shared";
import { cn } from "@/lib/utils";

// Lazy load the map component
const MyMap = lazy(() => import("./map"));

// Skeleton placeholder for map while loading
function MapSkeleton() {
  return (
    <div className="w-full h-full bg-muted/30 animate-pulse flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
    </div>
  );
}

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
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL search params
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || "",
  );
  const [filters, setFilters] = useState(() => ({
    status: searchParams.get("status") || "all",
    minMatch: Number(searchParams.get("minMatch")) || 0,
    location: searchParams.get("location") || "all",
    eligibility: (searchParams.get("eligibility") || "eligible") as
      | "eligible"
      | "all"
      | "non-eligible",
  }));
  const [isScrolled, setIsScrolled] = useState(false);
  const [renderedCount, setRenderedCount] = useState(15);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const DESCRIPTION_CHAR_LIMIT = 80;
  const INITIAL_RENDER_COUNT = 15;
  const RENDER_BUFFER = 10;
  const SCROLL_THRESHOLD = 200;
  const [showMapboxBorder, setShowMapboxBorder] = useState(false);

  const handleHeatmapCellClick = (date: string) => {
    // Build back URL with current search params
    const currentParams = searchParams.toString();
    const backUrl = currentParams ? `/?${currentParams}` : "/";
    navigate(`/report/${date}?backUrl=${encodeURIComponent(backUrl)}`);
  };

  const handleApplicationClick = (app: Application) => {
    console.log("Selected job:", app);
    if (selectedId === app.id) {
      // Deselect if clicking already-selected item
      setSelectedId(null);
    } else {
      // Select and scroll into view
      setSelectedId(app.id);

      setTimeout(() => {
        const element = document.getElementById(`job-card-${app.id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  const handleHoldStart = (app: Application) => {
    holdTimerRef.current = setTimeout(() => {
      window.open(app.href, "_blank");
    }, 500); // 500ms hold duration
  };

  const handleHoldEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
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

  // Keyboard shortcuts to focus search input and deselect with Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Escape key to deselect
      if (e.key === "Escape" && selectedId) {
        setSelectedId(null);
        return;
      }

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
  }, [selectedId]);

  // Sync search state to URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("q", searchQuery);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.minMatch > 0) params.set("minMatch", String(filters.minMatch));
    if (filters.location !== "all") params.set("location", filters.location);
    if (filters.eligibility !== "eligible")
      params.set("eligibility", filters.eligibility);

    setSearchParams(params, { replace: true });
  }, [searchQuery, filters, setSearchParams]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        searchQuery === "" ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        matchesSearch &&
        matchesStatus &&
        matchesMinMatch &&
        matchesLocation &&
        matchesEligibility
      );
    });
  }, [applications, searchQuery, filters]);

  // Handle click from map pin
  const handlePinClick = useCallback(
    (id: string) => {
      // 1. Mark as selected so it keeps the hover style
      setSelectedId(id);

      // 2. Find the index in filtered list to ensure it is rendered
      const index = filteredApplications.findIndex((app) => app.id === id);

      if (index !== -1) {
        // If the item is further down than what is currently rendered, expand the list
        if (index >= renderedCount) {
          setRenderedCount(index + 5);
        }

        // 3. Wait for render cycle to update DOM, then scroll
        setTimeout(() => {
          const element = document.getElementById(`job-card-${id}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }
    },
    [filteredApplications, renderedCount],
  );

  // Reset rendered count and scroll position when filters/search change
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setRenderedCount(INITIAL_RENDER_COUNT);
    scrollContainerRef.current?.scrollTo(0, 0);
    setIsScrolled(false);
    setSelectedId(null); // Deselect when filters change
  }, [searchQuery, filters]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Handle scroll events
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      setIsScrolled(target.scrollTop > 0);

      // Check if we're near the bottom to load more items
      const distanceFromBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight;
      if (distanceFromBottom < SCROLL_THRESHOLD) {
        setRenderedCount((prev) => {
          const next = prev + RENDER_BUFFER;
          return Math.min(next, filteredApplications.length);
        });
      }
    },
    [filteredApplications.length],
  );

  // Virtual scrolling: only render a subset of filtered applications
  const visibleApplications = useMemo(
    () => filteredApplications.slice(0, renderedCount),
    [filteredApplications, renderedCount],
  );

  // Generate heatmap data based on filtered results
  const heatmapData = useMemo(
    () => generateHeatmapData(filteredApplications),
    [filteredApplications],
  );

  // Calculate global max count from ALL applications (unfiltered) for consistent color scaling
  const globalMaxCount = useMemo(() => {
    const allHeatmapData = generateHeatmapData(applications);
    return Math.max(...allHeatmapData.map((d) => d.count), 1);
  }, [applications]);

  const uniqueStatuses = useMemo(
    () => [...new Set(applications.map((app) => app.status))],
    [applications],
  );
  const uniqueLocations = useMemo(
    () => [
      ...new Set(
        applications.map((app) => {
          if (app.location.toLowerCase().includes("remote")) return "Remote";
          if (app.location.toLowerCase().includes("contract"))
            return "Contract";
          return app.location.split(",")[0].split("(")[0].trim();
        }),
      ),
    ],
    [applications],
  );

  // Check if there are applications made today
  const hasApplicationsToday = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    return applications.some((app) => app.date === today);
  }, [applications]);

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
    <div className="h-screen text-foreground font-sans leading-relaxed flex flex-col overflow-hidden">
      {/* Fixed Top Section */}
      <div className="shrink-0  z-10">
        {/* Navigation */}
        <Navbar
          button={{
            link: `/report?backUrl=${encodeURIComponent(searchParams.toString() ? `/?${searchParams.toString()}` : "/")}`,
            text: "Daily Report",
            showButton: hasApplicationsToday,
          }}
        />

        {/* Header + Heatmap + Search in one unified block */}
        <CenteredBox>
          {/* Header */}
          <header className="text-center p-6 pb-9">
            <h1 className="font-serif font-bold uppercase tracking-[-0.5px] text-[1.75rem] sm:text-[2rem] mb-1">
              The Daily Application
            </h1>
            <div className="font-mono text-[0.7rem] text-muted-foreground uppercase tracking-wide">
              {filteredApplications.length}{" "}
              {searchQuery ||
              filters.status !== "all" ||
              filters.minMatch !== 0 ||
              filters.location !== "all" ||
              filters.eligibility !== "eligible"
                ? "Search Results"
                : "Applications"}{" "}
              • Jan 2026
            </div>
          </header>

          {/* Heatmap section with info box */}
          <div className="px-6 pb-3 border-b border-border flex gap-4 h-35.5">
            {/* Heatmap */}
            <div className="relative flex-1 min-w-0 h-full">
              <div className="h-full overflow-x-auto overflow-y-visible pb-1">
                <GitHubHeatmap
                  data={heatmapData}
                  maxCount={globalMaxCount}
                  startYear={2026}
                  endYear={2026}
                  colors={[
                    "#ebedf0",
                    "#d4d4d0",
                    "#a8a8a0",
                    "#666660",
                    "#2b2b2b",
                  ]}
                  cellSize={13}
                  cellGap={3}
                  showMonthLabels={true}
                  showWeekdayLabels={false}
                  renderTooltip={(cell) =>
                    `${cell.count} application${cell.count !== 1 ? "s" : ""} on ${cell.date}`
                  }
                  onCellClick={handleHeatmapCellClick}
                  className="[&_.github-heatmap]:p-0! [&_.heatmap-year]:mb-0! [&_.heatmap-title]:hidden [&_.heatmap-legend]:mt-2! [&_.heatmap-legend]:mb-1! h-full"
                />
              </div>

              {/* Shadow overlay on the right */}
              <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-linear-to-l from-white to-transparent" />
            </div>

            {/* Info box with Map */}
            <div
              className={cn(
                "shrink-0 flex items-center justify-center font-mono text-sm text-muted-foreground w-35.5 h-full relative shadow-[-30px_0_40px_8px_rgba(255,255,255,1)] border bg-transparent",
                "border border-transparent transition-all duration-300 ease-in-out",
                showMapboxBorder && " border-border",
              )}
            >
              <Suspense fallback={<MapSkeleton />}>
                <MyMap
                  applications={filteredApplications}
                  onPinClick={handlePinClick}
                  selectedId={selectedId}
                  onZoomChange={(isAtZoomZero) =>
                    setShowMapboxBorder(!isAtZoomZero)
                  }
                />
              </Suspense>
            </div>
          </div>

          {/* Search + Filters */}
          <CardWithOptionalShadow showShadow={isScrolled}>
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
                      {filters.eligibility === "non-eligible" &&
                        "Non-Eligible Only"}
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
          </CardWithOptionalShadow>
        </CenteredBox>
      </div>

      {/* Scrollable Results Section */}
      <MyScrollableSection
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className=""
      >
        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="inline-block w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mb-3" />
            <p className="font-mono text-muted-foreground text-sm">
              Loading applications...
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-mono text-muted-foreground text-sm">
              No applications found matching your criteria.
            </p>
          </div>
        ) : (
          visibleApplications.map((app) => {
            const isSelected = app.id === selectedId;
            const isTruncated =
              !isSelected && app.description.length > DESCRIPTION_CHAR_LIMIT;
            const displayText = isTruncated
              ? app.description.slice(0, DESCRIPTION_CHAR_LIMIT)
              : app.description;

            return (
              <article
                key={app.id}
                id={`job-card-${app.id}`}
                onClick={() => handleApplicationClick(app)}
                onMouseDown={() => handleHoldStart(app)}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchStart={() => handleHoldStart(app)}
                onTouchEnd={handleHoldEnd}
                className={`px-6 py-4 transition-all duration-200 cursor-pointer group ${
                  isSelected ? "bg-accent" : "hover:bg-accent"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-[0.7rem] text-muted-foreground uppercase block mb-1">
                      {app.location}
                      {app.salary?.displayValue &&
                        app.salary.displayValue.toLowerCase() !==
                          "not specified" && <> • {app.salary.displayValue}</>}
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
                    <p className="text-[0.9rem] text-muted-foreground leading-snug">
                      {displayText}
                      {isTruncated && (
                        <span className="text-[#666] italic">...</span>
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
              Showing {visibleApplications.length} of{" "}
              {filteredApplications.length} applications — scroll for more
            </p>
          </div>
        )}
      </MyScrollableSection>
    </div>
  );
}
