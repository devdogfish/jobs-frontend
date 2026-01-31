import { useState } from "react";
import { login } from "@/lib/auth";

export default function AuthPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(password);

    if (result.success) {
      window.location.href = "/";
    } else {
      setError(result.error || "Login failed");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-[#2b2b2b] font-serif leading-relaxed p-6 sm:p-10 flex items-center justify-center">
      <div className="max-w-125 w-full bg-[#fdfdfd] border border-[#dcdcdc] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-8 sm:p-12">
        {/* Newspaper-style header */}
        <header className="text-center mb-10">
          <h1 className="font-['Playfair_Display',serif] font-bold uppercase tracking-[-0.5px] text-[2rem] sm:text-[2.5rem] border-b-[3px] border-double border-[#2b2b2b] pb-2.5 mb-1.5">
            The Daily Application
          </h1>
          <div className="mt-3 font-['Courier_New',monospace] text-[0.7rem] text-[#666] uppercase tracking-wide">
            Editor's Access Required
          </div>
        </header>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block font-sans font-bold uppercase text-[0.7rem] tracking-wider mb-2.5 text-[#2b2b2b]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              className="w-full border border-[#2b2b2b] bg-white px-4 py-3 font-sans text-base
                       transition-all duration-200
                       focus:outline-none focus:shadow-[2px_2px_0px_#2b2b2b]
                       hover:shadow-[1px_1px_0px_#2b2b2b]
                       disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {error && (
            <div
              className="border border-[#d32f2f] bg-[#ffebee] px-4 py-3 text-[0.9rem] text-[#c62828]"
              role="alert"
            >
              <strong className="font-bold uppercase text-[0.75rem] mr-1">
                Error:
              </strong>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2b2b2b] text-white px-6 py-3.5 uppercase font-bold text-[0.85rem] tracking-wider
                     transition-all duration-200
                     hover:bg-[#1a1a1a] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_rgba(0,0,0,0.3)]
                     active:translate-y-0 active:shadow-none
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
                     font-sans"
          >
            {loading ? "Authenticating..." : "Enter"}
          </button>
        </form>

        {/* Footer tagline */}
        {/* Keep as comment <footer className="mt-10 pt-6 border-t border-[#dcdcdc] text-center">
          <p className="font-['Courier_New',monospace] text-[0.75rem] text-[#666] italic">
            "All the applications fit to print"
          </p>
        </footer> */}
      </div>
    </div>
  );
}
