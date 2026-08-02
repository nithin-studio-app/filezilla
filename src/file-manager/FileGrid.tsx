import type { MouseEvent as ReactMouseEvent } from "react";
import { FileIcon, FolderIcon, StarIcon } from "@nithin-studio-app/ui-components";
import { Thumbnail } from "./Thumbnail";
import { formatSize, hasReadyPreview, itemKey } from "./utils";
import type { Item } from "./types";

interface FileGridProps {
  items: Item[];
  selectedKeys: Set<string>;
  objectUrl: (key: string) => string;
  onItemClick: (event: ReactMouseEvent, item: Item, index: number) => void;
  onItemDoubleClick: (item: Item) => void;
  onContextMenu: (event: ReactMouseEvent, item: Item, index: number) => void;
}

export function FileGrid({ items, selectedKeys, objectUrl, onItemClick, onItemDoubleClick, onContextMenu }: FileGridProps) {
  return (
    <div className="file-manager-grid">
      {items.map((item, index) => (
        <div
          className={["file-manager-grid-item", selectedKeys.has(itemKey(item)) && "file-manager-grid-item-selected"]
            .filter(Boolean)
            .join(" ")}
          key={itemKey(item)}
          onContextMenu={(event) => onContextMenu(event, item, index)}
        >
          {item.starred_at && (
            <span className="file-manager-grid-star" aria-label="Starred">
              <StarIcon />
            </span>
          )}
          <button
            type="button"
            className="file-manager-grid-item-button"
            onClick={(event) => onItemClick(event, item, index)}
            onDoubleClick={() => onItemDoubleClick(item)}
          >
            {item.kind === "folder" ? (
              <FolderIcon />
            ) : hasReadyPreview(item) ? (
              <Thumbnail className="file-manager-thumb file-manager-thumb-grid" src={objectUrl(item.preview_key!)} />
            ) : (
              <FileIcon />
            )}
            <span className="file-manager-grid-item-name">{item.name}</span>
            {item.kind === "file" && <span className="file-manager-grid-item-size">{formatSize(item.size_bytes)}</span>}
          </button>
        </div>
      ))}
    </div>
  );
}
