Frontend Developer Guide: Session-Based Authentication

Overview

The API uses cookie-based session authentication. This is a single-user system (no username required) - just a password. The browser handles cookies
automatically, so after login, all subsequent requests are authenticated without any extra work.

How It Works

1. Login: Send password to /auth/login. Server validates it and sets a session cookie (connect.sid).
2. Authenticated Requests: Browser automatically includes the cookie on all requests to the same domain.
3. Logout: Call /auth/logout to destroy the session.

The cookie is httpOnly (JavaScript can't read it) and sameSite: lax (protects against CSRF on most requests).

---

API Endpoints

Check Authentication Status

GET /auth/session
Response:
{ "authenticated": true } // logged in
{ "authenticated": false } // not logged in

Use this on page load to check if user is already logged in.

---

Login

POST /auth/login
Content-Type: application/json

{ "password": "user-password" }

Success (200):
{ "success": true }
Cookie connect.sid is set automatically.

Wrong Password (401):
{ "error": "Invalid credentials" }

Missing Password (400):
{ "error": "Password is required" }

---

Logout

POST /auth/logout

Response:
{ "success": true }
Session cookie is cleared.

---

Protected Routes

Once logged in, these routes work automatically:

GET /job-report → Daily job application report
GET /job-report-all → Heatmap calendar data

If not authenticated (401):
{ "error": "Authentication required" }

---

Frontend Implementation Example (React/Next.js)

// Check if user is logged in
async function checkAuth(): Promise<boolean> {
const res = await fetch('/auth/session', { credentials: 'include' });
const data = await res.json();
return data.authenticated;
}

// Login
async function login(password: string): Promise<{ success: boolean; error?: string }> {
const res = await fetch('/auth/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
credentials: 'include', // Important: allows cookies to be set
body: JSON.stringify({ password }),
});

    const data = await res.json();

    if (res.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }

}

// Logout
async function logout(): Promise<void> {
await fetch('/auth/logout', {
method: 'POST',
credentials: 'include',
});
}

// Fetch protected data
async function getJobReport() {
const res = await fetch('/job-report', { credentials: 'include' });

    if (res.status === 401) {
      // Not authenticated - redirect to login
      window.location.href = '/login';
      return null;
    }

    return res.json();

}

---

Important Notes

1. credentials: 'include' - Must be set on all fetch requests for cookies to work. This tells the browser to send/receive cookies.
2. CORS (if frontend is on different domain): The API needs CORS configuration with credentials: true and explicit Access-Control-Allow-Origin (can't use \* with
   credentials).
3. Session Duration: Sessions expire after 24 hours (configurable via SESSION_MAX_AGE_HOURS).
4. No CSRF Token Needed: The sameSite: lax cookie setting provides protection. POST requests from other sites won't include the cookie.
5. Error Handling: Always check for 401 responses on protected routes - redirect to login page when received.

---

Login Form Component Example

function LoginForm() {
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
      e.preventDefault();
      setError('');
      setLoading(true);

      const result = await login(password);

      if (result.success) {
        window.location.href = '/dashboard';  // or use router
      } else {
        setError(result.error || 'Login failed');
      }

      setLoading(false);
    }

    return (
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    );

}

---

Response Types (TypeScript)

interface LoginRequest {
password: string;
}

interface LoginResponse {
success: boolean;
}

interface AuthErrorResponse {
error: string;
}

interface SessionStatusResponse {
authenticated: boolean;
}
