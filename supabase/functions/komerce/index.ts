import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const API_KEY  = (Deno.env.get("RAJAONGKIR_KEY") || "").trim();
const API_BASE = (Deno.env.get("RAJAONGKIR_BASE") || "").replace(/\/+$/,"");
// Komerce RajaOngkir expects the header name "key"
const API_HEADER = (Deno.env.get("RAJAONGKIR_HEADER") || "key").toLowerCase(); // keep overridable

const J = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json" } });

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);

    if (url.pathname.endsWith("/_health")) {
      return J({ base: API_BASE, hasKey: !!API_KEY, header: API_HEADER });
    }

    // forward everything after /raja
    const pathAfter = url.pathname.replace(/^.*\/raja/, "");
    const target = API_BASE + pathAfter + (req.method === "GET" && url.search
      ? `?${url.searchParams.toString()}`
      : "");

    // Build upstream headers:
    const headers: Record<string, string> = {};
    // pass through client's content-type if present (important for form-url-encoded)
    const ct = req.headers.get("content-type");
    if (ct) headers["content-type"] = ct;
    // attach the RajaOngkir API key with the correct header name ("key")
    if (API_KEY) headers[API_HEADER] = API_KEY;

    const init: RequestInit = { method: req.method, headers };

    if (req.method !== "GET") {
      // send raw body as-is (JSON or x-www-form-urlencoded)
      init.body = await req.text();
    }

    const r = await fetch(target, init);

    // Try to parse JSON; if it’s HTML/text, return raw so you can see errors
    const text = await r.text();
    let data: unknown;
    try { data = JSON.parse(text); }
    catch { data = { raw: text, contentType: r.headers.get("content-type") || "" }; }

    if (url.searchParams.get("debug") === "1") {
      return J({
        proxy: { target, method: req.method, sentHeader: API_HEADER, hasKey: !!API_KEY },
        upstream: { status: r.status, ok: r.ok },
        data
      }, r.status);
    }

    return J(data, r.status);
  } catch (e) {
    return J({ error: String(e) }, 500);
  }
});
