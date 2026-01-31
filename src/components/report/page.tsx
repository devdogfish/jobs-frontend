import { useEffect, useState } from "react";
import { Newspaper } from "./Newspaper";
import { reportApi } from "../../api/client";
import type { DailyApplicationReport } from "@/types/newspaper";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getTodayISOString } from "@/utils";

export function ReportPage() {
  const [report, setReport] = useState<DailyApplicationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noData, setNoData] = useState(false);

  const { date: dateParam } = useParams();
  const navigate = useNavigate();
  const todayISO = getTodayISOString();

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      setError(null);
      setNoData(false);

      const response = await reportApi.getReport(dateParam ?? undefined);

      if (response.error) {
        // If there's an error and we're not on today's date, redirect to today
        if (dateParam && dateParam !== todayISO) {
          navigate(`/report/${todayISO}`, { replace: true });
          return;
        }
        setError(response.error);
      } else if (response.data) {
        setReport(response.data);
      } else {
        // No data returned
        if (dateParam && dateParam !== todayISO) {
          // Not today's date and no data - redirect to today
          navigate(`/report/${todayISO}`, { replace: true });
          return;
        }
        // Today's date but no data - show fallback UI
        setNoData(true);
      }

      setLoading(false);
    }

    fetchReport();
  }, [dateParam, navigate, todayISO]);

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

  if (noData || !report) {
    return (
      <div className="min-h-screen bg-[#fdf6e3] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="font-serif text-2xl text-[#1a1a1a] mb-2">
            No Applications Today
          </div>
          <div className="text-[#666] font-serif mb-6">
            There are no job applications recorded for {dateParam || todayISO}.
          </div>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-[#1a1a1a] text-[#fdf6e3] font-serif hover:bg-[#333] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return <Newspaper report={report} />;
}
