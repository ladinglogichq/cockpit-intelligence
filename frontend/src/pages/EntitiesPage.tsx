import { useEffect } from "react";
import { WorkspacePageBody } from "../components/workspace/WorkspacePageBody";

export function EntitiesPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Entities — Cockpit";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <WorkspacePageBody
      title="Entities"
      intro="Regulation objects like jurisdictions, legal documents, clauses, and pillar mappings. Each one comes from an evidence record with a citation you can look up."
      panelCaption="Space for searching jurisdictions, seeing clause connections, and enrichment panels for data rules."
    />
  );
}
