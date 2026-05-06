import { useEffect } from "react";
import { WorkspacePageBody } from "../components/workspace/WorkspacePageBody";

export function AlertsPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Alerts — Cockpit";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <WorkspacePageBody
      title="Alerts"
      intro="Findings ready for triage, linked to entities and evidence. Severity, confidence, and priority follow our scoring rubric. Status changes stay here until the alert gets promoted to a case."
      panelCaption="Space for the alert list, filters, and details panel showing linked entities and sources."
    />
  );
}
