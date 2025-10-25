// Lightweight, optional Supabase client factory.
// If env variables are missing or @supabase/supabase-js is not installed,
// this returns null and the plugin falls back to a local demo auth.

import type { Session, User } from "../types";

export type Supa = {
  auth: {
    getSession(): Promise<{ data: { session: any | null }; error: any }>;
    signInWithPassword(opts: { email: string; password: string }): Promise<{ data: { session: any | null }; error: any }>;
    signUp(opts: { email: string; password: string; options?: { data?: any } }): Promise<{ data: any; error: any }>;
    signOut(): Promise<{ error: any }>;
    signInWithOAuth(opts: { provider: "google" }): Promise<{ data: any; error: any }>;
    onAuthStateChange(cb: (evt: string, sess: any) => void): { data: { subscription: { unsubscribe(): void } } };
  };
};

const env = {
  url: (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined,
  anon: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined,
};

export async function getSupabase(): Promise<Supa | null> {
  if (!env.url || !env.anon) return null;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(env.url, env.anon) as unknown as Supa;
    return supabase;
  } catch {
    console.warn("[auth] @supabase/supabase-js not installed. Falling back to demo auth.");
    return null;
  }
}

// Helpers to normalize Supabase session to our types.
export function toSession(raw: any | null): Session | null {
  if (!raw?.user) return null;
  const u = raw.user;
  const user: User = {
    id: u.id,
    email: u.email ?? "",
    name: u.user_metadata?.name ?? undefined,
    avatarUrl: u.user_metadata?.avatar_url ?? undefined,
    provider: u.app_metadata?.provider ?? "password",
  };
  return { user, accessToken: raw?.access_token ?? undefined };
}
