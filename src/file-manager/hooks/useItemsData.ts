import { useCallback, useEffect, useRef, useState } from "react";
import type { Item } from "../types";

interface UseItemsDataOptions {
  apiBaseUrl: string;
  currentFolderId: number | null;
  activeNav: string;
  isTrash: boolean;
  isRecent: boolean;
  showToast: (text: string, severity?: "info" | "error") => void;
}

// Owns fetching + pagination for whichever listing is currently on screen
// (Home's current folder, Trash, or Recently Added) and nothing else.
export function useItemsData({ apiBaseUrl, currentFolderId, activeNav, isTrash, isRecent, showToast }: UseItemsDataOptions) {
  const [items, setItems] = useState<Item[]>([]);
  const [trashItems, setTrashItems] = useState<Item[]>([]);
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const folderRequestController = useRef<AbortController | null>(null);

  function itemsUrl(offset: number): string {
    const params = new URLSearchParams();
    if (currentFolderId !== null) params.set("parent_id", String(currentFolderId));
    if (offset > 0) params.set("offset", String(offset));
    const qs = params.toString();
    return `${apiBaseUrl}/items${qs ? `?${qs}` : ""}`;
  }

  useEffect(() => {
    // Also re-runs whenever activeNav switches back to "home" (not just on
    // folder change) — otherwise the cached `items` state goes stale after
    // an action taken elsewhere (e.g. restoring a file from Trash back into
    // the currently-loaded folder) and only updates on a manual refresh.
    if (activeNav !== "home") return;
    // Shared with loadMore so a folder change (or unmount) aborts any
    // in-flight "load more" request too — otherwise a slow page-2 fetch can
    // land after the user has already navigated elsewhere and append stale
    // items onto the new folder's list.
    const controller = new AbortController();
    folderRequestController.current = controller;
    setLoading(true);
    setError(null);
    fetch(itemsUrl(0), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return response.json() as Promise<{ items: Item[]; has_more: boolean }>;
      })
      .then((data) => {
        setItems(data.items);
        setHasMore(data.has_more);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const text = err instanceof Error ? err.message : "Failed to load items";
        setError(text);
        showToast(text, "error");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- showToast is stable enough in practice; itemsUrl reads currentFolderId via closure and is captured fresh each render
  }, [apiBaseUrl, currentFolderId, activeNav]);

  function fetchTrashData() {
    setLoading(true);
    setError(null);
    fetch(`${apiBaseUrl}/trash`)
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return response.json() as Promise<Item[]>;
      })
      .then(setTrashItems)
      .catch((err: unknown) => {
        const text = err instanceof Error ? err.message : "Failed to load trash";
        setError(text);
        showToast(text, "error");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (isTrash) fetchTrashData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when Trash is opened/apiBaseUrl changes, not on every fetchTrashData identity change
  }, [isTrash, apiBaseUrl]);

  function fetchRecentData() {
    setLoading(true);
    setError(null);
    fetch(`${apiBaseUrl}/recent`)
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return response.json() as Promise<Item[]>;
      })
      .then(setRecentItems)
      .catch((err: unknown) => {
        const text = err instanceof Error ? err.message : "Failed to load recently added items";
        setError(text);
        showToast(text, "error");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (isRecent) fetchRecentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when Recently Added is opened/apiBaseUrl changes, not on every fetchRecentData identity change
  }, [isRecent, apiBaseUrl]);

  function refreshItems() {
    if (isTrash) {
      fetchTrashData();
      return;
    }
    if (isRecent) {
      fetchRecentData();
      return;
    }
    setLoading(true);
    setError(null);
    fetch(itemsUrl(0))
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return response.json() as Promise<{ items: Item[]; has_more: boolean }>;
      })
      .then((data) => {
        setItems(data.items);
        setHasMore(data.has_more);
      })
      .catch((err: unknown) => {
        const text = err instanceof Error ? err.message : "Failed to load items";
        setError(text);
        showToast(text, "error");
      })
      .finally(() => setLoading(false));
  }

  function loadMore() {
    const controller = folderRequestController.current;
    if (loadingMore || !hasMore || !controller || controller.signal.aborted) return;
    // Offset is over files only — folders are only ever returned on the
    // first page (see filezilla-api's /items), so they don't count here.
    const filesLoaded = items.filter((item) => item.kind === "file").length;
    setLoadingMore(true);
    fetch(itemsUrl(filesLoaded), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return response.json() as Promise<{ items: Item[]; has_more: boolean }>;
      })
      .then((data) => {
        setItems((current) => [...current, ...data.items]);
        setHasMore(data.has_more);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        showToast(err instanceof Error ? err.message : "Failed to load more items", "error");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingMore(false);
      });
  }

  // Lets other concerns (e.g. preview polling) merge server updates into
  // `items` without needing to know how items are fetched. Wrapped in
  // useCallback so it stays referentially stable across renders, same as
  // the setItems it delegates to — callers can safely list it as an effect
  // dependency without causing extra re-runs.
  const patchItems = useCallback((updater: (current: Item[]) => Item[]) => {
    setItems(updater);
  }, []);

  return {
    items,
    trashItems,
    recentItems,
    loading,
    loadingMore,
    hasMore,
    error,
    refreshItems,
    loadMore,
    patchItems,
  };
}
