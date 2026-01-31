import type { Application } from "./application";

// Formatted report structure (derived from Application[])
export interface DailyApplicationReport {
  metadata: ReportMetadata;
  featuredApplications: FeaturedApplications;
  otherApplications: Application[];
}

// Report metadata (header information)
export interface ReportMetadata {
  issueNumber: number;
  date: string;
  totalApplications: number;
  highPriorityCount: number;
  averageSalary: string;
}

// Featured applications with priority hierarchy
export interface FeaturedApplications {
  main?: Application;
  secondary: Application[];
}
