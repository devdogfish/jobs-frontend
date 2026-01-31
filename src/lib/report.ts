import type { Application } from "@/types/application";
import type {
  DailyApplicationReport,
  ReportMetadata,
  FeaturedApplications,
} from "@/types/report";

export function calculateIssueNumber(date: string): number {
  const startDate = new Date("2025-01-01");
  const currentDate = new Date(date);
  const diffTime = currentDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

export function calculateAverageSalary(applications: Application[]): string {
  const salariesWithAmounts = applications.filter((app) => app.salary.amount);
  if (salariesWithAmounts.length === 0) return "N/A";

  const total = salariesWithAmounts.reduce(
    (sum, app) => sum + (app.salary.amount || 0),
    0
  );
  const avg = total / salariesWithAmounts.length;

  if (avg >= 1000) {
    return `$${Math.round(avg / 1000)}k`;
  }
  return `$${Math.round(avg)}`;
}

export function buildReport(
  applications: Application[],
  date: string
): DailyApplicationReport {
  // Sort by match score descending
  const sorted = [...applications].sort((a, b) => b.match - a.match);

  // High priority = match >= 80
  const highPriorityCount = sorted.filter((app) => app.match >= 80).length;

  // Featured: main is highest match, secondary are next 2
  const main = sorted[0];
  const secondary = sorted.slice(1, 3);
  const otherApplications = sorted.slice(3);

  const featuredApplications: FeaturedApplications = {
    main,
    secondary,
  };

  const metadata: ReportMetadata = {
    issueNumber: calculateIssueNumber(date),
    date: new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    totalApplications: applications.length,
    highPriorityCount,
    averageSalary: calculateAverageSalary(applications),
  };

  return {
    metadata,
    featuredApplications,
    otherApplications,
  };
}
