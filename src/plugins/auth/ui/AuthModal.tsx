import { useEffect, useMemo, useState } from "react";
import type { AuthResult, Session } from "../types";
import { getSupabase, toSession } from "../services/supabase";

const hasWindow = typeof window !== "undefined";

function useSupabase() {
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const supa = await getSupabase();
      if (!mounted) return;
      setAvailable(!!supa);
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { ready, available };
}

export function AuthModal({
  onClose,
  onDone,
  requestSessionOnly = false,
}: {
  onClose: () => void;
  onDone: (res: AuthResult) => void;
  requestSessionOnly?: boolean;
}) {
  const { ready, available } = useSupabase();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !available) return;
    (async () => {
      const supa = await getSupabase();
      if (!supa) return;
      const { data } = await supa.auth.getSession();
      const sess = toSession(data.session);
      if (requestSessionOnly) {
        onDone(sess ? { ok: true, session: sess } : { ok: false, error: "NO_SESSION" });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, available, requestSessionOnly]);

  const canSubmit = useMemo(() => {
    if (tab === "signin") return Boolean(email && (password || !available)); // allow demo without pass
    return Boolean(email && password);
  }, [tab, email, password, available]);

  const signInPassword = async () => {
    setPending(true);
    setError(null);
    const supa = await getSupabase();
    try {
      if (supa) {
        const { data, error } = await supa.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const sess = toSession(data.session);
        if (!sess) throw new Error("No session returned");
        onDone({ ok: true, session: sess });
      } else {
        // DEMO: local mock auth (no backend)
        const mock: Session = {
          user: { id: cryptoRandom(), email, name: name || email.split("@")[0], provider: "password" },
        };
        localStorage.setItem("auth:mock:user", JSON.stringify(mock));
        onDone({ ok: true, session: mock });
      }
    } catch (e: any) {
      setError(e?.message ?? "Sign-in failed");
    } finally {
      setPending(false);
    }
  };

  const signUpPassword = async () => {
    setPending(true);
    setError(null);
    const supa = await getSupabase();
    try {
      if (supa) {
        const { error } = await supa.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        // Some projects require email confirmation; prompt user to check email
        await signInPassword();
      } else {
        // DEMO create local user
        const mock: Session = {
          user: { id: cryptoRandom(), email, name: name || email.split("@")[0], provider: "password" },
        };
        localStorage.setItem("auth:mock:user", JSON.stringify(mock));
        onDone({ ok: true, session: mock });
      }
    } catch (e: any) {
      setError(e?.message ?? "Sign-up failed");
    } finally {
      setPending(false);
    }
  };

  const signInGoogle = async () => {
    setPending(true);
    setError(null);
    const supa = await getSupabase();
    try {
      if (!supa) {
        setError("Google sign-in needs Supabase credentials and @supabase/supabase-js.");
        return;
      }
      const { error } = await supa.auth.signInWithOAuth({ provider: "google" });
      if (error) throw error;
      // Redirect happens; configure Auth redirect URLs in Supabase
    } catch (e: any) {
      setError(e?.message ?? "Google sign-in failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sign {tab === "signin" ? "In" : "Up"}</h2>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
          Close
        </button>
      </div>

      {!available && (
        <div className="mt-2 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800">
          Supabase not configured. Using <b>demo auth</b>. To enable real auth, set{" "}
          <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> and install{" "}
          <code>@supabase/supabase-js</code>.
        </div>
      )}

      <div className="mt-3 flex gap-2 text-sm">
        <button
          className={`px-3 py-1 rounded-xl ${tab === "signin" ? "bg-black text-white" : "bg-gray-200"}`}
          onClick={() => setTab("signin")}
        >
          Sign In
        </button>
        <button
          className={`px-3 py-1 rounded-xl ${tab === "signup" ? "bg-black text-white" : "bg-gray-200"}`}
          onClick={() => setTab("signup")}
        >
          Sign Up
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        <input
          className="border rounded-xl p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        {(tab === "signup" || available) && (
          <input
            className="border rounded-xl p-2"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
        )}
        {tab === "signup" && (
          <input
            className="border rounded-xl p-2"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
          />
        )}

        {error && <div className="text-red-600 text-sm">{error}</div>}

        {tab === "signin" ? (
          <button
            disabled={!canSubmit || pending}
            onClick={signInPassword}
            className="rounded-2xl bg-black text-white px-3 py-2 disabled:opacity-50"
          >
            {available ? (pending ? "Signing in…" : "Sign In") : pending ? "Starting…" : "Demo Sign In"}
          </button>
        ) : (
          <button
            disabled={!canSubmit || pending}
            onClick={signUpPassword}
            className="rounded-2xl bg-black text-white px-3 py-2 disabled:opacity-50"
          >
            {pending ? "Creating…" : "Create Account"}
          </button>
        )}

        {available && (
          <button onClick={signInGoogle} className="rounded-2xl bg-gray-900/80 text-white px-3 py-2">
            Continue with Google
          </button>
        )}
      </div>
    </div>
  );
}

// Simple random id
function cryptoRandom() {
  if (hasWindow && "crypto" in window && "randomUUID" in window.crypto) {
    return (window.crypto as any).randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
