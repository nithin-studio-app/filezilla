import type { MouseEventHandler, ReactNode } from "react";
import { accent, palette } from "../colors";
import "./Button.css";

// accent.primary reads fine as white-on-blue (contained), but at 3.62:1 it
// fails WCAG AA as plain text on a dark surface (text/outlined) — a lighter
// shade is needed there instead, so the default differs by variant unless
// the caller passes an explicit color.
const defaultForegroundColor = palette.blue.A200;

export type ButtonVariant = "text" | "outlined" | "contained";
export type ButtonSize = "small" | "medium" | "large";
export type ButtonLoadingPosition = "start" | "center" | "end";

export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  /** Any CSS color — defaults to the shared primary accent. */
  color?: string;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /** Renders an <a> instead of a <button>. */
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  loading?: boolean;
  loadingPosition?: ButtonLoadingPosition;
}

function Spinner() {
  return <span className="button-spinner" aria-hidden="true" />;
}

export function Button({
  children,
  variant = "text",
  color,
  size = "medium",
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  href,
  type = "button",
  onClick,
  loading = false,
  loadingPosition = "center",
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const resolvedColor = color ?? (variant === "contained" ? accent.primary : defaultForegroundColor);
  const className = [
    "button",
    `button-${variant}`,
    `button-${size}`,
    fullWidth && "button-full-width",
    isDisabled && "button-disabled",
  ]
    .filter(Boolean)
    .join(" ");

  const colorStyle =
    variant === "contained" ? { background: resolvedColor, color: "#fff" } : { color: resolvedColor };

  const centerSpinner = loading && loadingPosition === "center";
  const leading = loading && loadingPosition === "start" ? <Spinner /> : startIcon;
  const trailing = loading && loadingPosition === "end" ? <Spinner /> : endIcon;

  const content = (
    <>
      <span className="button-content" style={centerSpinner ? { opacity: 0 } : undefined}>
        {leading && <span className="button-icon button-icon-start">{leading}</span>}
        <span className="button-label">{children}</span>
        {trailing && <span className="button-icon button-icon-end">{trailing}</span>}
      </span>
      {centerSpinner && (
        <span className="button-spinner-center">
          <Spinner />
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        className={className}
        style={colorStyle}
        href={isDisabled ? undefined : href}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        onClick={isDisabled ? undefined : onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={className}
      style={colorStyle}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
