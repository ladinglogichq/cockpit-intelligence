/** Primary workspace routes — shared by app shell header and dashboard sidebar. */
export const WORKSPACE_NAV = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Alerts", to: "/alerts" },
  { label: "Cases", to: "/cases" },
  { label: "Entities", to: "/entities" },
  { label: "Reports", to: "/reports" },
  { label: "API", to: "/api-keys" },
] as const;
