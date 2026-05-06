import { useEffect } from "react";
import { WorkspacePageBody } from "../components/workspace/WorkspacePageBody";

export function CasesPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Cases — Cockpit";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <WorkspacePageBody
      title="Cases"
      intro="Active investigations. Each case pulls together alerts and entities, and you can move them through statuses like triaged, investigating, escalated, contained, resolved, closed, false positive, or duplicate."
      panelCaption="Space for the case table, assignment, SLA info, and linked alerts and entities."
    />
  );
}
