# Auth Plugin (Plug‑and‑Play)

A self-contained authentication plugin for the Super‑App marketplace. It auto‑mounts a login/register modal on import and exposes a tiny SDK. Works in two modes:

- **Supabase mode** (real auth): when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set and `@supabase/supabase-js` is installed.
- **Demo mode** (mock auth): when the env or library is missing, falls back to a local `localStorage` session so you can develop immediately.

---

## Quick Start

1) **Install (optional for real auth)**
```bash
pnpm add @supabase/supabase-js
```
2) **Set environment (optional for real auth)**
```
# .env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```
3) **Import on the page that needs it** (side‑effect import mounts the modal host):
```ts
// e.g., src/pages/Home.tsx
import "@/plugins/auth";                    // auto‑mount host for this page only
import { ensureSession } from "@/plugins/auth";

export default function Home() {
  return (
    <button onClick={async () => {
      const res = await ensureSession();    // opens modal if not signed in
      if (res.ok) alert(`Signed in as ${res.session.user.email}`);
    }}>Sign In</button>
  );
}
```

> You can also do a **dynamic import** to load only on demand:
```ts
const { ensureSession } = await import("@/plugins/auth");
```

---

## What’s inside

```
src/plugins/auth/
  index.ts            # re-exports SDK + auto-mounts host on import
  sdk.ts              # public API (ensureSession, getSession, signOut, openAuth)
  host.tsx            # modal host, listens & emits events, auto-mounts to <body>
  types.ts            # User, Session, AuthResult, etc.
  services/supabase.ts# optional Supabase client factory + normalizers
  ui/AuthModal.tsx    # login/register UI (password + optional Google OAuth)
```

- `index.ts` includes `import "./host"`, so simply importing the plugin runs the host initializer.
- The host is SSR‑safe (DOM work happens in the browser).

---

## SDK

```ts
import { openAuth, ensureSession, getSession, signOut } from "@/plugins/auth";
```

- **`openAuth()`** → fire‑and‑forget; opens the modal (no result awaited).
- **`ensureSession()`** → `Promise<AuthResult>`; opens the modal if needed and resolves with `{ ok: true, session }` or `{ ok: false, error }`.
- **`getSession()`** → `Promise<Session | null>`; returns current session without opening UI.
- **`signOut()`** → clears session (Supabase or demo).

**Types**
```ts
type User = { id: string; email: string; name?: string; avatarUrl?: string; provider?: "password" | "google" };
type Session = { user: User; accessToken?: string };
type AuthResult = { ok: true; session: Session } | { ok: false; error: string };
```

---

## Usage Patterns

### A) Per‑page static import (recommended)
Mounts host only when that page is loaded.
```ts
import "@/plugins/auth";                 // auto‑mount
import { ensureSession } from "@/plugins/auth";
```

### B) On‑demand (dynamic) import
Best for minimal initial bundle.
```ts
const { ensureSession } = await import("@/plugins/auth");
await ensureSession();
```

### C) Global autoload (mount all plugins once)
```ts
// src/plugins/_autoload.ts
import.meta.glob("../plugins/**/index.ts", { eager: true });

// then in src/main.tsx, import "./plugins/_autoload"
```

---

## Supabase Notes (real auth)

1) Install:
```bash
pnpm add @supabase/supabase-js
```
2) Env:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
3) **Auth Redirect URLs** (for Google OAuth):
- In Supabase Dashboard → Authentication → URL Configuration:
  - Add `http://localhost:5173` and your production domain to **Redirect URLs**.
4) Providers:
- Enable **Google** in Authentication → Providers (copy Client ID/Secret).

The plugin normalizes Supabase sessions to the plugin’s `Session` shape.

---

## Demo Mode (no setup)

If env or `@supabase/supabase-js` is missing, the plugin uses **mock auth**:
- Sign‑in/up stores a session in `localStorage` (`auth:mock:user`).
- `getSession()` reads from there; `signOut()` clears it.
- You can develop the rest of the app without any backend.

A yellow notice appears in the modal: “Using demo auth.”

---

## Events (advanced)

If you need to hook into lifecycle via the bus:
- `auth:open` → request to open modal
- `auth:done` → `{ ok, session? }` when the flow completes
- `auth:get-session` → ask host for the current session
- `auth:session-result` → `{ session }` reply
- `auth:signout` → sign out request

> In most cases, the **SDK** is all you need—no direct eventing required.

---

## Troubleshooting

- **Modal doesn’t open**
  - Ensure the plugin is imported on that page (`import "@/plugins/auth"`), or call any SDK function which also imports it.
- **Type errors with path aliases**
  - Vite and TS are configured for `@/*` → `src/*`. Restart TS server/VS Code if your editor lags.
- **Google sign‑in not working**
  - Check Supabase Redirect URLs and provider configuration.
- **Stuck in demo mode**
  - Install `@supabase/supabase-js` and set both `VITE_SUPABASE_*` env variables, then restart `pnpm dev`.

---

## Example Button (copy‑paste)

```tsx
import "@/plugins/auth";
import { ensureSession, getSession, signOut } from "@/plugins/auth";

export function AuthTester() {
  return (
    <div className="flex gap-2">
      <button className="rounded-xl bg-black text-white px-3 py-2" onClick={async () => {
        const res = await ensureSession();
        alert(res.ok ? `Signed in as ${res.session.user.email}` : `Error: ${res.error}`);
      }}>Sign In</button>

      <button className="rounded-xl bg-gray-200 px-3 py-2" onClick={async () => {
        const s = await getSession();
        alert(s ? `Session: ${s.user.email}` : "No session");
      }}>Check Session</button>

      <button className="rounded-xl bg-gray-200 px-3 py-2" onClick={async () => {
        await signOut();
        alert("Signed out");
      }}>Sign Out</button>
    </div>
  );
}
```

---

## License
Add your preferred license here.
