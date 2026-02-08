import { authApi } from "./api";

export async function checkAuth(): Promise<boolean> {
  const result = await authApi.checkSession();
  return result.data?.authenticated ?? false;
}

export async function login(
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const result = await authApi.login(password);

  if (result.error) {
    return { success: false, error: result.error };
  }

  return { success: true };
}

export async function logout(): Promise<void> {
  await authApi.logout();
}
