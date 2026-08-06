import { useId } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Backdrop } from "../Backdrop";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import "./Dialog.css";

export type DialogMaxWidth = "xs" | "sm" | "md" | "lg";

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  maxWidth?: DialogMaxWidth;
  fullWidth?: boolean;
  "aria-label"?: string;
}

// Portals to document.body (escapes any clipping/z-index context an
// ancestor might impose); useFocusTrap handles moving focus in, trapping
// Tab, restoring it on close, and Escape. Closes on that or a genuine
// backdrop click (panel clicks stopPropagation so they never reach the
// backdrop's own handler).
export function Dialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = false,
  ...rest
}: DialogProps) {
  const titleId = useId();
  const { containerRef, handleKeyDown } = useFocusTrap<HTMLDivElement>(open, onClose);

  if (!open) return null;

  return createPortal(
    <Backdrop open onClick={onClose}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={["dialog-panel", `dialog-${maxWidth}`, fullWidth && "dialog-full-width"]
          .filter(Boolean)
          .join(" ")}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {title && (
          <div id={titleId} className="dialog-title">
            {title}
          </div>
        )}
        {children && <div className="dialog-content">{children}</div>}
        {actions && <div className="dialog-actions">{actions}</div>}
      </div>
    </Backdrop>,
    document.body,
  );
}
