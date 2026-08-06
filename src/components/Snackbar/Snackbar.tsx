import { useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "../icons";
import "./Snackbar.css";

export type SnackbarPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export interface SnackbarProps {
  open: boolean;
  onClose?: () => void;
  /** Auto-dismisses after this many ms. Omit to require an explicit close. */
  autoHideDuration?: number;
  position?: SnackbarPosition;
  message?: ReactNode;
  action?: ReactNode;
  /** Overrides message/action entirely — e.g. to show an Alert instead of the default layout. */
  children?: ReactNode;
}

// A transient, non-modal notification — no backdrop, doesn't trap focus,
// role="status" so screen readers announce it without stealing focus
// from whatever the user was doing.
export function Snackbar({ open, onClose, autoHideDuration, position = "top-right", message, action, children }: SnackbarProps) {
  useEffect(() => {
    if (!open || !autoHideDuration) return;
    const timer = setTimeout(() => onClose?.(), autoHideDuration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when open/duration change, not on every onClose identity change
  }, [open, autoHideDuration]);

  if (!open) return null;

  return createPortal(
    <div className={`snackbar snackbar-${position}`} role="status" aria-live="polite">
      {children ?? (
        <div className="snackbar-content">
          <span className="snackbar-message">{message}</span>
          {action}
          {onClose && (
            <button type="button" className="snackbar-close" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          )}
        </div>
      )}
    </div>,
    document.body,
  );
}
