import { useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import { CheckIcon, RemoveIcon } from "../icons";
import { accent } from "../colors";
import "./Checkbox.css";

export type CheckboxSize = "small" | "medium";

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Visually and semantically distinct third state — e.g. a "select all" toggle over a partial selection. */
  indeterminate?: boolean;
  disabled?: boolean;
  color?: string;
  size?: CheckboxSize;
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  "aria-label"?: string;
}

// A visually-hidden real <input type="checkbox"> layered under a styled
// box, so native keyboard/checked/indeterminate semantics stay intact —
// the box is purely decorative (aria-hidden) and driven by CSS sibling
// selectors (:checked, :indeterminate) off the real input's live state.
export function Checkbox({
  checked,
  defaultChecked,
  indeterminate = false,
  disabled = false,
  color = accent.primary,
  size = "medium",
  onChange,
  ...rest
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const className = ["checkbox", `checkbox-${size}`, disabled && "checkbox-disabled"]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={className} style={{ color }}>
      <input
        ref={inputRef}
        type="checkbox"
        className="checkbox-input"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked, event)}
        {...rest}
      />
      <span className="checkbox-box" aria-hidden="true">
        <span className="checkbox-icon checkbox-icon-check">
          <CheckIcon />
        </span>
        <span className="checkbox-icon checkbox-icon-indeterminate">
          <RemoveIcon />
        </span>
      </span>
    </span>
  );
}
