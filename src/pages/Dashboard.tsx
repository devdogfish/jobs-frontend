import { useAuth } from "../hooks/useAuth";
import { NewspaperExample } from "./NewspaperExample";

export function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth("/login");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] flex items-center justify-center">
        <div className="text-center">
          <div className="font-['Playfair_Display',serif] font-bold text-2xl uppercase tracking-tight text-[#2b2b2b] animate-pulse">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <NewspaperExample />;
}
