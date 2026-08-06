import type { ReactNode } from "react";
import "./List.css";

export interface ListProps {
  children: ReactNode;
  dense?: boolean;
}

export function List({ children, dense = false }: ListProps) {
  return <ul className={dense ? "list list-dense" : "list"}>{children}</ul>;
}

export interface ListItemProps {
  children: ReactNode;
  /** Leading icon or avatar. */
  icon?: ReactNode;
  /** Trailing content (e.g. a button, a chip) — kept as a sibling to the
   * clickable area, never nested inside it. */
  action?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
}

export function ListItem({ children, icon, action, onClick, disabled = false, selected = false }: ListItemProps) {
  const clickable = Boolean(onClick) && !disabled;
  const className = [
    "list-item",
    selected && "list-item-selected",
    disabled && "list-item-disabled",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {icon && <span className="list-item-icon">{icon}</span>}
      <span className="list-item-content">{children}</span>
    </>
  );

  return (
    <li className={className} aria-disabled={disabled || undefined}>
      {clickable ? (
        <button
          type="button"
          className="list-item-main"
          onClick={onClick}
          disabled={disabled}
          aria-current={selected || undefined}
        >
          {content}
        </button>
      ) : (
        <div className="list-item-main">{content}</div>
      )}
      {action && <span className="list-item-action">{action}</span>}
    </li>
  );
}

export interface ListItemTextProps {
  primary: ReactNode;
  secondary?: ReactNode;
}

export function ListItemText({ primary, secondary }: ListItemTextProps) {
  return (
    <span className="list-item-text">
      <span className="list-item-text-primary">{primary}</span>
      {secondary && <span className="list-item-text-secondary">{secondary}</span>}
    </span>
  );
}
