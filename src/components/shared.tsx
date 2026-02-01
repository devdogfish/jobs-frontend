import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import React from "react";

export function CardWithOptionalShadow({
  children,
  showShadow,
  className,
}: {
  children: React.ReactNode;
  showShadow: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-6 py-3 border-b border-border flex items-center gap-3 transition-shadow duration-200 [clip-path:inset(0_0_-10px_0)]",
        showShadow && "shadow-[0_4px_8px_-2px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CenteredBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-225 mx-auto border-x border-border", className)}>
      {children}
    </div>
  );
}

export const MyScrollableSection = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
    className?: string;
  }
>(({ children, onScroll, className }, ref) => {
  return (
    <div ref={ref} className={cn("flex-1 overflow-y-auto", className)} onScroll={onScroll}>
      <div className="max-w-225 mx-auto bg-card border-x border-border min-h-full">
        <div className="divide-y divide-border">{children}</div>
      </div>
    </div>
  );
});

export function Navbar({
  link,
  text,
  withShadow = false,
}: {
  link: string;
  text: string
  withShadow?: boolean;
}) {
  return (
    <CenteredBox>
      <nav>
        <CardWithOptionalShadow
          className="justify-between"
          showShadow={withShadow}
        >
          {/* <div className="max-w-225 mx-auto px-6 py-2.5 flex items-center justify-between border-x border-b border-border"> */}
          <button
            type="button"
            className="font-mono text-[0.75rem] text-muted-foreground uppercase tracking-wide
                       border border-border bg-card px-3 py-1.5
                       transition-all duration-200
                       hover:shadow-[1px_1px_0px_#2b2b2b]
                       focus:outline-none focus:shadow-[2px_2px_0px_#2b2b2b]"
          >
            <LogOut className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5" />
            Log Out
          </button>
          <a
            href={link}
            className="bg-primary text-primary-foreground px-4 py-1.5 uppercase font-bold text-[0.75rem] tracking-wider font-sans
                       transition-all duration-200
                       hover:shadow-[1px_1px_0px_#2b2b2b]
                       focus:outline-none focus:shadow-[2px_2px_0px_#2b2b2b]"
          >
            {text}
          </a>
          {/* </div> */}
        </CardWithOptionalShadow>
      </nav>
    </CenteredBox>
  );
}
