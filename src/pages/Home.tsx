// src/pages/Home.tsx (or Checkout.tsx)
import "@/plugins/auth";  // mounts auth host on this page
import "@/plugins/home";  // opens Home after auth success
import { ensureSession } from "@/plugins/auth";
import "@/plugins/catalog";   // mounts Catalog host so it can open


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

//BEGIN CATALOG PLUGIN
import "@/plugins/catalog";            // mounts the Catalog host for this page
import { runCatalog } from "@/plugins/catalog";

const res = await runCatalog();        // opens a modal grid of mock products
if (res.ok) {
  console.log("Selected item:", res.item);
  // next step: hand off to Shipping/Checkout plugins later
}
//END CATALOG PLUGIN
