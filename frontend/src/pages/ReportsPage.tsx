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
      intro="Structured intelligence summaries for review and sign-off. Exports should align with case and alert context and respect audit and RBAC expectations."
      panelCaption="Reserved for report templates, generation jobs, and export history."
    />
  );
}
