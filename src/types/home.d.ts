// Heatmap Calendar Types
export interface HeatmapDataPoint {
  date: string; // ISO date string (YYYY-MM-DD)
  count: number;
}

export interface HeatmapCalendarResponse {
  data: HeatmapDataPoint[];
  startDate: string;
  endDate: string;
  totalApplications: number;
}
