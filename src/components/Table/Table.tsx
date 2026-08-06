import type { ReactNode } from "react";
import { ArrowUpwardIcon, ChevronLeftIcon, ChevronRightIcon } from "../icons";
import "./Table.css";

export interface TableProps {
  children: ReactNode;
  /** Denser row padding. */
  size?: "small" | "medium";
  /** Pins the header row to the top of the scroll container. */
  stickyHeader?: boolean;
  caption?: ReactNode;
}

// Wrapped in a horizontally-scrolling container so a wide table never
// forces the page itself to scroll sideways.
export function Table({ children, size = "medium", stickyHeader = false, caption }: TableProps) {
  const className = [
    "table",
    size === "small" && "table-dense",
    stickyHeader && "table-sticky-header",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="table-container">
      <table className={className}>
        {caption && <caption className="table-caption">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead className="table-head">{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableFooter({ children }: { children: ReactNode }) {
  return <tfoot className="table-footer">{children}</tfoot>;
}

export interface TableRowProps {
  children: ReactNode;
  /** Highlights the row on hover — set on data rows, not header rows. */
  hover?: boolean;
  selected?: boolean;
}

export function TableRow({ children, hover = false, selected = false }: TableRowProps) {
  const className = ["table-row", hover && "table-row-hover", selected && "table-row-selected"]
    .filter(Boolean)
    .join(" ");
  return (
    <tr className={className} aria-selected={selected}>
      {children}
    </tr>
  );
}

export interface TableCellProps {
  children?: ReactNode;
  /** Renders a <th scope="col"> instead of a <td>. */
  header?: boolean;
  align?: "left" | "center" | "right";
  /** "none" strips all padding, "checkbox" tightens it for a leading checkbox column. */
  padding?: "normal" | "none" | "checkbox";
  colSpan?: number;
  rowSpan?: number;
  /** Set on a sortable header cell to expose sort state to assistive tech via aria-sort. */
  sortDirection?: "asc" | "desc";
}

export function TableCell({
  children,
  header = false,
  align = "left",
  padding = "normal",
  colSpan,
  rowSpan,
  sortDirection,
}: TableCellProps) {
  const className = [
    "table-cell",
    `table-cell-${align}`,
    padding !== "normal" && `table-cell-${padding}`,
  ]
    .filter(Boolean)
    .join(" ");
  const ariaSort = sortDirection === "asc" ? "ascending" : sortDirection === "desc" ? "descending" : undefined;

  return header ? (
    <th className={className} scope="col" colSpan={colSpan} rowSpan={rowSpan} aria-sort={ariaSort}>
      {children}
    </th>
  ) : (
    <td className={className} colSpan={colSpan} rowSpan={rowSpan}>
      {children}
    </td>
  );
}

export interface TableSortLabelProps {
  active?: boolean;
  direction?: "asc" | "desc";
  onClick?: () => void;
  children: ReactNode;
}

// Pair with TableCell's sortDirection prop (active columns only) so the
// sort state is exposed via aria-sort on the <th>, not just visually.
export function TableSortLabel({ active = false, direction = "asc", onClick, children }: TableSortLabelProps) {
  const className = ["table-sort-label", active && "table-sort-label-active"].filter(Boolean).join(" ");
  const iconClassName = ["table-sort-icon", direction === "desc" && "table-sort-icon-desc"]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={className} onClick={onClick}>
      <span>{children}</span>
      <span className={iconClassName} aria-hidden="true">
        <ArrowUpwardIcon />
      </span>
    </button>
  );
}

export interface TablePaginationProps {
  count: number;
  /** Zero-indexed current page. */
  page: number;
  rowsPerPage: number;
  rowsPerPageOptions?: number[];
  onPageChange: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

export function TablePagination({
  count,
  page,
  rowsPerPage,
  rowsPerPageOptions = [5, 10, 25],
  onPageChange,
  onRowsPerPageChange,
}: TablePaginationProps) {
  const from = count === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min(count, (page + 1) * rowsPerPage);
  const lastPage = Math.max(0, Math.ceil(count / rowsPerPage) - 1);

  return (
    <div className="table-pagination">
      {onRowsPerPageChange && (
        <label className="table-pagination-rows-per-page">
          Rows per page:
          <select value={rowsPerPage} onChange={(event) => onRowsPerPageChange(Number(event.target.value))}>
            {rowsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      )}
      <span className="table-pagination-range">
        {from}–{to} of {count}
      </span>
      <button type="button" aria-label="Previous page" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
        <ChevronLeftIcon />
      </button>
      <button type="button" aria-label="Next page" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>
        <ChevronRightIcon />
      </button>
    </div>
  );
}
