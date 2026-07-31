import { Button, Dialog, Text, TextField } from "@nithin-studio-app/ui-components";

interface FileManagerDialogsProps {
  newFolderOpen: boolean;
  onNewFolderClose: () => void;
  newFolderName: string;
  onNewFolderNameChange: (value: string) => void;
  onCreateFolder: () => void;

  renameOpen: boolean;
  onRenameClose: () => void;
  renameValue: string;
  onRenameValueChange: (value: string) => void;
  onSubmitRename: () => void;

  confirmDeleteOpen: boolean;
  onConfirmDeleteClose: () => void;
  onConfirmDeleteForever: () => void;
  deleteCount: number;
}

export function FileManagerDialogs({
  newFolderOpen,
  onNewFolderClose,
  newFolderName,
  onNewFolderNameChange,
  onCreateFolder,
  renameOpen,
  onRenameClose,
  renameValue,
  onRenameValueChange,
  onSubmitRename,
  confirmDeleteOpen,
  onConfirmDeleteClose,
  onConfirmDeleteForever,
  deleteCount,
}: FileManagerDialogsProps) {
  return (
    <>
      <Dialog
        open={newFolderOpen}
        onClose={onNewFolderClose}
        title="New folder"
        actions={
          <>
            <Button variant="text" onClick={onNewFolderClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={onCreateFolder}>
              Create
            </Button>
          </>
        }
      >
        <TextField label="Folder name" value={newFolderName} onChange={onNewFolderNameChange} fullWidth />
      </Dialog>

      <Dialog
        open={renameOpen}
        onClose={onRenameClose}
        title="Rename"
        actions={
          <>
            <Button variant="text" onClick={onRenameClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={onSubmitRename}>
              Rename
            </Button>
          </>
        }
      >
        <TextField label="Name" value={renameValue} onChange={onRenameValueChange} fullWidth />
      </Dialog>

      <Dialog
        open={confirmDeleteOpen}
        onClose={onConfirmDeleteClose}
        title="Delete forever"
        actions={
          <>
            <Button variant="text" onClick={onConfirmDeleteClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={onConfirmDeleteForever}>
              Delete forever
            </Button>
          </>
        }
      >
        <Text variant="body2">
          Permanently delete {deleteCount} item{deleteCount === 1 ? "" : "s"}? This can't be undone.
        </Text>
      </Dialog>
    </>
  );
}
