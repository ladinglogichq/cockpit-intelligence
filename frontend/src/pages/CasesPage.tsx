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
      intro="Operational investigations: each case aggregates alerts and entities under allowed status transitions (new through triaged, investigating, escalated, contained, resolved, closed, false positive, duplicate)."
      panelCaption="Reserved for case table, assignment, SLA, and linked alerts / entities."
    />
  );
}
