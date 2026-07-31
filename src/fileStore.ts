import { useReducer } from "react";
import type { FileEntry } from "./types";

interface State {
  entries: FileEntry[];
}

type Action =
  | { type: "createFolder"; parentId: string | null; name: string }
  | { type: "uploadFiles"; parentId: string | null; files: File[] }
  | { type: "delete"; id: string };

// Frontend-only for now — files live in memory for the session (real bytes,
// via object URLs, so preview/download genuinely work). Swap this reducer
// for API calls once gatekeeper-api/MinIO wiring is ready; callers only see
// the methods returned by useFileManagerState, not this reducer shape.
function collectDescendantIds(entries: FileEntry[], id: string): Set<string> {
  const ids = new Set<string>([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const entry of entries) {
      if (entry.parentId && ids.has(entry.parentId) && !ids.has(entry.id)) {
        ids.add(entry.id);
        changed = true;
      }
    }
  }
  return ids;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "createFolder": {
      const entry: FileEntry = {
        id: crypto.randomUUID(),
        name: action.name,
        kind: "folder",
        parentId: action.parentId,
        createdAt: Date.now(),
      };
      return { entries: [...state.entries, entry] };
    }
    case "uploadFiles": {
      const newEntries: FileEntry[] = action.files.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        kind: "file",
        parentId: action.parentId,
        size: file.size,
        mimeType: file.type,
        blobUrl: URL.createObjectURL(file),
        createdAt: Date.now(),
      }));
      return { entries: [...state.entries, ...newEntries] };
    }
    case "delete": {
      const idsToDelete = collectDescendantIds(state.entries, action.id);
      for (const entry of state.entries) {
        if (idsToDelete.has(entry.id) && entry.blobUrl) URL.revokeObjectURL(entry.blobUrl);
      }
      return { entries: state.entries.filter((entry) => !idsToDelete.has(entry.id)) };
    }
  }
}

export function useFileManagerState() {
  const [state, dispatch] = useReducer(reducer, { entries: [] });

  function childrenOf(parentId: string | null): FileEntry[] {
    return state.entries
      .filter((entry) => entry.parentId === parentId)
      .sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }

  function pathTo(id: string | null): FileEntry[] {
    const trail: FileEntry[] = [];
    let current = id;
    while (current) {
      const entry = state.entries.find((candidate) => candidate.id === current);
      if (!entry) break;
      trail.unshift(entry);
      current = entry.parentId;
    }
    return trail;
  }

  return {
    childrenOf,
    pathTo,
    createFolder: (parentId: string | null, name: string) => dispatch({ type: "createFolder", parentId, name }),
    uploadFiles: (parentId: string | null, files: File[]) => dispatch({ type: "uploadFiles", parentId, files }),
    deleteEntry: (id: string) => dispatch({ type: "delete", id }),
  };
}
