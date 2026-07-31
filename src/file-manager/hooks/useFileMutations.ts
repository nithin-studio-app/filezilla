import { useState } from "react";
import { buildObjectUrl, mutationUrl } from "../utils";
import type { Item } from "../types";

interface UseFileMutationsOptions {
  apiBaseUrl: string;
  selectedItems: Item[];
  showToast: (text: string, severity?: "info" | "error") => void;
  refreshItems: () => void;
  clearSelection: () => void;
  closeContextMenu: () => void;
}

// Owns every write operation on files/folders: create, rename, trash,
// restore, permanently delete, and download. Reads which items are
// selected but doesn't own selection itself, and refreshes the listing
// through the caller's refreshItems rather than touching it directly.
export function useFileMutations({
  apiBaseUrl,
  selectedItems,
  showToast,
  refreshItems,
  clearSelection,
  closeContextMenu,
}: UseFileMutationsOptions) {
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameTarget, setRenameTarget] = useState<Item | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  function openNewFolderDialog() {
    setNewFolderOpen(true);
  }

  function closeNewFolderDialog() {
    setNewFolderOpen(false);
  }

  function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    showToast(`"${name}" folder queued — wiring comes next.`);
    setNewFolderName("");
    setNewFolderOpen(false);
  }

  function handleDownloadSelected() {
    selectedItems
      .filter((item) => item.kind === "file")
      .forEach((item) => {
        const anchor = document.createElement("a");
        anchor.href = buildObjectUrl(apiBaseUrl, item.object_key!);
        anchor.download = item.name;
        anchor.target = "_blank";
        anchor.rel = "noopener";
        anchor.click();
      });
    closeContextMenu();
  }

  function openRenameDialog() {
    if (selectedItems.length !== 1) return;
    setRenameTarget(selectedItems[0]);
    setRenameValue(selectedItems[0].name);
    closeContextMenu();
  }

  function closeRenameDialog() {
    setRenameTarget(null);
  }

  function submitRename() {
    if (!renameTarget) return;
    const name = renameValue.trim();
    if (!name) return;
    fetch(mutationUrl(apiBaseUrl, renameTarget), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return response.json();
      })
      .then(() => {
        showToast(`Renamed to "${name}".`);
        setRenameTarget(null);
        clearSelection();
        refreshItems();
      })
      .catch((err: unknown) => showToast(err instanceof Error ? err.message : "Rename failed", "error"));
  }

  function handleTrashSelected() {
    const targets = selectedItems;
    closeContextMenu();
    Promise.all(
      targets.map((item) =>
        fetch(`${mutationUrl(apiBaseUrl, item)}/trash`, { method: "POST" }).then((response) => {
          if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
          return response.json();
        }),
      ),
    )
      .then(() => {
        showToast(`Moved ${targets.length} item${targets.length === 1 ? "" : "s"} to trash.`);
        clearSelection();
        refreshItems();
      })
      .catch((err: unknown) => showToast(err instanceof Error ? err.message : "Failed to move to trash", "error"));
  }

  function handleRestoreSelected() {
    const targets = selectedItems;
    closeContextMenu();
    Promise.all(
      targets.map((item) =>
        fetch(`${mutationUrl(apiBaseUrl, item)}/restore`, { method: "POST" }).then((response) => {
          if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
          return response.json();
        }),
      ),
    )
      .then(() => {
        showToast(`Restored ${targets.length} item${targets.length === 1 ? "" : "s"}.`);
        clearSelection();
        refreshItems();
      })
      .catch((err: unknown) => showToast(err instanceof Error ? err.message : "Restore failed", "error"));
  }

  function openDeleteForeverConfirm() {
    closeContextMenu();
    setConfirmDeleteOpen(true);
  }

  function closeDeleteForeverConfirm() {
    setConfirmDeleteOpen(false);
  }

  function confirmDeleteForever() {
    const targets = selectedItems;
    setConfirmDeleteOpen(false);
    Promise.all(
      targets.map((item) =>
        fetch(mutationUrl(apiBaseUrl, item), { method: "DELETE" }).then((response) => {
          if (!response.ok && response.status !== 204) throw new Error(`${response.status} ${response.statusText}`);
        }),
      ),
    )
      .then(() => {
        showToast(`Permanently deleted ${targets.length} item${targets.length === 1 ? "" : "s"}.`);
        clearSelection();
        refreshItems();
      })
      .catch((err: unknown) => showToast(err instanceof Error ? err.message : "Delete failed", "error"));
  }

  return {
    newFolderOpen,
    newFolderName,
    setNewFolderName,
    openNewFolderDialog,
    closeNewFolderDialog,
    handleCreateFolder,
    handleDownloadSelected,
    renameTarget,
    renameValue,
    setRenameValue,
    openRenameDialog,
    closeRenameDialog,
    submitRename,
    handleTrashSelected,
    handleRestoreSelected,
    confirmDeleteOpen,
    openDeleteForeverConfirm,
    closeDeleteForeverConfirm,
    confirmDeleteForever,
  };
}
