import { lazy, Suspense, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";

/** Marketing site */
const BlogPage = lazy(async () => ({ default: (await import("./pages/BlogPage")).BlogPage }));
const ExploreDataPage = lazy(async () => ({ default: (await import("./pages/ExploreDataPage")).ExploreDataPage }));
const LandingPage = lazy(async () => ({ default: (await import("./pages/LandingPage")).LandingPage }));
const PlatformPage = lazy(async () => ({ default: (await import("./pages/PlatformPage")).PlatformPage }));
const PricingPage = lazy(async () => ({ default: (await import("./pages/PricingPage")).PricingPage }));
const RiskExposureMethodologyPage = lazy(async () => ({
  default: (await import("./pages/RiskExposureMethodologyPage")).RiskExposureMethodologyPage,
}));

/** Workspace shell + pages (sidebar + composer — single layout parent) */
const WorkspaceShellLayout = lazy(async () => ({
  default: (await import("./components/dashboard/WorkspaceShellLayout")).WorkspaceShellLayout,
}));
const DashboardPage = lazy(async () => ({ default: (await import("./pages/DashboardPage")).DashboardPage }));
const AlertsPage = lazy(async () => ({ default: (await import("./pages/AlertsPage")).AlertsPage }));
const CasesPage = lazy(async () => ({ default: (await import("./pages/CasesPage")).CasesPage }));
const EntitiesPage = lazy(async () => ({ default: (await import("./pages/EntitiesPage")).EntitiesPage }));
const ReportsPage = lazy(async () => ({ default: (await import("./pages/ReportsPage")).ReportsPage }));
const ApiKeysPage = lazy(async () => ({ default: (await import("./pages/ApiKeysPage")).ApiKeysPage }));

function RouteFallback({ message }: { message: string }) {
  return (
    <div className="mx-auto flex min-h-[40vh] w-full max-w-6xl items-center justify-center px-6 py-10">
      <div className="rounded-3xl border border-white/[0.08] bg-zinc-900/50 px-5 py-4 text-sm text-zinc-400 shadow-inner">
        {message}
      </div>
    </div>
  );
}

function withSuspense(node: ReactNode, message: string) {
  return <Suspense fallback={<RouteFallback message={message} />}>{node}</Suspense>;
}

export function App() {
  return (
    <Routes>
      {/* Marketing */}
      <Route path="/" element={withSuspense(<LandingPage />, "Loading landing page…")} />
      <Route path="/blog" element={withSuspense(<BlogPage />, "Loading blog…")} />
      <Route path="/explore-data" element={withSuspense(<ExploreDataPage />, "Loading dataset explorer…")} />
      <Route
        path="/methodology/risk-exposure"
        element={withSuspense(<RiskExposureMethodologyPage />, "Loading methodology…")}
      />
      <Route path="/platform" element={withSuspense(<PlatformPage />, "Loading platform…")} />
      <Route path="/pricing" element={withSuspense(<PricingPage />, "Loading pricing…")} />

      <Route element={withSuspense(<WorkspaceShellLayout />, "Loading workspace…")}>
        <Route path="/dashboard" element={withSuspense(<DashboardPage />, "Loading dashboard…")} />
        <Route path="/alerts" element={withSuspense(<AlertsPage />, "Loading alerts…")} />
        <Route path="/cases" element={withSuspense(<CasesPage />, "Loading cases…")} />
        <Route path="/entities" element={withSuspense(<EntitiesPage />, "Loading entities…")} />
        <Route path="/reports" element={withSuspense(<ReportsPage />, "Loading reports…")} />
        <Route path="/api-keys" element={withSuspense(<ApiKeysPage />, "Loading API keys…")} />
      </Route>
    </Routes>
  );
}
