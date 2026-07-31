# filezilla

Published for consumption by `nithin-studio`. `react`/`react-dom`/
`react-router-dom` are peer dependencies — never bundled — so the host
resolves a single shared copy of each.

## Integrating into a host

Mount `FilezillaApp` at a single wildcard route — it owns every route
beneath that mount point itself (folder/file deep-linking, breadcrumb
resolution, all of it), so the host never needs to know or touch that
shape. Changes to filezilla's routing stay entirely within this package.

```tsx
<Route
  path="services/filezilla/*"
  element={<FilezillaApp basePath="/services/filezilla" onBack={() => navigate("/services")} />}
/>
```

Props:

- `basePath`: where the host mounted this app (must match the route's
  path minus the trailing `/*`) — used to build this app's own absolute
  folder/file URLs. Defaults to `""` (mounted at the router root).
- `onBack`: called when the user wants to leave filezilla entirely.
  Deciding where "back" goes is the host's call, not this app's.
- `apiBaseUrl` / `serviceName`: forwarded to `FileManager` (see below).

## Using `FileManager` directly

`FilezillaApp` is a thin wrapper around `FileManager`, which is itself
**router-agnostic** — no `react-router-dom` dependency of its own. Use it
directly (skipping `FilezillaApp`) if you want a different routing setup
than the one above, or no URL-syncing at all (the default: pass nothing
and it manages folder/preview navigation purely as internal state).

Deep-linking props, all optional:

- `initialFolderId` / `initialFileId`: `undefined` = don't control it
  (default); `null` = root / no preview; a number = that folder/file.
  Changing these from outside resolves and jumps there — folder
  resolution calls `GET /folders/{id}/path` on `filezilla-api` to rebuild
  the breadcrumb trail.
- `onNavigate(folderId, fileId)`: called whenever the current folder or
  previewed file changes *from inside* this component, so a caller can
  push that into its own URL (this is exactly what `FilezillaApp` does).

`FilezillaApp`'s own URL shape is `{basePath}/{folderId}/{fileId}` (no
`folder`/`file` literal segments) — e.g. `/services/filezilla/42/107`.
Previewing a **root-level** file (no folder) isn't reflected in the URL,
since a bare `/:fileId` would be indistinguishable from `/:folderId` at a
single path segment — it still works, just via internal state only.

## Develop

Point `nithin-studio` at this repo's local `src` via its `LOCAL_*` alias env
var (see its `vite.config.ts`) to get live reload without publishing.

## Build

```bash
pnpm build
```
