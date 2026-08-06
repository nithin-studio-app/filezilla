import { useEffect, useMemo, useState } from "react";
import type { MediaPreviewItem } from "../../components";
import { buildObjectUrl, hasReadyPreview, isVideo } from "../utils";
import type { Item } from "../types";

interface UseFilePreviewOptions {
  filteredItems: Item[];
  apiBaseUrl: string;
  initialFileId?: number | null;
  currentFolderId: number | null;
  onNavigate?: (folderId: number | null, fileId: number | null) => void;
  showToast: (text: string, severity?: "info" | "error") => void;
}

// Owns the media preview lightbox: which items are previewable, which one
// (if any) is currently open, and keeping the host's deep-linked file in
// sync. Doesn't know about folders, selection, or anything else — only
// "given this list of items, what can be previewed and what's open now."
export function useFilePreview({
  filteredItems,
  apiBaseUrl,
  initialFileId,
  currentFolderId,
  onNavigate,
  showToast,
}: UseFilePreviewOptions) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const previewItems: MediaPreviewItem[] = useMemo(
    () =>
      filteredItems
        .filter(hasReadyPreview)
        .map((item) => ({
          id: String(item.id),
          // Videos play from the original file; images use the converted
          // preview JPEG since the original (e.g. HEIC) may not render in
          // the browser at all.
          src: isVideo(item) ? buildObjectUrl(apiBaseUrl, item.object_key!) : buildObjectUrl(apiBaseUrl, item.preview_key!),
          alt: item.name,
          downloadName: item.name,
          kind: isVideo(item) ? "video" : "image",
        })),
    [filteredItems, apiBaseUrl],
  );

  // Deep-link support: once the target file shows up in the current
  // folder's loaded (and preview-ready) items, open it. If it's not there
  // yet — folder still loading, or the file's preview is still generating —
  // this just quietly does nothing until previewItems changes again.
  useEffect(() => {
    if (initialFileId === undefined || initialFileId === null) return;
    const index = previewItems.findIndex((entry) => entry.id === String(initialFileId));
    if (index !== -1 && previewIndex !== index) setPreviewIndex(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the deep-linked file target or the loaded preview list changes; previewIndex read via closure intentionally
  }, [initialFileId, previewItems]);

  function openPreview(item: Item) {
    if (item.preview_status === "pending") {
      showToast("Preview still processing — try again in a moment.");
      return;
    }
    if (item.preview_status === "failed") {
      showToast("Preview generation failed for this file.", "error");
      return;
    }
    const index = previewItems.findIndex((entry) => entry.id === String(item.id));
    if (index !== -1) {
      setPreviewIndex(index);
      onNavigate?.(currentFolderId, item.id);
    }
  }

  function closePreview() {
    setPreviewIndex(null);
    onNavigate?.(currentFolderId, null);
  }

  function goToPreviewIndex(index: number) {
    setPreviewIndex(index);
    const entry = previewItems[index];
    onNavigate?.(currentFolderId, entry ? Number(entry.id) : null);
  }

  function handleDownloadPreviewItem(previewItem: MediaPreviewItem) {
    const anchor = document.createElement("a");
    anchor.href = previewItem.src;
    anchor.download = previewItem.downloadName ?? previewItem.alt ?? "download";
    anchor.target = "_blank";
    anchor.rel = "noopener";
    anchor.click();
  }

  return {
    previewItems,
    previewIndex,
    openPreview,
    closePreview,
    goToPreviewIndex,
    handleDownloadPreviewItem,
  };
}
