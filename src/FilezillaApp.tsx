import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { FileManager } from "./FileManager";

export interface FilezillaAppProps {
  /** Called when the user wants to leave filezilla entirely — deciding
   * where "back" goes is the host's call, not this app's. */
  onBack?: () => void;
  /** Base URL of filezilla-api. Defaults to the local dev port. */
  apiBaseUrl?: string;
  serviceName?: string;
  /** Where the host mounted this app in its router, e.g. "/services/filezilla"
   * — used to build absolute URLs for this app's own folder/file sub-routes.
   * Defaults to "" (mounted at the router root), for standalone use. */
  basePath?: string;
}

function FilezillaRoute({ onBack, apiBaseUrl, serviceName, basePath = "" }: FilezillaAppProps) {
  const navigate = useNavigate();
  const { folderId, fileId } = useParams();

  function handleNavigate(nextFolderId: number | null, nextFileId: number | null) {
    let path = basePath;
    // A file preview only appears in the URL when it's inside a folder —
    // /:folderId and a root-level /:fileId would be indistinguishable at a
    // single path segment, so previewing a root-level file just doesn't
    // update the URL (still works, via FileManager's internal state).
    if (nextFolderId !== null) {
      path += `/${nextFolderId}`;
      if (nextFileId !== null) path += `/${nextFileId}`;
    }
    navigate(path || "/", { replace: true });
  }

  return (
    <FileManager
      serviceName={serviceName}
      apiBaseUrl={apiBaseUrl}
      onBack={onBack}
      initialFolderId={folderId ? Number(folderId) : null}
      initialFileId={fileId ? Number(fileId) : null}
      onNavigate={handleNavigate}
    />
  );
}

/**
 * Owns every route beneath wherever the host mounts it — mount this at a
 * single wildcard (e.g. `<Route path="services/filezilla/*" element={<FilezillaApp basePath="/services/filezilla" .../>} />`)
 * and it handles its own folder/file deep-linking internally. The host
 * never needs to know or touch this shape; changes to it stay entirely
 * within this package.
 */
export function FilezillaApp(props: FilezillaAppProps) {
  return (
    <Routes>
      <Route index element={<FilezillaRoute {...props} />} />
      <Route path=":folderId" element={<FilezillaRoute {...props} />} />
      <Route path=":folderId/:fileId" element={<FilezillaRoute {...props} />} />
    </Routes>
  );
}
