/**
 * AdminLoginPage.tsx
 * Owner login page (JWT).
 * UX upgrades:
 * - If already logged in, redirect straight to /admin.
 * - Clear errors, better feedback.
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { http, setToken, getToken } from "../api/http";
import { LoginResponse } from "../api/types";

export default function AdminLoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ✅ If token exists, go straight to dashboard
  React.useEffect(() => {
    const token = getToken();
    if (token) nav("/admin", { replace: true });
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setBusy(true);
      const res = await http.post<LoginResponse>("/api/auth/login", { email, password });
      setToken(res.token);
      nav("/admin", { replace: true });
    } catch (e: any) {
      setError(e?.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <Card className="space-y-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-white/60">Owner</div>
          <h1 className="mt-1 text-xl font-semibold text-white">Login</h1>
          <p className="mt-2 text-sm text-white/65">
            Only the owner can upload or delete content. Viewers cannot edit anything.
          </p>
        </div>

        <form onSubmit={submit} className="grid gap-3">
          <label className="text-xs text-white/70">
            Email
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="owner@email.com"
            />
          </label>

          <label className="text-xs text-white/70">
            Password
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••••"
            />
          </label>

          {error && <div className="text-sm text-red-300">{error}</div>}

          <Button type="submit" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
