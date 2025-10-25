# Home Plugin (Plug‑and‑Play Landing/Dashboard)

A self-contained **landing screen** that opens automatically **after a successful login** or can be opened programmatically. It’s plug‑and‑play: the host auto‑mounts on import and the UI is internal.

Works with the Auth plugin via the event bus. No App.tsx edits required.

---

## What it does

- **Listens** for `auth:done` (Auth plugin success) and `auth:session-result` (session exists on page load after OAuth redirect).
- **Opens** a full‑page Home/Dashboard modal overlay showing a welcome and call‑to‑actions.
- Exposes an SDK: `openHome({ sessionEmail? })` to open it manually anywhere.

---

## File layout

```
src/plugins/home/
  index.ts           # exports SDK + auto-mounts host on import
  sdk.ts             # public API (openHome)
  host.tsx           # modal host, listens to bus, auto-mounts once
  types.ts           # HomeOpenInput
  ui/HomeScreen.tsx  # UI (you will customize this)
```

---

## Quick start (per-page, no shell edits)

1) Ensure you have the **Auth** plugin installed.
2) On the page where login happens (e.g., `src/pages/Home.tsx` or `Checkout.tsx`), add **only**:

```ts
import "@/plugins/auth";   // mounts Auth modal host on this page
import "@/plugins/home";   // listens for auth events & opens Home automatically
```

3) Invoke login (example button):

```tsx
import { ensureSession } from "@/plugins/auth";

export default function Page() {
  return (
    <button
      onClick={async () => {
        const res = await ensureSession();  // opens auth modal; resolves on success
        if (res.ok) console.log("Signed in:", res.session.user.email);
      }}
      className="rounded-2xl bg-black text-white px-4 py-2"
    >
      Sign in to continue
    </button>
  );
}
```

### What happens
- **Password/Demo sign-in**: `auth:done` fires → Home opens.
- **Google OAuth**: the page **reloads** (normal). On load, the Auth host emits `auth:session-result` → Home opens automatically with the user’s email.

---

## Programmatic open (optional)

Open Home anywhere without logging in:

```ts
import { openHome } from "@/plugins/home";

openHome({ sessionEmail: "user@example.com" });
```

`HomeOpenInput`:
```ts
type HomeOpenInput = { sessionEmail?: string };
```

---

## Integration notes

- The Home host listens to:
  - `home:open` (SDK trigger)  
  - `auth:done` (Auth success; `{ ok, session }`)
  - `auth:session-result` (broadcast of current session on startup)
- Hosts are **HMR‑safe singletons** and use **static imports** for React to avoid “invalid hook call” errors.
- All DOM work happens in the browser; SSR is respected.

---

## Customizing the screen

Edit `src/plugins/home/ui/HomeScreen.tsx`:
- Replace the welcome text with **cards** or **widgets** (orders, recommendations).
- Wire CTA buttons to other plug‑ins via their SDKs, e.g. `runCheckout`, `runShipping`, etc.
- Tailwind classes are available out of the box.

Example: add a “Start shopping” callback

```tsx
export function HomeScreen({ email, onClose }: { email?: string; onClose: () => void }) {
  const startShopping = () => {
    // e.g., open catalog plugin here later
    onClose();
  };

  return (
    <div className="p-6">
      {/* ... */}
      <div className="mt-6 flex gap-2">
        <button className="rounded-2xl bg-black text-white px-3 py-2" onClick={startShopping}>
          Start shopping
        </button>
      </div>
    </div>
  );
}
```

---

## Advanced: Autoload plugins globally (optional)

If you never want to add per‑page imports, create a one‑time autoloader:

```ts
// src/plugins/_autoload.ts
import.meta.glob("../plugins/**/index.ts", { eager: true });

// then once in src/main.tsx
import "./plugins/_autoload";
```

Now dropping `src/plugins/home` will auto‑mount it globally.

---

## Troubleshooting

- **Home doesn’t open after login**
  - Ensure the page imports both `@/plugins/auth` and `@/plugins/home` (or you autoload plugins).
  - For Google OAuth redirects, confirm the Auth plugin’s host emits session on startup (our latest host does this).
- **Invalid hook call**
  - Make sure your Home host uses **static imports** for React/React‑DOM (this repo already does) and that only one version of React is installed.
- **No Tailwind styles**
  - Verify `index.css` is imported in `src/main.tsx` and `tailwind.config.cjs` includes `src/**/*.{ts,tsx}` in `content`.

---

## Events (for reference)

- From Home SDK → `home:open` with `{ input: HomeOpenInput }`
- From Auth host →
  - `auth:done` → `{ ok: boolean, session?: { user: { email?: string } } }`
  - `auth:session-result` → `{ session: Session | null }`

You typically won’t need to use events directly—stick to SDKs.

---

## Unmounting / Closing

- Click **Close** inside the Home screen to hide it.
- The host remains mounted (idle) for future opens; this keeps UX snappy.

---

## License

Add your preferred license.
