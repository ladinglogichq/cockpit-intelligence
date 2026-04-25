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
      intro="Triage-ready findings linked to entities and evidence artifacts. Severity, confidence, and priority follow the Cockpit scoring rubric; status transitions stay within the alert lifecycle until promoted to a case."
      panelCaption="Reserved for the alert list, filters, and detail drawer (linked entity ids, source artifact ids)."
    />
  );
}
