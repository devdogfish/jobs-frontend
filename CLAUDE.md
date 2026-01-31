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

## Build & Dev Commands
```bash
bun install      # Install dependencies
bun dev          # Start dev server
bun build        # Production build
tsc -b --noEmit  # Type check
```
