# Job Report Frontend - Project Context

## Project Overview
A React/Vite frontend for displaying daily job application reports with a newspaper-style UI.

## Tech Stack
- React with TypeScript
- Vite
- Tailwind CSS
- Bun as package manager

## Type System
The canonical type definitions are in `src/types/application.d.ts`. This file is the source of truth and should not be modified without explicit approval.

### Key Types
- `Application` - Core job application data with properties:
  - `id`, `company`, `role`, `location`, `locationType?`, `description`, `href`
  - `salary: { type, currency, amount?, displayValue }` - compensation info
  - `match: number` - 0-100 percentage indicating job fit
  - `date`, `status`, `tags[]`
- `DailyApplicationReport` - Full report with metadata, featured applications, and other applications
- `FeaturedApplications` - Main featured app + secondary featured apps
- `ReportMetadata` - Report header info (issue number, date, totals)
- `HeatmapDataPoint` / `HeatmapCalendarResponse` - For contribution-style calendar visualization

### Property Mappings (Historical Reference)
When updating components from old types:
- `matchLevel` → derived from `match` (>=80 = high, >=50 = medium)
- `compensation` → `salary`
- `position` → `role`
- `matchPercentage` → `match`
- `caption` → removed (no longer exists)

## Component Structure
- `src/components/report/` - Report card components (FeaturedMainCard, FeaturedSideCard, ListCard, Newspaper)
- `src/components/home/` - Homepage components including GitHub-style heatmap

## Data Validation Notes
- **Heatmap date validation**: The `generateHeatmapData` function in `page.tsx` filters out applications with invalid dates (must match `YYYY-MM-DD` format). This prevents applications with missing/malformed dates from grouping together and inflating the max count, which would throw off the color scaling.

## Progressive Loading Pattern
The home page (`src/components/home/page.tsx`) uses progressive loading for better UX:
- **No full-page loading block** - UI renders immediately with navbar, header, heatmap, and search bar visible
- **Lazy-loaded Mapbox** - The map component is loaded via `React.lazy()` with its own `Suspense` boundary and `MapSkeleton` fallback
- **Inline loading states** - The results list shows a loading indicator while data fetches, rather than blocking the whole page
- This allows the map to load its chunk independently and display its default spinning animation before application data arrives

## Build & Dev Commands
```bash
bun install      # Install dependencies
bun dev          # Start dev server
bun build        # Production build
tsc -b --noEmit  # Type check
```
