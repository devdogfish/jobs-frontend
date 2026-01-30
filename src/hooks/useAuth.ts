import { checkAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

export function useAuth(redirectTo = "/login") {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      const authenticated = await checkAuth();
      setIsAuthenticated(authenticated);
      setIsLoading(false);

      if (!authenticated && redirectTo && typeof window !== "undefined") {
        window.location.href = redirectTo;
      }
    }

    verify();
  }, [redirectTo]);

  return { isAuthenticated, isLoading };
}
