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
      intro="Normalized regulation objects—jurisdictions, legal documents, clauses, and pillar mappings—with provenance from evidence records backed by retrievable citations."
      panelCaption="Reserved for jurisdiction search, clause graph hints, and enrichment panels (cross-border and domestic data protection as configured)."
    />
  );
}
