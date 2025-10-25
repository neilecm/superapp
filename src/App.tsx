import { useEffect } from "react";
import { registry } from "@/core/registry";

export default function App() {
  // No plugins yet—this is just a clean shell.
  useEffect(() => {
    // Example: set a navigation function for future plugins
    registry.navigate = (name) => {
      console.info("[registry.navigate]", name);
      // You can implement real routing later if you want.
    };
  }, []);

  return (
    <div className="min-h-screen text-gray-900">
      <header className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <h1 className="text-xl font-semibold">Super-App Marketplace (Skeleton)</h1>
          <p className="text-sm text-gray-500">
            No plugins installed yet. This shell is ready for plug-and-play modules.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-medium">Getting Started</h2>
          <ol className="list-decimal ml-6 mt-3 space-y-2 text-sm text-gray-700">
            <li>Create a plugin folder under <code>/src/plugins/&lt;name&gt;</code>.</li>
            <li>Export a tiny SDK (e.g., <code>openX()</code> / <code>runX()</code>).</li>
            <li>Have the plugin auto-mount its host on import (modal). No App edits needed.</li>
            <li>Optionally, register the plugin in the registry for discovery.</li>
          </ol>

          <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm">
            <div className="font-semibold mb-1">Tip</div>
            Keep plugins self-contained (SDK + Host + UI). The app should only import the SDK.
          </div>
        </div>
      </main>

      <footer className="mt-10 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Your Marketplace
      </footer>
    </div>
  );
}
