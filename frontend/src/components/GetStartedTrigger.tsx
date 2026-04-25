import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useGetStarted } from "../context/GetStartedContext";

type Props = {
  className: string;
  /** Defaults to “Get started”. */
  children?: ReactNode;
};

/**
 * Declarative route to `/dashboard` (reliable with React Router) plus engagement flag for workspace nav.
 * Uses `<Link>` so middle-click / open-in-new-tab works like a normal destination.
 */
export function GetStartedTrigger({ className, children }: Props) {
  const { markGetStartedPressed } = useGetStarted();

  return (
    <Link to="/dashboard" className={className} onClick={() => markGetStartedPressed()}>
      {children ?? "Get started"}
    </Link>
  );
}
