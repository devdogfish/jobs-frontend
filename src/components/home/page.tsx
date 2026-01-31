import { useState, useRef, useEffect, useMemo } from "react";
import GitHubHeatmap from "@/components/home/github-heatmap";
import { Search, SlidersHorizontal, LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Sample data - replace later
const SAMPLE_APPLICATIONS = [
  {
    id: 1,
    company: "Starlight Studios",
    role: "Senior Creative Developer",
    location: "San Francisco (Remote)",
    salary: "$160k - $190k",
    match: 95,
    date: "2026-01-28",
    status: "Cover letter drafted",
    description:
      "Seeking a specialist in WebGL and React for immersive marketing experiences.",
    tags: ["React", "WebGL", "Three.js"],
  },
  {
    id: 2,
    company: "FinTech Corp",
    role: "Full Stack Engineer",
    location: "New York",
    salary: "$150k",
    match: 90,
    date: "2026-01-27",
    status: "Applied",
    description: "Node.js backend pipelines and real-time data visualization.",
    tags: ["Node.js", "Python", "Data Viz"],
  },
  {
    id: 3,
    company: "Veloce",
    role: "Frontend Architect",
    location: "Austin, TX",
    salary: "$135k",
    match: 85,
    date: "2026-01-25",
    status: "Interview scheduled",
    description:
      "Leading the migration from Vue to Next.js with strict TypeScript standards.",
    tags: ["Next.js", "TypeScript", "Vue"],
  },
  {
    id: 4,
    company: "Agency X",
    role: "React Developer",
    location: "Remote",
    salary: "$120k",
    match: 78,
    date: "2026-01-22",
    status: "Pending",
    description: "Standard e-commerce build with modern React patterns.",
    tags: ["React", "E-commerce"],
  },
  {
    id: 5,
    company: "DataFlow",
    role: "Python Engineer",
    location: "Seattle",
    salary: "$140k",
    match: 72,
    date: "2026-01-20",
    status: "Applied",
    description: "Automation & scraping focus with data pipeline expertise.",
    tags: ["Python", "Automation", "Scraping"],
  },
  {
    id: 6,
    company: "Design Co.",
    role: "UI/UX Technologist",
    location: "London",
    salary: "£85k",
    match: 80,
    date: "2026-01-18",
    status: "Pending",
    description: "Prototyping tools team building next-gen design software.",
    tags: ["UI/UX", "Prototyping", "Figma"],
  },
  {
    id: 7,
    company: "SaaS Startup",
    role: "Growth Engineer",
    location: "Remote",
    salary: "$130k",
    match: 82,
    date: "2026-01-15",
    status: "Applied",
    description: "Next.js & Analytics focused growth engineering role.",
    tags: ["Next.js", "Analytics", "Growth"],
  },
  {
    id: 8,
    company: "Freelance",
    role: "WebGL Specialist",
    location: "Contract",
    salary: "$90/hr",
    match: 88,
    date: "2026-01-10",
    status: "Negotiating",
    description: "3-month project building interactive 3D experiences.",
    tags: ["WebGL", "Three.js", "Contract"],
  },
];

// Generate heatmap data from applications
function generateHeatmapData(applications: typeof SAMPLE_APPLICATIONS) {
  const dataMap = new Map<string, number>();
  applications.forEach((app) => {
    const count = dataMap.get(app.date) || 0;
    dataMap.set(app.date, count + 1);
  });
  return Array.from(dataMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    minMatch: 0,
    location: "all",
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return SAMPLE_APPLICATIONS.filter((app) => {
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

      return (
        matchesSearch && matchesStatus && matchesMinMatch && matchesLocation
      );
    });
  }, [searchQuery, filters]);

  // Generate heatmap data based on filtered results
  const heatmapData = useMemo(
    () => generateHeatmapData(filteredApplications),
    [filteredApplications],
  );

  const uniqueStatuses = [
    ...new Set(SAMPLE_APPLICATIONS.map((app) => app.status)),
  ];
  const uniqueLocations = [
    ...new Set(
      SAMPLE_APPLICATIONS.map((app) => {
        if (app.location.toLowerCase().includes("remote")) return "Remote";
        if (app.location.toLowerCase().includes("contract")) return "Contract";
        return app.location.split(",")[0].split("(")[0].trim();
      }),
    ),
  ];

  return (
    <div className="h-screen bg-background text-foreground font-sans leading-relaxed flex flex-col overflow-hidden">
      {/* Fixed Top Section */}
      <div className="flex-shrink-0 bg-card z-10">
        {/* Navigation */}
        <nav>
          <div className="max-w-[900px] mx-auto px-6 py-2.5 flex items-center justify-between border-x border-b border-border">
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
        <div className="max-w-[900px] mx-auto border-x border-border">
          {/* Header */}
          <header className="text-center px-6 pt-5 pb-3">
            <h1 className="font-serif font-bold uppercase tracking-[-0.5px] text-[1.75rem] sm:text-[2rem] border-b-[3px] border-double border-foreground pb-2 mb-1">
              The Daily Application
            </h1>
            <div className="font-mono text-[0.7rem] text-muted-foreground uppercase tracking-wide">
              {filteredApplications.length} Applications • Jan 2026
            </div>
          </header>

          {/* Heatmap section with info box */}
          <div className="px-6 pb-3 border-b border-border flex gap-4">
            {/* Heatmap - horizontally scrollable, matches box height */}
            <div className="overflow-x-auto flex-1 min-w-0" style={{ height: 142 }}>
              <GitHubHeatmap
                data={heatmapData}
                startYear={2026}
                endYear={2026}
                colors={["#ebedf0", "#d4d4d0", "#a8a8a0", "#666660", "#2b2b2b"]}
                cellSize={12}
                cellGap={3}
                showMonthLabels={true}
                showWeekdayLabels={false}
                renderTooltip={(cell) =>
                  `${cell.count} application${cell.count !== 1 ? "s" : ""} on ${cell.date}`
                }
                className="[&_.github-heatmap]:!p-0 [&_.heatmap-year]:!mb-0 [&_.heatmap-title]:hidden [&_.heatmap-legend]:!mt-2 [&_.heatmap-legend]:!mb-1"
              />
            </div>

            {/* Info box - fixed square matching full heatmap height (without legend) */}
            <div
              className="flex-shrink-0 border border-border bg-card flex items-center justify-center font-mono text-sm text-muted-foreground"
              style={{ width: 142, height: 142 }}
            >
              Hello World
            </div>
          </div>

          {/* Search + Filters */}
          <div className="px-6 py-3 border-b border-border shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center gap-3">
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

                  <button
                    type="button"
                    onClick={() =>
                      setFilters({
                        status: "all",
                        minMatch: 0,
                        location: "all",
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
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[900px] mx-auto bg-card border-x border-border">
          <div className="divide-y divide-border">
            {filteredApplications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-mono text-muted-foreground text-sm">
                  No applications found matching your criteria.
                </p>
              </div>
            ) : (
              filteredApplications.map((app) => (
                <article
                  key={app.id}
                  className="px-6 py-4 transition-all duration-200 hover:bg-accent cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[0.7rem] text-muted-foreground uppercase block mb-1">
                        {app.location} • {app.salary}
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
                      <p className="text-[0.9rem] text-muted-foreground leading-snug line-clamp-1">
                        {app.description}
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


