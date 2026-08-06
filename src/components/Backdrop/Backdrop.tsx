import type { MouseEventHandler, ReactNode } from "react";
import "./Backdrop.css";

export interface BackdropProps {
  open: boolean;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
  /** Renders inline within its parent instead of covering the full viewport — for scoping to one container. */
  fixed?: boolean;
  /** Escape hatch for callers that need to override layout (e.g. Drawer edge-aligning its panel instead of centering it). */
  className?: string;
}

// A dimming overlay, typically holding a loading indicator or shown
// behind a Dialog/MediaPreview. Doesn't manage focus itself — Dialog
// (which composes this) is where focus-trapping belongs, since a bare
// Backdrop is also valid standalone (e.g. a full-page loading state).
export function Backdrop({ open, children, onClick, fixed = true, className }: BackdropProps) {
  if (!open) return null;

  return (
    <div className={["backdrop", fixed && "backdrop-fixed", className].filter(Boolean).join(" ")} onClick={onClick}>
      {children}
    </div>
  );
}
