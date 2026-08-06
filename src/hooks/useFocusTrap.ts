import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";

const FOCUSABLE_SELECTOR =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/**
 * Shared behavior for any modal-like overlay (Dialog, MediaPreview): moves
 * focus into the container on open (onto its first focusable element),
 * traps Tab within it, restores focus to whatever triggered it on close,
 * and calls `onEscape` when Escape is pressed inside it.
 *
 * Attach `containerRef` to the focus-trapping element and spread
 * `{ onKeyDown: handleKeyDown }` onto it (or call it from your own handler).
 */
export function useFocusTrap<T extends HTMLElement>(open: boolean, onEscape?: () => void) {
  const containerRef = useRef<T>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    const firstFocusable = container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (firstFocusable ?? container)?.focus();

    return () => {
      previouslyFocused.current?.focus();
    };
  }, [open]);

  function handleKeyDown(event: KeyboardEvent<T>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onEscape?.();
      return;
    }
    if (event.key !== "Tab") return;

    const container = containerRef.current;
    if (!container) return;
    const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return { containerRef, handleKeyDown };
}
