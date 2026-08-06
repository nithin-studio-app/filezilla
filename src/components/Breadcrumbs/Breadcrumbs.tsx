import { Children, useState } from "react";
import type { ReactNode } from "react";
import "./Breadcrumbs.css";

export interface BreadcrumbsProps {
  /** Each child is one crumb — typically a Link, except the last (current page), usually plain text. */
  children: ReactNode;
  separator?: ReactNode;
  /** Once there are more crumbs than this, collapses everything between the
   * first and last behind an expandable "…". */
  maxItems?: number;
  "aria-label"?: string;
}

const ELLIPSIS = Symbol("ellipsis");

// The last crumb gets aria-current="page" automatically (on its <li>, so it
// works regardless of what that child actually is — Link, plain text,
// whatever the caller passed).
export function Breadcrumbs({ children, separator = "/", maxItems, "aria-label": ariaLabel = "breadcrumb" }: BreadcrumbsProps) {
  const [expanded, setExpanded] = useState(false);
  const items = Children.toArray(children);
  const shouldCollapse = Boolean(maxItems) && !expanded && items.length > maxItems!;

  const visibleItems: (ReactNode | typeof ELLIPSIS)[] = shouldCollapse
    ? [items[0], ELLIPSIS, items[items.length - 1]]
    : items;

  return (
    <nav aria-label={ariaLabel}>
      <ol className="breadcrumbs">
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          return (
            <li
              key={index}
              className="breadcrumbs-item"
              aria-current={isLast && item !== ELLIPSIS ? "page" : undefined}
            >
              {item === ELLIPSIS ? (
                <button
                  type="button"
                  className="breadcrumbs-ellipsis"
                  onClick={() => setExpanded(true)}
                  aria-label="Show all breadcrumbs"
                >
                  …
                </button>
              ) : (
                item
              )}
              {!isLast && (
                <span className="breadcrumbs-separator" aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
