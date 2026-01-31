import { useEffect, useState } from "react";
import { Newspaper } from "./Newspaper";
import { reportApi } from "../../api/client";
import type { DailyApplicationReport } from "@/types/newspaper";
import { useParams } from "react-router-dom";

export function ReportPage() {
  const [report, setReport] = useState<DailyApplicationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { date: dateParam } = useParams();

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      setError(null);

      const response = await reportApi.getReport(dateParam ?? undefined);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setReport(response.data);
      }

      setLoading(false);
    }

    fetchReport();
  }, [dateParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf6e3] flex items-center justify-center">
        <div className="text-center">
          <div className="font-serif text-2xl text-[#1a1a1a] mb-2">
            Loading today's report...
          </div>
          <div className="text-[#666] font-serif italic">
            Fetching the latest job applications
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fdf6e3] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="font-serif text-2xl text-[#1a1a1a] mb-2">
            Unable to load report
          </div>
          <div className="text-[#666] font-serif mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#1a1a1a] text-[#fdf6e3] font-serif hover:bg-[#333] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#fdf6e3] flex items-center justify-center">
        <div className="font-serif text-xl text-[#666]">
          No report available for today
        </div>
      </div>
    );
  }

  return <Newspaper report={report} />;
}
