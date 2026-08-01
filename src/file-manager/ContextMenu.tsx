import { DownloadIcon, EditIcon, RefreshIcon, StarIcon, TrashIcon } from "@nithin-studio-app/ui-components";

interface ContextMenuProps {
  x: number;
  y: number;
  isTrash: boolean;
  canRename: boolean;
  canDownload: boolean;
  allStarred: boolean;
  onRename: () => void;
  onDownload: () => void;
  onRestore: () => void;
  onDeleteForeverConfirm: () => void;
  onTrash: () => void;
  onToggleStar: () => void;
}

export function ContextMenu({
  x,
  y,
  isTrash,
  canRename,
  canDownload,
  allStarred,
  onRename,
  onDownload,
  onRestore,
  onDeleteForeverConfirm,
  onTrash,
  onToggleStar,
}: ContextMenuProps) {
  return (
    <ul
      className="file-manager-context-menu"
      style={{ top: y, left: x }}
      onClick={(event) => event.stopPropagation()}
    >
      {!isTrash && canRename && (
        <li>
          <button type="button" onClick={onRename}>
            <EditIcon />
            Rename
          </button>
        </li>
      )}
      {!isTrash && (
        <li>
          <button type="button" onClick={onToggleStar}>
            <StarIcon />
            {allStarred ? "Remove from starred" : "Add to starred"}
          </button>
        </li>
      )}
      {canDownload && (
        <li>
          <button type="button" onClick={onDownload}>
            <DownloadIcon />
            Download
          </button>
        </li>
      )}
      {isTrash ? (
        <>
          <li>
            <button type="button" onClick={onRestore}>
              <RefreshIcon />
              Restore
            </button>
          </li>
          <li>
            <button type="button" className="file-manager-context-menu-danger" onClick={onDeleteForeverConfirm}>
              <TrashIcon />
              Delete forever
            </button>
          </li>
        </>
      ) : (
        <li>
          <button type="button" className="file-manager-context-menu-danger" onClick={onTrash}>
            <TrashIcon />
            Delete
          </button>
        </li>
      )}
    </ul>
  );
}
