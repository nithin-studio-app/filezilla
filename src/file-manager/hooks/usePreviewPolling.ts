import { useEffect } from "react";
import type { Item } from "../types";

// Polls pending previews (HEIC/video conversions running as a background
// task on the server) until each one resolves to ready/failed. Recomputes
// the pending list and restarts its interval every time `items` changes,
// so there's never more than one interval running at once. Pure side
// effect — has no state or return value of its own.
export function usePreviewPolling(items: Item[], patchItems: (updater: (current: Item[]) => Item[]) => void, apiBaseUrl: string) {
  useEffect(() => {
    const pendingIds = items.filter((item) => item.preview_status === "pending").map((item) => item.id);
    if (pendingIds.length === 0) return;

    const interval = setInterval(() => {
      Promise.all(
        pendingIds.map((id) =>
          fetch(`${apiBaseUrl}/files/${id}`)
            .then((response) => (response.ok ? (response.json() as Promise<Item>) : null))
            .catch(() => null),
        ),
      ).then((updates) => {
        patchItems((current) =>
          current.map((item) => {
            const updated = updates.find((candidate) => candidate && candidate.id === item.id);
            return updated ? { ...item, ...updated } : item;
          }),
        );
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [items, apiBaseUrl, patchItems]);
}
