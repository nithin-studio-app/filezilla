import { useId, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import "./TextField.css";

export type TextFieldVariant = "outlined" | "filled" | "standard";
export type TextFieldSize = "small" | "medium";

export interface TextFieldProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  helperText?: ReactNode;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  variant?: TextFieldVariant;
  size?: TextFieldSize;
  type?: string;
  multiline?: boolean;
  rows?: number;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  name?: string;
  "aria-label"?: string;
}

// The floating label is driven by real focus/value state (not a CSS
// :placeholder-shown trick), so a caller-supplied placeholder can safely
// coexist with it — the placeholder only reaches the DOM once the label
// has already floated out of the way (focused or filled), never overlapping it.
export function TextField({
  label,
  value,
  defaultValue,
  onChange,
  placeholder,
  helperText,
  error = false,
  disabled = false,
  required = false,
  fullWidth = false,
  variant = "outlined",
  size = "medium",
  type = "text",
  multiline = false,
  rows = 3,
  startAdornment,
  endAdornment,
  name,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;
  const hasValue = currentValue.length > 0;
  const floated = focused || hasValue;
  const inputId = useId();
  const helperId = useId();

  const className = [
    "textfield",
    `textfield-${variant}`,
    `textfield-${size}`,
    fullWidth && "textfield-full-width",
    disabled && "textfield-disabled",
    error && "textfield-error",
    focused && "textfield-focused",
    floated && "textfield-floated",
    multiline && "textfield-multiline",
  ]
    .filter(Boolean)
    .join(" ");

  function handleTextChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (!isControlled) setUncontrolledValue(event.target.value);
    onChange?.(event.target.value, event);
  }

  return (
    <div className={className}>
      <div className="textfield-input-wrapper">
        {label && (
          <label htmlFor={inputId} className="textfield-label">
            {label}
            {required && <span className="textfield-required"> *</span>}
          </label>
        )}
        {startAdornment && <span className="textfield-adornment textfield-adornment-start">{startAdornment}</span>}
        {multiline ? (
          <textarea
            id={inputId}
            name={name}
            className="textfield-input"
            rows={rows}
            value={currentValue}
            placeholder={floated ? placeholder : undefined}
            disabled={disabled}
            required={required}
            aria-invalid={error || undefined}
            aria-describedby={helperText ? helperId : undefined}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={handleTextChange}
            {...rest}
          />
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            className="textfield-input"
            value={currentValue}
            placeholder={floated ? placeholder : undefined}
            disabled={disabled}
            required={required}
            aria-invalid={error || undefined}
            aria-describedby={helperText ? helperId : undefined}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={handleTextChange}
            {...rest}
          />
        )}
        {endAdornment && <span className="textfield-adornment textfield-adornment-end">{endAdornment}</span>}
      </div>
      {helperText && (
        <span id={helperId} className="textfield-helper">
          {helperText}
        </span>
      )}
    </div>
  );
}
