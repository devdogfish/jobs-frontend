// Core application data structure (raw API response)
export interface Application {
  id: string;
  company: string;
  role: string;
  location: string;
  locationType?: "remote" | "hybrid" | "on-site";
  description: string;
  href: string;
  salary: {
    type: "salary" | "hourly" | "equity" | "range";
    currency: string;
    amount?: number;
    displayValue: string;
  };
  match: number; // percentage 0-100
  date: string; // ISO date (YYYY-MM-DD)
  status: string;
  tags: string[];
  eligible?: boolean; // undefined treated as eligible
  latitude?: number;
  longitude?: number;
}
