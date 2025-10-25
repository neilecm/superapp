// src/pages/Home.tsx (or Checkout.tsx)
import "@/plugins/auth";  // mounts auth host on this page
import "@/plugins/home";  // opens Home after auth success
import { ensureSession } from "@/plugins/auth";

export default function Home() {
  return (
    <button onClick={async () => {
      const res = await ensureSession();
      if (res.ok) console.log("Signed in:", res.session.user.email);
    }}>
      Sign in to continue
    </button>
  );
}
