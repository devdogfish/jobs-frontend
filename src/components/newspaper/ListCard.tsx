import type { Application } from "@/types/newspaper";

interface ListCardProps {
  application: Application;
}

export function ListCard({ application }: ListCardProps) {
  return (
    <div
      onClick={() => window.open(application.href, "_blank")}
      className="border border-[#ddd] p-4 transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#2b2b2b] cursor-pointer"
    >
      <span className="font-['Courier_New',monospace] text-[0.7rem] text-[#666] uppercase mb-2 block">
        {application.location} • {application.compensation.displayValue}
      </span>
      <h3 className="font-['Playfair_Display',serif] font-bold uppercase tracking-[-0.5px] text-base mb-1.5">
        {application.position}
      </h3>
      <p className="text-[0.85rem] mt-1.5 font-bold">{application.company}</p>
      <p className="text-[0.8rem] text-[#666]">{application.description}</p>
    </div>
  );
}
