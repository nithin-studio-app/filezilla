import { useRef, useState } from "react";
import { itemKey } from "../utils";
import type { Item } from "../types";

// Owns the multi-select state machine (ctrl/cmd toggle, shift range-select,
// select-all) for whatever list of items is currently on screen. Knows
// nothing about what a "click" on an item means beyond selecting it — that
// interpretation (open vs. select) belongs to the caller.
export function useSelection(filteredItems: Item[]) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const lastSelectedIndex = useRef<number | null>(null);

  const selectedItems = filteredItems.filter((item) => selectedKeys.has(itemKey(item)));

  function clearSelection() {
    setSelectedKeys(new Set());
    lastSelectedIndex.current = null;
  }

  function toggleSelection(item: Item, index: number) {
    setSelectedKeys((current) => {
      const next = new Set(current);
      const key = itemKey(item);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    lastSelectedIndex.current = index;
  }

  function selectRange(index: number) {
    const anchor = lastSelectedIndex.current ?? index;
    const [start, end] = anchor <= index ? [anchor, index] : [index, anchor];
    setSelectedKeys((current) => {
      const next = new Set(current);
      for (let i = start; i <= end; i++) next.add(itemKey(filteredItems[i]));
      return next;
    });
    lastSelectedIndex.current = index;
  }

  function selectOnly(item: Item, index: number) {
    setSelectedKeys(new Set([itemKey(item)]));
    lastSelectedIndex.current = index;
  }

  function toggleSelectAll() {
    if (filteredItems.length > 0 && selectedKeys.size === filteredItems.length) {
      clearSelection();
    } else {
      setSelectedKeys(new Set(filteredItems.map(itemKey)));
    }
  }

  return {
    selectedKeys,
    selectedItems,
    clearSelection,
    toggleSelection,
    selectRange,
    selectOnly,
    toggleSelectAll,
  };
}
