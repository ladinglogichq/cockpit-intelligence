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
      intro="Normalized intelligence objects—wallets, token mints, programs, domains, and related kinds—with provenance from artifacts and edges backed by evidence."
      panelCaption="Reserved for entity search, graph hints, and enrichment panels (Solana and cross-chain as configured)."
    />
  );
}
