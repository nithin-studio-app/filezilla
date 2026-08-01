import type { MouseEvent as ReactMouseEvent } from "react";
import { FileIcon, FolderIcon, Table, TableBody, TableCell, TableHead, TableRow } from "@nithin-studio-app/ui-components";
import { formatSize, hasReadyPreview, itemKey } from "./utils";
import type { Item } from "./types";

interface FileTableProps {
  items: Item[];
  selectedKeys: Set<string>;
  objectUrl: (key: string) => string;
  onItemClick: (event: ReactMouseEvent, item: Item, index: number) => void;
  onItemDoubleClick: (item: Item) => void;
  onContextMenu: (event: ReactMouseEvent, item: Item, index: number) => void;
}

export function FileTable({ items, selectedKeys, objectUrl, onItemClick, onItemDoubleClick, onContextMenu }: FileTableProps) {
  return (
    <Table stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell header>Name</TableCell>
          <TableCell header align="right">
            Size
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={itemKey(item)} hover selected={selectedKeys.has(itemKey(item))}>
            <TableCell>
              <button
                type="button"
                className="file-manager-name"
                onClick={(event) => onItemClick(event, item, index)}
                onDoubleClick={() => onItemDoubleClick(item)}
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
