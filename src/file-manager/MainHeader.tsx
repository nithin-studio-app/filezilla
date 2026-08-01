import type { ChangeEvent, RefObject } from "react";
import {
  AddIcon,
  Breadcrumbs,
  Button,
  Checkbox,
  CloseIcon,
  DownloadIcon,
  GridViewIcon,
  HomeIcon,
  RefreshIcon,
  SearchIcon,
  StarIcon,
  TableViewIcon,
  Text,
  TextField,
  TrashIcon,
  UploadIcon,
} from "@nithin-studio-app/ui-components";
import type { PathEntry, ViewMode } from "./types";

interface MainHeaderProps {
  showHeaderLeft: boolean;
  isTrash: boolean;
  isRecent: boolean;
  isStarred: boolean;
  selectedCount: number;
  totalCount: number;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onRestoreSelected: () => void;
  onDeleteForeverConfirm: () => void;
  onDownloadSelected: () => void;
  onTrashSelected: () => void;
  onStarSelected: () => void;
  onUnstarSelected: () => void;
  path: PathEntry[];
  onGoToRoot: () => void;
  onGoToPathIndex: (index: number) => void;
  searchOpen: boolean;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  query: string;
  onQueryChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNewFolder: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFilesSelected: (event: ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export function MainHeader({
  showHeaderLeft,
  isTrash,
  isRecent,
  isStarred,
  selectedCount,
  totalCount,
  onToggleSelectAll,
  onClearSelection,
  onRestoreSelected,
  onDeleteForeverConfirm,
  onDownloadSelected,
  onTrashSelected,
  onStarSelected,
  onUnstarSelected,
  path,
  onGoToRoot,
  onGoToPathIndex,
  searchOpen,
  onOpenSearch,
  onCloseSearch,
  query,
  onQueryChange,
  viewMode,
  onViewModeChange,
  onNewFolder,
  fileInputRef,
  onFilesSelected,
  isUploading,
}: MainHeaderProps) {
  return (
    <div className="file-manager-panel-header file-manager-main-header">
      {showHeaderLeft ? (
        <div className="file-manager-header-left">
          {selectedCount > 0 && (
            <Checkbox
              checked={selectedCount === totalCount}
              indeterminate={selectedCount > 0 && selectedCount < totalCount}
              onChange={onToggleSelectAll}
              aria-label="Select all"
            />
          )}
          {selectedCount > 0 ? (
            <div className="file-manager-selection-bar">
              <button
                type="button"
                className="file-manager-selection-clear"
                onClick={onClearSelection}
                aria-label="Clear selection"
              >
                <CloseIcon />
              </button>
              <Text variant="body2">{selectedCount} selected</Text>
              <div className="file-manager-selection-actions">
                {isTrash ? (
                  <>
                    <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={onRestoreSelected}>
                      Restore
                    </Button>
                    <Button variant="outlined" size="small" startIcon={<TrashIcon />} onClick={onDeleteForeverConfirm}>
                      Delete forever
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={onDownloadSelected}>
                      Download
                    </Button>
                    {isStarred ? (
                      <Button variant="outlined" size="small" startIcon={<StarIcon />} onClick={onUnstarSelected}>
                        Remove from starred
                      </Button>
                    ) : (
                      <Button variant="outlined" size="small" startIcon={<StarIcon />} onClick={onStarSelected}>
                        Add to starred
                      </Button>
                    )}
                    <Button variant="outlined" size="small" startIcon={<TrashIcon />} onClick={onTrashSelected}>
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : isTrash ? (
            <Text variant="h6">Trash</Text>
          ) : isRecent ? (
            <Text variant="h6">Recently Added</Text>
          ) : isStarred ? (
            <Text variant="h6">Starred</Text>
          ) : (
            <div className="file-manager-breadcrumbs">
              <Breadcrumbs>
                <button type="button" className="file-manager-breadcrumb-home" onClick={onGoToRoot} aria-label="Home">
                  <HomeIcon />
                </button>
                {path.map((entry, index) => (
                  <button type="button" key={entry.id} onClick={() => onGoToPathIndex(index)}>
                    {entry.name}
                  </button>
                ))}
              </Breadcrumbs>
            </div>
          )}
        </div>
      ) : (
        <div className="file-manager-header-spacer" />
      )}
      <div className="file-manager-main-header-actions">
        <div className={searchOpen ? "file-manager-search" : "file-manager-search file-manager-search-collapsed"}>
          {searchOpen ? (
            <TextField
              placeholder="Jump to a folder"
              value={query}
              onChange={onQueryChange}
              startAdornment={<SearchIcon />}
              endAdornment={
                <button
                  type="button"
                  className="file-manager-search-collapse"
                  onClick={onCloseSearch}
                  aria-label="Close search"
                >
                  <CloseIcon />
                </button>
              }
              size="small"
              fullWidth
              aria-label="Jump to a folder"
            />
          ) : (
            <button type="button" className="file-manager-search-toggle" onClick={onOpenSearch} aria-label="Search">
              <SearchIcon />
            </button>
          )}
        </div>
        <div className="file-manager-view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            className={viewMode === "table" ? "active" : undefined}
            aria-pressed={viewMode === "table"}
            aria-label="Table view"
            onClick={() => onViewModeChange("table")}
          >
            <TableViewIcon />
          </button>
          <button
            type="button"
            className={viewMode === "grid" ? "active" : undefined}
            aria-pressed={viewMode === "grid"}
            aria-label="Grid view"
            onClick={() => onViewModeChange("grid")}
          >
            <GridViewIcon />
          </button>
        </div>
        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={onNewFolder}>
          New folder
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          loading={isUploading}
        >
          Upload
        </Button>
        <input ref={fileInputRef} type="file" multiple hidden onChange={onFilesSelected} />
      </div>
    </div>
  );
}
