import { useEffect } from "react";
import { WorkspacePageBody } from "../components/workspace/WorkspacePageBody";

export function ReportsPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Reports — Cockpit";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <WorkspacePageBody
      title="Reports"
      intro="Intelligence summaries you can review and sign off. Exports stay in sync with your cases and alerts, and follow audit and access rules."
      panelCaption="Space for report templates, generation jobs, and export history."
    />
  );
}
