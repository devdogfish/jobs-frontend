import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

export function LogoutButton() {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  if (!authContext) {
    throw new Error("LogoutButton must be used within AuthProvider");
  }

  const { logout } = authContext;

  async function handleLogout() {
    setLoading(true);
    await logout();
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="bg-white border border-[#2b2b2b] text-[#2b2b2b] py-2 px-4 font-['Courier_New',monospace] text-xs uppercase tracking-widest transition-all hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#2b2b2b] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
