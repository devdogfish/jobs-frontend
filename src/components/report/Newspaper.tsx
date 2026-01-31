import type { DailyApplicationReport } from "@/types/application";
import { FeaturedMainCard } from "./FeaturedMainCard";
import { FeaturedSideCard } from "./FeaturedSideCard";
import { ListCard } from "./ListCard";
import { LogoutButton } from "../auth/logout-button";

interface NewspaperProps {
  report: DailyApplicationReport;
}

export function Newspaper({ report }: NewspaperProps) {
  const { metadata, featuredApplications, otherApplications } = report;

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-[#2b2b2b] font-serif leading-relaxed p-10 flex justify-center">
      <div className="max-w-225 w-full bg-[#fdfdfd] border border-[#dcdcdc] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-10 flex flex-col gap-5">
        {/* Header */}
        <header className="text-center mb-5">
          <h1 className="font-['Playfair_Display',serif] font-bold uppercase tracking-[-0.5px] text-[2.5rem] border-b-[3px] border-double border-[#2b2b2b] pb-2.5 mb-1.5">
            The Daily Application
          </h1>
          <div className="mt-2.5 font-['Courier_New',monospace] text-xs text-[#666] uppercase">
            {metadata.totalApplications} APPLICATIONS • ISSUE #
            {metadata.issueNumber} • {metadata.date} • AVG.{" "}
            {metadata.averageSalary}
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Featured Main Application */}
          {featuredApplications.main && (
            <div className="md:col-span-2 md:row-span-2">
              <FeaturedMainCard application={featuredApplications.main} />
            </div>
          )}

          {/* Featured Side Applications */}
          {featuredApplications.secondary.map((app, index) => (
            <FeaturedSideCard key={index} application={app} />
          ))}

          {/* Other Applications Section */}
          {otherApplications.map((app, index) => (
            <ListCard key={index} application={app} />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-5 border-t border-[#2b2b2b] pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-sans text-[0.85rem]">
          <div>
            <strong>NEXT ACTIONS: </strong>
            {/* Follow up with{" "}<em>Starlight Studios</em> (Thurs) &bull;  */}
            Update Portfolio
          </div>
          <LogoutButton />
          {/* IMPORTANT: Keep this here for now as is in case I want to update it later
          <button className="bg-[#2b2b2b] text-white px-4 py-2 uppercase font-bold text-[0.8rem] hover:bg-[#1a1a1a] transition-colors">
            Print Report
          </button> */}
        </footer>
      </div>
    </div>
  );
}
