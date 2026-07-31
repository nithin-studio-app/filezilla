import type { Item } from "./types";

export function formatSize(bytes?: number): string {
  if (bytes === undefined) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function isImage(item: Item): boolean {
  return item.kind === "file" && Boolean(item.content_type?.startsWith("image/"));
}

export function isVideo(item: Item): boolean {
  return item.kind === "file" && Boolean(item.content_type?.startsWith("video/"));
}

export function isPreviewable(item: Item): boolean {
  return isImage(item) || isVideo(item);
}

export function hasReadyPreview(item: Item): boolean {
  return isPreviewable(item) && item.preview_status === "ready" && Boolean(item.preview_key);
}

export function itemKey(item: Item): string {
  return `${item.kind}-${item.id}`;
}

export function buildObjectUrl(apiBaseUrl: string, key: string): string {
  return `${apiBaseUrl}/objects/${encodeURIComponent(key)}`;
}

export function mutationUrl(apiBaseUrl: string, item: Item): string {
  return `${apiBaseUrl}/${item.kind === "folder" ? "folders" : "files"}/${item.id}`;
}

// fetch() has no way to observe upload progress on the request body — only
// XMLHttpRequest exposes an upload.onprogress event, so this uses that
// directly instead of the fetch-based pattern used everywhere else here.
export function uploadFileWithProgress(
  url: string,
  formData: FormData,
  onProgress: (loaded: number) => void,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(xhr.responseText ? JSON.parse(xhr.responseText) : null);
        } catch {
          resolve(null);
        }
      } else {
        reject(new Error(`${xhr.status} ${xhr.statusText}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}
