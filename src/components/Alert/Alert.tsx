import type { ReactNode } from "react";
import { CheckIcon, InfoIcon, WarningIcon, ErrorIcon, CloseIcon } from "../icons";
import "./Alert.css";

export type AlertSeverity = "success" | "info" | "warning" | "error";
export type AlertVariant = "standard" | "filled" | "outlined";

export interface AlertProps {
  children: ReactNode;
  severity?: AlertSeverity;
  variant?: AlertVariant;
  title?: ReactNode;
  /** Overrides the severity's default icon. Pass false to hide it. */
  icon?: ReactNode | false;
  /** A custom action (e.g. a button), shown before the close button if both are present. */
  action?: ReactNode;
  onClose?: () => void;
}

const defaultIcons: Record<AlertSeverity, ReactNode> = {
  success: <CheckIcon />,
  info: <InfoIcon />,
  warning: <WarningIcon />,
  error: <ErrorIcon />,
};

export function Alert({
  children,
  severity = "info",
  variant = "standard",
  title,
  icon,
  action,
  onClose,
}: AlertProps) {
  const resolvedIcon = icon === false ? null : (icon ?? defaultIcons[severity]);
  const className = ["alert", `alert-${severity}`, `alert-${variant}`].join(" ");

  return (
    <div role="alert" className={className}>
      {resolvedIcon && (
        <span className="alert-icon" aria-hidden="true">
          {resolvedIcon}
        </span>
      )}
      <div className="alert-body">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{children}</div>
      </div>
      {(action || onClose) && (
        <div className="alert-actions">
          {action}
          {onClose && (
            <button type="button" className="alert-close" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
