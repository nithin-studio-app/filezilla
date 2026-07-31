import type { ReactNode } from "react";

export type PreviewStatus = "pending" | "ready" | "failed" | null;

export interface Item {
  id: number;
  kind: "folder" | "file";
  name: string;
  created_at: string;
  size_bytes?: number;
  content_type?: string;
  object_key?: string;
  preview_key?: string | null;
  preview_status?: PreviewStatus;
  trashed_at?: string | null;
}

export interface PathEntry {
  id: number;
  name: string;
}

export type NavSection = "home" | "recent" | "starred" | "trash";
export type ViewMode = "table" | "grid";

export interface NavSectionConfig {
  key: NavSection;
  label: string;
  icon: ReactNode;
}
