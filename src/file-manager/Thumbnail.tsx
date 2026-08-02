import { useState } from "react";
import { FileIcon } from "@nithin-studio-app/ui-components";

interface ThumbnailProps {
  src: string;
  className: string;
}

// Falls back to FileIcon on a broken/expired URL instead of the browser's
// native broken-image icon. Tracks which src failed (not just a bare
// boolean) so a src change — e.g. the same item's preview_key changing
// after regeneration — naturally retries instead of staying stuck failed.
export function Thumbnail({ src, className }: ThumbnailProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === src) return <FileIcon />;

  return <img className={className} src={src} alt="" loading="lazy" onError={() => setFailedSrc(src)} />;
}
