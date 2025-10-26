import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const API_KEY  = (Deno.env.get("RAJAONGKIR_KEY") || "").trim();
const API_BASE = (Deno.env.get("RAJAONGKIR_BASE") || "").replace(/\/+$/,"");
const API_HEADER = (Deno.env.get("RAJAONGKIR_HEADER") || "key").toLowerCase(); // "key" | "x-api-key"

const J = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json" } });

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);

    // health
    if (url.pathname.endsWith("/_health")) {
      return J({ base: API_BASE, hasKey: !!API_KEY, header: API_HEADER });
    }

    // forward everything after /raja
    const pathAfter = url.pathname.replace(/^.*\/raja/, "");
    const target =
      API_BASE + pathAfter + (req.method === "GET" && url.search ? `?${url.searchParams.toString()}` : "");

    const headers: Record<string, string> = { "content-type": "application/json" };
    if (API_KEY) headers[API_HEADER] = API_KEY;

    const init: RequestInit = { method: req.method, headers };
    if (req.method !== "GET") init.body = await req.text();

    const r = await fetch(target, init);

    // try JSON; fallback to text so we can see HTML/404 pages
    const text = await r.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch {
      data = { raw: text, contentType: r.headers.get("content-type") || "" };
    }

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
