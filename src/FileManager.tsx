import { useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, UIEvent } from "react";
import { Alert, Button, CalendarIcon, FolderIcon, MediaPreview, ProgressBar, Snackbar, Text, TrashIcon, UploadIcon } from "@nithin-studio-app/ui-components";
import { ContextMenu } from "./file-manager/ContextMenu";
import { FileGrid } from "./file-manager/FileGrid";
import { FileManagerDialogs } from "./file-manager/FileManagerDialogs";
import { FileTable } from "./file-manager/FileTable";
import { useContextMenu } from "./file-manager/hooks/useContextMenu";
import { useFileMutations } from "./file-manager/hooks/useFileMutations";
import { useFilePreview } from "./file-manager/hooks/useFilePreview";
import { useItemsData } from "./file-manager/hooks/useItemsData";
import { useNavigation } from "./file-manager/hooks/useNavigation";
import { usePreviewPolling } from "./file-manager/hooks/usePreviewPolling";
import { useSearch } from "./file-manager/hooks/useSearch";
import { useSelection } from "./file-manager/hooks/useSelection";
import { useToast } from "./file-manager/hooks/useToast";
import { useUpload } from "./file-manager/hooks/useUpload";
import { MainHeader } from "./file-manager/MainHeader";
import { NAV_SECTIONS, Sidebar } from "./file-manager/Sidebar";
import type { Item, NavSection, ViewMode } from "./file-manager/types";
import { buildObjectUrl, isPreviewable, itemKey } from "./file-manager/utils";
import "./FileManager.css";

export interface FileManagerProps {
  serviceName?: string;
  onBack?: () => void;
  /** Base URL of filezilla-api. Defaults to the local dev port. */
  apiBaseUrl?: string;
  /**
   * Deep-link support, all optional — omit every one of these to use this
   * component in a fully self-contained, router-agnostic way (its default).
   * A host that owns routing (e.g. to reflect the current folder/file in
   * the URL for shareable links / easier debugging) can pass these in:
   *
   * - `initialFolderId`: folder to show — `undefined` means "don't control
   *   this" (internal navigation only), `null` means root, a number means
   *   that folder (resolved via GET /folders/{id}/path on change).
   * - `initialFileId`: file to open in preview, same undefined/null/number
   *   convention. Only takes effect once that file appears in the current
   *   folder's loaded items.
   * - `onNavigate`: called whenever the current folder or previewed file
   *   changes from *inside* this component, so the host can sync the URL.
   */
  initialFolderId?: number | null;
  initialFileId?: number | null;
  onNavigate?: (folderId: number | null, fileId: number | null) => void;
}

// Composition root: wires together single-responsibility hooks (each one
// owns exactly one concern — navigation, item data, selection, upload,
// search, preview, context menu, mutations) and renders the layout. Cross-
// cutting interactions that touch more than one concern (e.g. "clear
// selection when navigating", "open a folder or preview a file on click")
// live here rather than inside any one hook, since gluing concerns
// together is this component's actual job.
export function FileManager({
  serviceName = "Filezilla",
  onBack,
  apiBaseUrl = "http://localhost:8002",
  initialFolderId,
  initialFileId,
  onNavigate,
}: FileManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast, showToast, closeToast } = useToast();

  const navigation = useNavigation({ apiBaseUrl, initialFolderId, onNavigate, showToast });

  const itemsData = useItemsData({
    apiBaseUrl,
    currentFolderId: navigation.currentFolderId,
    activeNav: navigation.activeNav,
    isTrash: navigation.isTrash,
    isRecent: navigation.isRecent,
    showToast,
  });

  const filteredItems = navigation.isTrash ? itemsData.trashItems : navigation.isRecent ? itemsData.recentItems : itemsData.items;

  const selection = useSelection(filteredItems);

  usePreviewPolling(itemsData.items, itemsData.patchItems, apiBaseUrl);

  const search = useSearch({
    apiBaseUrl,
    showToast,
    onFound: (result) => {
      selection.clearSelection();
      navigation.jumpToFolder(result.id, result.path);
    },
  });

  const preview = useFilePreview({
    filteredItems,
    apiBaseUrl,
    initialFileId,
    currentFolderId: navigation.currentFolderId,
    onNavigate,
    showToast,
  });

  const contextMenu = useContextMenu();

  const upload = useUpload({
    apiBaseUrl,
    currentFolderId: navigation.currentFolderId,
    showToast,
    onUploaded: itemsData.refreshItems,
  });

  const mutations = useFileMutations({
    apiBaseUrl,
    selectedItems: selection.selectedItems,
    showToast,
    refreshItems: itemsData.refreshItems,
    clearSelection: selection.clearSelection,
    closeContextMenu: contextMenu.close,
  });

  function goToRoot() {
    selection.clearSelection();
    navigation.goToRoot();
  }

  function goToPathIndex(index: number) {
    selection.clearSelection();
    navigation.goToPathIndex(index);
  }

  function switchNav(section: NavSection) {
    selection.clearSelection();
    navigation.switchNav(section);
  }

  function handleOpenItem(item: Item) {
    if (item.kind === "folder") {
      selection.clearSelection();
      navigation.openFolder(item);
      return;
    }
    if (isPreviewable(item)) {
      preview.openPreview(item);
      return;
    }
    showToast("No preview available for this file type.");
  }

  // Google-Drive-style: a plain click only selects (no checkbox needed for
  // that anymore); opening requires a double click. Shift/ctrl-click keep
  // their existing range/multi-select meaning either way.
  function handleItemClick(event: ReactMouseEvent, item: Item, index: number) {
    if (event.shiftKey) {
      event.preventDefault();
      selection.selectRange(index);
      return;
    }
    if (event.metaKey || event.ctrlKey) {
      event.preventDefault();
      selection.toggleSelection(item, index);
      return;
    }
    selection.selectOnly(item, index);
  }

  function handleItemDoubleClick(item: Item) {
    if (navigation.isTrash && item.kind === "folder") {
      showToast("Restore this folder to open it.");
      return;
    }
    if (navigation.isRecent && item.kind === "folder") {
      navigation.openFolderFlat(item);
      return;
    }
    handleOpenItem(item);
  }

  function handleContextMenu(event: ReactMouseEvent, item: Item, index: number) {
    event.preventDefault();
    if (!selection.selectedKeys.has(itemKey(item))) selection.selectOnly(item, index);
    contextMenu.openAt(event.clientX, event.clientY);
  }

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 200) itemsData.loadMore();
  }

  const objectUrl = (key: string) => buildObjectUrl(apiBaseUrl, key);
  const showHeaderLeft = navigation.activeNav === "home" || navigation.isTrash || navigation.isRecent;

  return (
    <div className="file-manager">
      <Sidebar
        serviceName={serviceName}
        onBack={onBack}
        activeNav={navigation.activeNav}
        onGoToRoot={goToRoot}
        onSwitchNav={switchNav}
      />
      <div className="file-manager-main">
        <MainHeader
          showHeaderLeft={showHeaderLeft}
          isTrash={navigation.isTrash}
          isRecent={navigation.isRecent}
          selectedCount={selection.selectedKeys.size}
          totalCount={filteredItems.length}
          onToggleSelectAll={selection.toggleSelectAll}
          onClearSelection={selection.clearSelection}
          onRestoreSelected={mutations.handleRestoreSelected}
          onDeleteForeverConfirm={mutations.openDeleteForeverConfirm}
          onDownloadSelected={mutations.handleDownloadSelected}
          onTrashSelected={mutations.handleTrashSelected}
          path={navigation.path}
          onGoToRoot={goToRoot}
          onGoToPathIndex={goToPathIndex}
          searchOpen={search.searchOpen}
          onOpenSearch={search.openSearch}
          onCloseSearch={search.closeSearch}
          query={search.query}
          onQueryChange={search.setQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNewFolder={mutations.openNewFolderDialog}
          fileInputRef={fileInputRef}
          onFilesSelected={upload.handleFilesSelected}
          isUploading={upload.isUploading}
        />
        <div
          className={["file-manager-panel-body", upload.isDragging && "file-manager-drop-active"].filter(Boolean).join(" ")}
          onDragEnter={upload.handleDragEnter}
          onDragOver={upload.handleDragOver}
          onDragLeave={upload.handleDragLeave}
          onDrop={upload.handleDrop}
          onScroll={handleScroll}
        >
          {upload.isDragging && (
            <div className="file-manager-drop-overlay">
              <UploadIcon />
              <Text variant="body2">Drop to upload</Text>
            </div>
          )}
          {upload.uploadProgress && (
            <div className="file-manager-upload-progress">
              <Text variant="body2" color="#9aa0a6">
                Uploading…
              </Text>
              <ProgressBar
                variant="linear"
                pct={upload.uploadProgress.total > 0 ? (upload.uploadProgress.loaded / upload.uploadProgress.total) * 100 : 0}
                showLabel
                aria-label="Upload progress"
              />
            </div>
          )}
          {navigation.activeNav !== "home" && !navigation.isTrash && !navigation.isRecent ? (
            <Text variant="body2" color="#9aa0a6">
              {NAV_SECTIONS.find((section) => section.key === navigation.activeNav)?.label} — coming soon.
            </Text>
          ) : itemsData.loading ? (
            <div className="file-manager-loading-state">
              <ProgressBar variant="indeterminate" aria-label="Loading files" />
            </div>
          ) : itemsData.error ? (
            <div className="file-manager-error-state">
              <Alert
                severity="error"
                title={
                  navigation.isTrash
                    ? "Couldn't load trash"
                    : navigation.isRecent
                      ? "Couldn't load recently added items"
                      : "Couldn't load this folder"
                }
              >
                {itemsData.error}
              </Alert>
              <Button variant="outlined" size="small" onClick={itemsData.refreshItems}>
                Retry
              </Button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="file-manager-empty-state">
              {navigation.isTrash ? <TrashIcon /> : navigation.isRecent ? <CalendarIcon /> : <FolderIcon />}
              <Text variant="h6">
                {navigation.isTrash ? "Trash is empty" : navigation.isRecent ? "Nothing added recently" : "This folder is empty"}
              </Text>
              <Text variant="body2" color="#9aa0a6">
                {navigation.isTrash
                  ? "Items you delete are moved here until you delete them forever."
                  : navigation.isRecent
                    ? "Files and folders you add will show up here."
                    : "Upload a file or create a folder to get started."}
              </Text>
            </div>
          ) : viewMode === "table" ? (
            <FileTable
              items={filteredItems}
              selectedKeys={selection.selectedKeys}
              objectUrl={objectUrl}
              onItemClick={handleItemClick}
              onItemDoubleClick={handleItemDoubleClick}
              onContextMenu={handleContextMenu}
            />
          ) : (
            <FileGrid
              items={filteredItems}
              selectedKeys={selection.selectedKeys}
              objectUrl={objectUrl}
              onItemClick={handleItemClick}
              onItemDoubleClick={handleItemDoubleClick}
              onContextMenu={handleContextMenu}
            />
          )}
          {itemsData.loadingMore && (
            <div className="file-manager-loading-more">
              <ProgressBar variant="indeterminate" height={0.3} aria-label="Loading more files" />
            </div>
          )}
        </div>
      </div>

      <FileManagerDialogs
        newFolderOpen={mutations.newFolderOpen}
        onNewFolderClose={mutations.closeNewFolderDialog}
        newFolderName={mutations.newFolderName}
        onNewFolderNameChange={mutations.setNewFolderName}
        onCreateFolder={mutations.handleCreateFolder}
        renameOpen={mutations.renameTarget !== null}
        onRenameClose={mutations.closeRenameDialog}
        renameValue={mutations.renameValue}
        onRenameValueChange={mutations.setRenameValue}
        onSubmitRename={mutations.submitRename}
        confirmDeleteOpen={mutations.confirmDeleteOpen}
        onConfirmDeleteClose={mutations.closeDeleteForeverConfirm}
        onConfirmDeleteForever={mutations.confirmDeleteForever}
        deleteCount={selection.selectedItems.length}
      />

      {contextMenu.contextMenu && (
        <ContextMenu
          x={contextMenu.contextMenu.x}
          y={contextMenu.contextMenu.y}
          isTrash={navigation.isTrash}
          canRename={!navigation.isTrash && selection.selectedItems.length === 1}
          canDownload={selection.selectedItems.some((item) => item.kind === "file")}
          onRename={mutations.openRenameDialog}
          onDownload={mutations.handleDownloadSelected}
          onRestore={mutations.handleRestoreSelected}
          onDeleteForeverConfirm={mutations.openDeleteForeverConfirm}
          onTrash={mutations.handleTrashSelected}
        />
      )}

      {preview.previewIndex !== null && (
        <MediaPreview
          items={preview.previewItems}
          index={preview.previewIndex}
          onIndexChange={preview.goToPreviewIndex}
          onClose={preview.closePreview}
          onDownload={preview.handleDownloadPreviewItem}
        />
      )}

      <Snackbar open={toast !== null} onClose={closeToast} autoHideDuration={4000}>
        {toast && (
          <Alert severity={toast.severity} onClose={closeToast}>
            {toast.text}
          </Alert>
        )}
      </Snackbar>
    </div>
  );
}
