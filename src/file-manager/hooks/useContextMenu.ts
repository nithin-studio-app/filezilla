import { useEffect, useState } from "react";

// Owns the right-click context menu's position and its own dismissal
// (outside click or Escape) — nothing about what the menu contains or does.
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Runs after the pointerdown that opened it (React effects fire after the
  // triggering render), so it never immediately closes its own menu.
  useEffect(() => {
    if (!contextMenu) return;
    function handlePointerDown() {
      setContextMenu(null);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setContextMenu(null);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextMenu]);

  function openAt(x: number, y: number) {
    setContextMenu({ x, y });
  }

  function close() {
    setContextMenu(null);
  }

  return { contextMenu, openAt, close };
}
