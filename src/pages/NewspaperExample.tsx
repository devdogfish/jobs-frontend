import { Newspaper } from "../components/newspaper/Newspaper";
import type { DailyApplicationReport } from "@/types/newspaper";

// Sample data matching the HTML example
const sampleReport: DailyApplicationReport = {
  metadata: {
    issueNumber: 1,
    date: "2026-01-29",
    totalApplications: 8,
    highPriorityCount: 3,
    averageSalary: "$145K",
  },
  featuredApplications: {
    main: {
      position: "Senior Creative Developer",
      company: "Starlight Studios",
      location: "San Francisco (Remote)",
      locationType: "remote",
      compensation: {
        type: "range",
        currency: "USD",
        min: 160000,
        max: 190000,
        displayValue: "$160k - $190k",
      },
      matchPercentage: 95,
      matchLevel: "high",
      description:
        "Ideally seeking a specialist in WebGL and React. The role involves building immersive marketing experiences for Tier-1 tech clients. Perfect alignment with scroll-driven animation portfolio and recent Three.js experiments.",
      caption: "Cover letter drafted.",
      priority: "featured-main",
      href: "https://example.com/job/1",
      resumeId: "resume-001",
    },
    secondary: [
      {
        position: "Full Stack Engineer",
        company: "FinTech Corp",
        location: "New York",
        locationType: "on-site",
        compensation: {
          type: "salary",
          currency: "USD",
          amount: 150000,
          displayValue: "$150k",
        },
        matchPercentage: 90,
        matchLevel: "high",
        description:
          "Heavy focus on Node.js backend pipelines and real-time data visualization. Requires strong Python knowledge for legacy integrations.",
        priority: "featured-side",
        href: "https://example.com/job/2",
        resumeId: "resume-002",
      },
      {
        position: "Frontend Architect",
        company: "Veloce",
        location: "Austin, TX",
        locationType: "hybrid",
        compensation: {
          type: "salary",
          currency: "USD",
          amount: 135000,
          displayValue: "$135k",
        },
        matchPercentage: 85,
        matchLevel: "medium",
        description:
          "Leading the migration from Vue to Next.js. looking for someone to establish strict TypeScript standards.",
        priority: "featured-side",
        href: "https://example.com/job/3",
        resumeId: "resume-003",
      },
    ],
  },
  otherApplications: [
    {
      position: "React Developer",
      company: "Agency X",
      location: "Remote",
      locationType: "remote",
      compensation: {
        type: "salary",
        currency: "USD",
        amount: 120000,
        displayValue: "$120k",
      },
      description: "Standard e-commerce build.",
      priority: "standard",
      href: "https://example.com/job/4",
      resumeId: "resume-004",
    },
    {
      position: "Python Engineer",
      company: "DataFlow",
      location: "Seattle",
      locationType: "on-site",
      compensation: {
        type: "salary",
        currency: "USD",
        amount: 140000,
        displayValue: "$140k",
      },
      description: "Automation & scraping focus.",
      priority: "standard",
      href: "https://example.com/job/5",
      resumeId: "resume-005",
    },
    {
      position: "UI/UX Technologist",
      company: "Design Co.",
      location: "London",
      locationType: "on-site",
      compensation: {
        type: "salary",
        currency: "GBP",
        amount: 85000,
        displayValue: "£85k",
      },
      description: "Prototyping tools team.",
      priority: "standard",
      href: "https://example.com/job/6",
      resumeId: "resume-006",
    },
    {
      position: "WebGL Specialist",
      company: "Freelance",
      location: "Contract",
      compensation: {
        type: "hourly",
        currency: "USD",
        amount: 90,
        displayValue: "$90/hr",
      },
      description: "3-month project.",
      priority: "standard",
      href: "https://example.com/job/7",
      resumeId: "resume-007",
    },
    {
      position: "Growth Engineer",
      company: "SaaS Startup",
      location: "Remote",
      locationType: "remote",
      compensation: {
        type: "salary",
        currency: "USD",
        amount: 130000,
        displayValue: "$130k",
      },
      description: "Next.js & Analytics.",
      priority: "standard",
      href: "https://example.com/job/8",
      resumeId: "resume-008",
    },
  ],
};

export function NewspaperExample() {
  return <Newspaper report={sampleReport} />;
}
