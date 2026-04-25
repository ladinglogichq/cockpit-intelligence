import { useEffect } from "react";
import { Link } from "react-router-dom";
import { WorkspacePageBody } from "../components/workspace/WorkspacePageBody";

export function UpgradePage() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Upgrade plan — Cockpit";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <WorkspacePageBody
      title="Upgrade plan"
      intro="Compare tiers for higher credit limits, additional seats, and priority support. You can also review public pricing and FAQs on the marketing site."
      panelCaption="Reserved for plan comparison, checkout, and seat management."
    >
      <p className="mt-4 text-sm">
        <Link
          to="/pricing"
          className="font-medium text-ink underline-offset-2 hover:underline dark:text-sky-400 dark:hover:text-sky-300"
        >
          View pricing and plans →
        </Link>
      </p>
    </WorkspacePageBody>
  );
}
