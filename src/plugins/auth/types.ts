export type User = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  provider?: "password" | "google";
};

export type Session = {
  user: User;
  accessToken?: string;
};

export type SignInInput = {
  email?: string;
  password?: string;
  provider?: "password" | "google" | "demo";
};

export type SignUpInput = {
  email: string;
  password: string;
  name?: string;
};

export type AuthResult =
  | { ok: true; session: Session }
  | { ok: false; error: string };
