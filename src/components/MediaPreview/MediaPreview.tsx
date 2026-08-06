import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { createPortal } from "react-dom";
import { Backdrop } from "../Backdrop";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon, AddIcon, RemoveIcon, DownloadIcon, TrashIcon } from "../icons";
import "./MediaPreview.css";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

export interface MediaPreviewItem {
  id: string;
  src: string;
  alt?: string;
  downloadName?: string;
  /** Defaults to "image" if omitted. */
  kind?: "image" | "video";
}

export interface MediaPreviewProps {
  items: MediaPreviewItem[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onDownload?: (item: MediaPreviewItem) => void;
  onDelete?: (item: MediaPreviewItem) => void;
}

// A full-screen lightbox — portals + traps focus like Dialog (composing
// the same Backdrop and useFocusTrap), plus zoom, drag-to-pan once
// zoomed in, and prev/next navigation on top. Renders nothing once
// `items[index]` is gone, so the caller controls its lifecycle by
// conditionally rendering it, same as Dialog's `open` gate — just driven
// by index validity instead of a separate flag.
export function MediaPreview({ items, index, onIndexChange, onClose, onDownload, onDelete }: MediaPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [zoomResetIndex, setZoomResetIndex] = useState(index);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOrigin = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const item = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;
  const { containerRef, handleKeyDown: trapKeyDown } = useFocusTrap<HTMLDivElement>(Boolean(item), onClose);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (index !== zoomResetIndex) {
    setZoomResetIndex(index);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  if (!item) return null;

  const isVideo = item.kind === "video";
  const isZoomed = zoom > MIN_ZOOM;

  function zoomIn() {
    setZoom((current) => Math.min(MAX_ZOOM, +(current + ZOOM_STEP).toFixed(2)));
  }

  function zoomOut() {
    setZoom((current) => {
      const next = Math.max(MIN_ZOOM, +(current - ZOOM_STEP).toFixed(2));
      if (next <= MIN_ZOOM) setPan({ x: 0, y: 0 });
      return next;
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    trapKeyDown(event);
    if (event.key === "ArrowLeft" && hasPrev) onIndexChange(index - 1);
    else if (event.key === "ArrowRight" && hasNext) onIndexChange(index + 1);
    else if (event.key === "+" || event.key === "=") zoomIn();
    else if (event.key === "-" || event.key === "_") zoomOut();
  }

  function handlePointerDown(event: PointerEvent<HTMLImageElement>) {
    if (!isZoomed) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOrigin.current = { startX: event.clientX, startY: event.clientY, panX: pan.x, panY: pan.y };
    setIsDragging(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLImageElement>) {
    if (!dragOrigin.current) return;
    const { startX, startY, panX, panY } = dragOrigin.current;
    setPan({ x: panX + (event.clientX - startX), y: panY + (event.clientY - startY) });
  }

  function handlePointerUp(event: PointerEvent<HTMLImageElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragOrigin.current = null;
    setIsDragging(false);
  }

  return createPortal(
    <Backdrop open onClick={onClose} className="media-preview-backdrop">
      <div
        ref={containerRef}
        className="media-preview-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Media preview"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="media-preview-toolbar">
          <span className="media-preview-counter">
            {index + 1} / {items.length}
          </span>
          <div className="media-preview-actions">
            {!isVideo && (
              <>
                <button type="button" onClick={zoomOut} disabled={zoom <= MIN_ZOOM} aria-label="Zoom out">
                  <RemoveIcon />
                </button>
                <span className="media-preview-zoom-level">{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={zoomIn} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in">
                  <AddIcon />
                </button>
              </>
            )}
            {onDownload && (
              <button type="button" onClick={() => onDownload(item)} aria-label="Download">
                <DownloadIcon />
              </button>
            )}
            {onDelete && (
              <button type="button" onClick={() => onDelete(item)} aria-label="Delete">
                <TrashIcon />
              </button>
            )}
            <button type="button" className="media-preview-close" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="media-preview-nav media-preview-prev"
          onClick={() => hasPrev && onIndexChange(index - 1)}
          disabled={!hasPrev}
          aria-label="Previous"
        >
          <ChevronLeftIcon />
        </button>

        <div className="media-preview-stage">
          {isVideo ? (
            <video src={item.src} controls autoPlay />
          ) : (
            <img
              src={item.src}
              alt={item.alt ?? ""}
              className={isZoomed ? (isDragging ? "is-draggable is-dragging" : "is-draggable") : undefined}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
              draggable={false}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          )}
        </div>

        <button
          type="button"
          className="media-preview-nav media-preview-next"
          onClick={() => hasNext && onIndexChange(index + 1)}
          disabled={!hasNext}
          aria-label="Next"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </Backdrop>,
    document.body,
  );
}
