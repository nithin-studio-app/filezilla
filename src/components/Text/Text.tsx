import type { ReactNode, ElementType, CSSProperties } from "react";
import { fontFamily } from "../fontFamily";
import "./Text.css";

export type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle1"
  | "subtitle2"
  | "body1"
  | "body2"
  | "caption"
  | "overline";

const defaultElement: Record<TextVariant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  subtitle1: "p",
  subtitle2: "p",
  body1: "p",
  body2: "p",
  caption: "span",
  overline: "span",
};

export interface TextProps {
  variant?: TextVariant;
  children: ReactNode;
  /** Override the rendered element (default per variant — e.g. "h1"
   * styling doesn't have to render an actual <h1>). */
  as?: ElementType;
  color?: string;
  align?: "left" | "center" | "right";
  /** Truncate to a single line with an ellipsis. */
  noWrap?: boolean;
}

export function Text({ variant = "body1", children, as, color, align, noWrap = false }: TextProps) {
  const Component = as ?? defaultElement[variant];
  const style: CSSProperties = {
    fontFamily: fontFamily.default,
    color,
    textAlign: align,
  };

  return (
    <Component className={`text text-${variant}${noWrap ? " text-nowrap" : ""}`} style={style}>
      {children}
    </Component>
  );
}
