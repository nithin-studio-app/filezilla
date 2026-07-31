export interface FileEntry {
  id: string;
  name: string;
  kind: "folder" | "file";
  parentId: string | null;
  size?: number;
  mimeType?: string;
  blobUrl?: string;
  createdAt: number;
}
