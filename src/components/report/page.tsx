import { useEffect, useState } from "react";
import { Newspaper } from "./Newspaper";
import { jobsApi } from "../../api/client";
import type { Application } from "@/types/application";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getTodayISOString } from "@/lib/utils";

export function ReportPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { date: dateParam } = useParams();
  const navigate = useNavigate();
  const todayISO = getTodayISOString();

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError(null);

      const response = await jobsApi.getJobs(dateParam ?? undefined);

      if (response.error) {
        // If there's an error and we're not on today's date, redirect to today
        if (dateParam && dateParam !== todayISO) {
          navigate(`/report/${todayISO}`, { replace: true });
          return;
        }
        setError(response.error);
        // Even on error, we may have an empty applications array
        setApplications(response.data || []);
      } else if (response.data && response.data.length > 0) {
        setApplications(response.data);
      } else {
        // No data returned or empty array
        if (dateParam && dateParam !== todayISO) {
          // Not today's date and no data - redirect to today
          navigate(`/report/${todayISO}`, { replace: true });
          return;
        }
        // Today's date but no data
        setApplications([]);
      }

      setLoading(false);
    }

    fetchJobs();
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

  if (applications.length === 0) {
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

  return <Newspaper applications={applications} date={dateParam || todayISO} />;
}
