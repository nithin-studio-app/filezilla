import type { MouseEvent as ReactMouseEvent } from "react";
import {
  Checkbox,
  FileIcon,
  FolderIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@nithin-studio-app/ui-components";
import { formatSize, hasReadyPreview, itemKey } from "./utils";
import type { Item } from "./types";

interface FileTableProps {
  items: Item[];
  selectedKeys: Set<string>;
  objectUrl: (key: string) => string;
  onToggleSelection: (item: Item, index: number) => void;
  onItemClick: (event: ReactMouseEvent, item: Item, index: number) => void;
  onContextMenu: (event: ReactMouseEvent, item: Item, index: number) => void;
}

export function FileTable({
  items,
  selectedKeys,
  objectUrl,
  onToggleSelection,
  onItemClick,
  onContextMenu,
}: FileTableProps) {
  return (
    <Table stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell header padding="checkbox" />
          <TableCell header>Name</TableCell>
          <TableCell header align="right">
            Size
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={itemKey(item)} hover selected={selectedKeys.has(itemKey(item))}>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selectedKeys.has(itemKey(item))}
                onChange={() => onToggleSelection(item, index)}
                aria-label={`Select ${item.name}`}
              />
            </TableCell>
            <TableCell>
              <button
                type="button"
                className="file-manager-name"
                onClick={(event) => onItemClick(event, item, index)}
                onContextMenu={(event) => onContextMenu(event, item, index)}
              >
                {item.kind === "folder" ? (
                  <FolderIcon />
                ) : hasReadyPreview(item) ? (
                  <img className="file-manager-thumb" src={objectUrl(item.preview_key!)} alt="" loading="lazy" />
                ) : (
                  <FileIcon />
                )}
                <span>{item.name}</span>
              </button>
            </TableCell>
            <TableCell align="right">{item.kind === "file" ? formatSize(item.size_bytes) : "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
