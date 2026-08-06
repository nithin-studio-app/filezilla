import { useEffect, useState } from "react";
import { Breadcrumbs, Button, Dialog, FolderIcon, HomeIcon, SearchIcon, Text, TextField } from "../components";
import type { Item, PathEntry } from "./types";

interface FolderResult {
  id: number;
  name: string;
  path: PathEntry[];
}

interface MoveDialogProps {
  open: boolean;
  apiBaseUrl: string;
  onClose: () => void;
  onSelectDestination: (folderId: number | null) => void;
}

// A folder browser, not just search: navigate in via breadcrumbs/subfolder
// clicks (mirrors the main listing's own navigation), then confirm with an
// explicit "Move here" button — clicking a folder only browses into it, it
// doesn't move anything by itself. Search is kept as a shortcut to jump
// straight to a folder's browse location rather than clicking through the
// tree by hand. Always resets to Home on open so a previous move's browse
// position never leaks into the next one.
export function MoveDialog({ open, apiBaseUrl, onClose, onSelectDestination }: MoveDialogProps) {
  const [path, setPath] = useState<PathEntry[]>([]);
  const [folders, setFolders] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FolderResult[]>([]);

  const currentFolderId = path.length > 0 ? path[path.length - 1].id : null;

  useEffect(() => {
    if (open) {
      setPath([]);
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams();
    if (currentFolderId !== null) params.set("parent_id", String(currentFolderId));
    fetch(`${apiBaseUrl}/items?${params.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return response.json() as Promise<{ items: Item[] }>;
      })
      .then((data) => setFolders(data.items.filter((item) => item.kind === "folder")))
      .catch(() => {
        if (!controller.signal.aborted) setFolders([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [open, currentFolderId, apiBaseUrl]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`${apiBaseUrl}/folders/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((response) => (response.ok ? (response.json() as Promise<FolderResult[]>) : Promise.resolve([])))
        .then(setResults)
        .catch(() => {
          // A failed search here just means no results shown — this isn't
          // the primary error surface for the move itself.
        });
    }, 400);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, apiBaseUrl]);

  function jumpTo(resultPath: PathEntry[]) {
    setPath(resultPath);
    setQuery("");
  }

  return (
    <Dialog open={open} onClose={onClose} title="Move to...">
      <div className="file-manager-move-dialog">
        <TextField
          placeholder="Search folders"
          value={query}
          onChange={setQuery}
          startAdornment={<SearchIcon />}
          fullWidth
          aria-label="Search folders"
        />
        {query.trim() ? (
          <ul className="file-manager-move-list">
            {results.length === 0 && (
              <li className="file-manager-move-empty">
                <Text variant="body2" color="var(--fm-text-muted)">
                  No folders matching "{query.trim()}".
                </Text>
              </li>
            )}
            {results.map((result) => (
              <li key={result.id}>
                <button type="button" onClick={() => jumpTo(result.path)}>
                  <FolderIcon />
                  <span className="file-manager-move-result-text">
                    <span>{result.name}</span>
                    {result.path.length > 1 && (
                      <Text variant="body2" color="var(--fm-text-muted)">
                        {result.path
                          .slice(0, -1)
                          .map((entry) => entry.name)
                          .join(" / ")}
                      </Text>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <div className="file-manager-breadcrumbs">
              <Breadcrumbs>
                <button type="button" className="file-manager-breadcrumb-home" onClick={() => setPath([])} aria-label="Home">
                  <HomeIcon />
                </button>
                {path.map((entry, index) => (
                  <button type="button" key={entry.id} onClick={() => setPath(path.slice(0, index + 1))}>
                    {entry.name}
                  </button>
                ))}
              </Breadcrumbs>
            </div>
            <ul className="file-manager-move-list">
              {!loading && folders.length === 0 && (
                <li className="file-manager-move-empty">
                  <Text variant="body2" color="var(--fm-text-muted)">
                    No subfolders here.
                  </Text>
                </li>
              )}
              {folders.map((folder) => (
                <li key={folder.id}>
                  <button type="button" onClick={() => setPath([...path, { id: folder.id, name: folder.name }])}>
                    <FolderIcon />
                    <span>{folder.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="file-manager-move-confirm">
          <Button
            variant="contained"
            size="small"
            fullWidth
            color="var(--fm-accent)"
            onClick={() => onSelectDestination(currentFolderId)}
          >
            Move here{path.length > 0 ? ` (${path[path.length - 1].name})` : " (Home)"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
