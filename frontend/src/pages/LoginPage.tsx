import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "../context/SupabaseAuthContext";

export function LoginPage() {
  const { signInWithOtp, session, loading } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate(from, { replace: true });
  }, [session, loading, navigate, from]);

  useEffect(() => {
    const prev = document.title;
    document.title = "Sign in — Cockpit";
    return () => { document.title = prev; };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    const { error: err } = await signInWithOtp(trimmed);
    setSubmitting(false);
    if (err) { setError(err); return; }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          Sign in to Cockpit
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Enter your email and we'll send you a magic link.
        </p>

        {sent ? (
          <div className="mt-8 rounded-xl border border-ink/10 bg-canvas px-5 py-6 text-sm text-ink">
            <p className="font-medium">Check your email</p>
            <p className="mt-1 text-ink-muted">
              We sent a sign-in link to <strong>{email}</strong>. Click it to access your workspace.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-ink-muted">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/15 bg-canvas px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-ink/30 focus:outline-none focus:ring-1 focus:ring-ink/20"
                placeholder="you@example.com"
              />
            </div>

            {error ? (
              <p className="text-xs text-red-600" role="alert">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-canvas transition hover:bg-ink/90 disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
