# filezilla

Standalone file manager app. Talks to `filezilla-api`.

## Run

```bash
pnpm install
cp .env.example .env   # edit VITE_API_BASE_URL if filezilla-api isn't on the default port
pnpm dev                # http://localhost:5173
```

```bash
pnpm build              # tsc --noEmit && vite build -> dist/
pnpm preview             # serve the production build locally
```

`VITE_API_BASE_URL` defaults to `http://localhost:8002` (`FileManager`'s
own built-in default) if left unset.

## URL shape

`src/main.tsx` mounts `FilezillaApp` at the router root, so folder/file
deep-linking lives directly at `/{folderId}/{fileId}` — e.g. `/42/107`.
Previewing a **root-level** file (no folder) isn't reflected in the URL,
since a bare `/:fileId` would be indistinguishable from `/:folderId` at a
single path segment — it still works, just via internal state only.

## Structure

`FilezillaApp` (`src/FilezillaApp.tsx`) is a thin router wrapper — owns
the `/:folderId`/`/:folderId/:fileId` routes, syncs them with
`FileManager`'s internal navigation state via `onNavigate`. `FileManager`
(`src/FileManager.tsx`) is itself **router-agnostic** — no
`react-router-dom` dependency of its own — so it's still reusable directly
(with `initialFolderId`/`initialFileId`/`onNavigate` props) if this ever
needs embedding somewhere else without a URL-synced router.

## UI components

`src/components/` is a small vendored copy of just the pieces this app
actually uses from `@nithin-studio-app/ui-components` (Button, Dialog,
TextField, Table, etc. — each in its own folder, plus `icons/`) — not a
dependency on that package. See
`CLAUDE.md` for why and how to pull in something new from there later.
