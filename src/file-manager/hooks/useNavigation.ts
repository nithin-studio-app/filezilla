import { useEffect, useState } from "react";
import type { NavSection, PathEntry } from "../types";

interface UseNavigationOptions {
  apiBaseUrl: string;
  initialFolderId?: number | null;
  onNavigate?: (folderId: number | null, fileId: number | null) => void;
  showToast: (text: string, severity?: "info" | "error") => void;
}

// Owns "where am I" — the active nav section (Home/Recent/Starred/Trash),
// the current folder's breadcrumb path, and reconciling both with the
// host's deep-linked initialFolderId. Doesn't know about selection or any
// other concern; callers that need to clear selection on navigation do so
// themselves around these calls.
export function useNavigation({ apiBaseUrl, initialFolderId, onNavigate, showToast }: UseNavigationOptions) {
  const [activeNav, setActiveNav] = useState<NavSection>("home");
  const [path, setPath] = useState<PathEntry[]>([]);

  const currentFolderId = path.length > 0 ? path[path.length - 1].id : null;
  const isTrash = activeNav === "trash";
  const isRecent = activeNav === "recent";

  // Deep-link support: when the host passes a different initialFolderId
  // than what's currently shown, resolve its ancestor path and jump there.
  // Guarded on "differs from currentFolderId" so this doesn't fight with
  // this component's own internal navigation calling onNavigate, which
  // typically causes the host to feed the same folder id straight back in.
  useEffect(() => {
    if (initialFolderId === undefined || initialFolderId === currentFolderId) return;
    if (initialFolderId === null) {
      setPath([]);
      return;
    }
    fetch(`${apiBaseUrl}/folders/${initialFolderId}/path`)
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return response.json() as Promise<PathEntry[]>;
      })
      .then(setPath)
      .catch((err: unknown) => {
        // A bad/stale folder id in the URL falls back to showing root —
        // make the URL reflect that too, instead of leaving it pointing at
        // a folder the UI isn't actually showing.
        showToast(err instanceof Error ? err.message : "Failed to resolve folder", "error");
        setPath([]);
        onNavigate?.(null, null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the deep-linked target changes; currentFolderId/showToast read via closure intentionally
  }, [initialFolderId, apiBaseUrl]);

  function goToRoot() {
    setActiveNav("home");
    setPath([]);
    onNavigate?.(null, null);
  }

  function goToPathIndex(index: number) {
    setPath((current) => current.slice(0, index + 1));
    onNavigate?.(path[index].id, null);
  }

  function switchNav(section: NavSection) {
    setActiveNav(section);
  }

  function openFolder(item: { id: number; name: string }) {
    setPath((current) => [...current, { id: item.id, name: item.name }]);
    onNavigate?.(item.id, null);
  }

  // Recently Added is a flat cross-tree view, so there's no ancestor trail
  // to restore — jump into it as if it were opened fresh from Home
  // (breadcrumb just shows Home > this folder).
  function openFolderFlat(item: { id: number; name: string }) {
    setActiveNav("home");
    setPath([{ id: item.id, name: item.name }]);
    onNavigate?.(item.id, null);
  }

  function jumpToFolder(folderId: number, folderPath: PathEntry[]) {
    setActiveNav("home");
    setPath(folderPath);
    onNavigate?.(folderId, null);
  }

  return {
    activeNav,
    isTrash,
    isRecent,
    path,
    currentFolderId,
    goToRoot,
    goToPathIndex,
    switchNav,
    openFolder,
    openFolderFlat,
    jumpToFolder,
  };
}
