import { useEffect, useState } from "react";
import type { PathEntry } from "../types";

interface SearchResult {
  id: number;
  name: string;
  path: PathEntry[];
}

interface UseSearchOptions {
  apiBaseUrl: string;
  showToast: (text: string, severity?: "info" | "error") => void;
  onFound: (result: SearchResult) => void;
}

// Owns the collapsible "jump to a folder" search box: its open/closed
// state, the query text, and debounced lookup. Not a filter of the current
// listing — finding a match hands off navigation to the caller via onFound.
export function useSearch({ apiBaseUrl, showToast, onFound }: UseSearchOptions) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`${apiBaseUrl}/folders/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
          return response.json() as Promise<SearchResult[]>;
        })
        .then((results) => {
          if (results.length === 0) {
            showToast(`No folder matching "${trimmed}".`);
            return;
          }
          onFound(results[0]);
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          showToast(err instanceof Error ? err.message : "Search failed", "error");
        });
    }, 400);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the query text changes; showToast/onFound read via closure intentionally
  }, [query, apiBaseUrl]);

  function openSearch() {
    setSearchOpen(true);
  }

  function closeSearch() {
    setQuery("");
    setSearchOpen(false);
  }

  return { query, setQuery, searchOpen, openSearch, closeSearch };
}
