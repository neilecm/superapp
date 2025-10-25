import { bus } from "@/core/bus";
import type { AuthResult, Session } from "./types";

const OPEN = "auth:open";
const DONE = "auth:done";
const SIGNOUT = "auth:signout";
const GET_SESSION = "auth:get-session";
const SESSION_RESULT = "auth:session-result";

/** Fire-and-forget auth modal (no result awaited) */
export function openAuth() {
  bus.emit(OPEN);
}

/** Ensure a session; opens modal if needed and resolves with a session */
export function ensureSession(): Promise<AuthResult> {
  return new Promise((resolve) => {
    const off = bus.on(DONE, (e) => {
      off();
      resolve((e as any).detail as AuthResult);
    });
    bus.emit(OPEN);
  });
}

/** Request current session without opening UI */
export function getSession(): Promise<Session | null> {
  return new Promise((resolve) => {
    const off = bus.on(SESSION_RESULT, (e) => {
      off();
      resolve(((e as any).detail as { session: Session | null }).session ?? null);
    });
    bus.emit(GET_SESSION);
  });
}

/** Sign out (Supabase if configured; otherwise clear mock) */
export async function signOut(): Promise<void> {
  bus.emit(SIGNOUT);
}
