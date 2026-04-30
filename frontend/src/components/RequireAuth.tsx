import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "../context/SupabaseAuthContext";

export function RequireAuth() {
  const { session, loading } = useSupabaseAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <span className="text-sm text-ink-muted">Loading…</span>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
