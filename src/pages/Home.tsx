// src/pages/Checkout.tsx (or Home.tsx, etc.)
import "@/plugins/auth"; // mounts the Auth modal host only on this page
import { ensureSession } from "@/plugins/auth"; // (optional) use SDK

export default function Checkout() {
  return (
    <button onClick={async () => {
      const res = await ensureSession();
      if (res.ok) console.log("Signed in:", res.session.user.email);
    }}>
      Sign in to continue
    </button>
  );
}
