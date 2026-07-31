import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { uploadFileWithProgress } from "../utils";

interface UseUploadOptions {
  apiBaseUrl: string;
  currentFolderId: number | null;
  showToast: (text: string, severity?: "info" | "error") => void;
  onUploaded: () => void;
}

// Owns everything about getting files into the current folder: the file
// picker, drag-and-drop, and aggregate upload progress. Knows nothing
// about the listing itself — just calls onUploaded when done.
export function useUpload({ apiBaseUrl, currentFolderId, showToast, onUploaded }: UseUploadOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ loaded: number; total: number } | null>(null);
  const dragCounter = useRef(0);

  function uploadFiles(files: File[]) {
    if (files.length === 0) return;
    setIsUploading(true);
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    const loadedPerFile = new Array(files.length).fill(0);
    setUploadProgress({ loaded: 0, total: totalBytes });

    function reportProgress(index: number, loaded: number) {
      loadedPerFile[index] = loaded;
      setUploadProgress({ loaded: loadedPerFile.reduce((sum, value) => sum + value, 0), total: totalBytes });
    }

    const uploads = files.map((file, index) => {
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolderId !== null) formData.append("folder_id", String(currentFolderId));
      return uploadFileWithProgress(`${apiBaseUrl}/files/upload`, formData, (loaded) => reportProgress(index, loaded));
    });

    Promise.all(uploads)
      .then(() => {
        showToast(`Uploaded ${files.length} file${files.length === 1 ? "" : "s"}.`);
        onUploaded();
      })
      .catch((err: unknown) => {
        showToast(err instanceof Error ? `Upload failed: ${err.message}` : "Upload failed.", "error");
      })
      .finally(() => {
        setIsUploading(false);
        setUploadProgress(null);
      });
  }

  function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    uploadFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounter.current += 1;
    if (event.dataTransfer.types.includes("Files")) setIsDragging(true);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    // Folders dropped from the OS come through as entries with no reliable
    // File contents via the plain files list — real folder upload needs
    // DataTransferItem.webkitGetAsEntry() traversal, not implemented yet.
    // Individual files (including ones picked out of a dropped folder by
    // the browser) upload fine as-is.
    uploadFiles(Array.from(event.dataTransfer.files));
  }

  return {
    isDragging,
    isUploading,
    uploadProgress,
    handleFilesSelected,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
