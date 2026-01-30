const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export async function checkAuth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/session`, {
      credentials: "include",
    });
    const data = await res.json();
    return data.authenticated;
  } catch {
    return false;
  }
}

export async function login(
  password: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (res.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.error || "Login failed" };
    }
  } catch (error) {
    return { success: false, error: "Network error. Please try again." };
  }
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}
